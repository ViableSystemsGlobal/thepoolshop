import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "adpools-secret-key-2024-production-change-me";

// Helper to find or create Account from Lead
async function findOrCreateAccountFromLead(leadId: string, userId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Try to find existing account by email
  if (lead.email) {
    const existingAccount = await prisma.account.findFirst({
      where: { email: lead.email },
    });

    if (existingAccount) {
      return existingAccount;
    }
  }

  // Create new account from lead
  const accountName = lead.company || `${lead.firstName} ${lead.lastName}`;
  const account = await prisma.account.create({
    data: {
      name: accountName,
      email: lead.email || null,
      phone: lead.phone || null,
      type: lead.leadType === "COMPANY" ? "COMPANY" : "INDIVIDUAL",
      ownerId: userId,
      address: lead.billingAddress ? JSON.stringify(lead.billingAddress) : null,
      city: lead.billingAddress && typeof lead.billingAddress === 'object' 
        ? (lead.billingAddress as any).city || null 
        : null,
      state: lead.billingAddress && typeof lead.billingAddress === 'object'
        ? (lead.billingAddress as any).region || null
        : null,
      country: lead.billingAddress && typeof lead.billingAddress === 'object'
        ? (lead.billingAddress as any).country || null
        : "Ghana",
    },
  });

  return account;
}

// POST /api/public/shop/payment/initiate - Initiate payment gateway transaction
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invoiceId, paymentMethod, amount } = body;

    if (!invoiceId || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: "Invoice ID, payment method, and amount are required" },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        lead: {
          email: customer.email,
        },
      },
      include: {
        lead: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Get system user for payment creation
    const systemUser = await prisma.user.findFirst({
      where: {
        OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }],
      },
    });

    if (!systemUser) {
      return NextResponse.json(
        { error: "System user not found" },
        { status: 500 }
      );
    }

    // For now, we'll support Paystack and Flutterwave
    // Check if payment gateway is configured
    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
    const flutterwavePublicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;

    if (!paystackPublicKey && !flutterwavePublicKey) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Use Paystack by default if available, otherwise Flutterwave
    const gateway = paystackPublicKey ? "paystack" : "flutterwave";

    // Create payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Prepare payment data for gateway
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit (pesewas for GHS)
      email: customer.email,
      reference: paymentReference,
      currency: "GHS",
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
    };

    // Initialize payment with gateway
    let gatewayResponse;
    if (gateway === "paystack") {
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        return NextResponse.json(
          { error: "Paystack secret key not configured" },
          { status: 500 }
        );
      }

      // Initialize Paystack transaction
      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          email: paymentData.email,
          reference: paymentData.reference,
          currency: paymentData.currency,
          metadata: paymentData.metadata,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shop/payment/callback`,
        }),
      });

      if (!paystackResponse.ok) {
        const errorData = await paystackResponse.json();
        console.error("Paystack error:", errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to initialize payment" },
          { status: 500 }
        );
      }

      gatewayResponse = await paystackResponse.json();
    } else {
      // Flutterwave implementation would go here
      return NextResponse.json(
        { error: "Flutterwave not yet implemented" },
        { status: 501 }
      );
    }

    // Store payment reference in invoice notes for tracking
    // The actual Payment record will be created when webhook confirms
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        notes: `${invoice.notes || ""}\nPayment Reference: ${paymentReference} (${gateway.toUpperCase()})`.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      paymentReference: paymentReference,
      authorizationUrl: gatewayResponse.data.authorization_url,
      accessCode: gatewayResponse.data.access_code,
      gateway: gateway,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

