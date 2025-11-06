import { NextRequest, NextResponse } from "next/server";

// GET /api/public/shop/payment/verify - Verify payment status (for callback page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      const metadata = data.data.metadata || {};
      const invoiceId = metadata.invoiceId;

      return NextResponse.json({
        success: true,
        verified: true,
        invoiceId: invoiceId,
        amount: data.data.amount / 100, // Convert from pesewas to GHS
        currency: data.data.currency,
        reference: reference,
        gatewayResponse: data.data.gateway_response,
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: data.data.gateway_response || "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

