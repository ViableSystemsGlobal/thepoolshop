import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { convertCurrency } from "@/lib/currency";

// Helper to generate order number
function generateOrderNumber(): string {
  const prefix = "ORD";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// POST /api/public/shop/checkout - Process checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer,
      shippingAddress,
      billingAddress,
      paymentMethod = "CASH",
      notes,
    } = body;

    // Validate required fields
    if (!customer || !customer.email || !customer.name) {
      return NextResponse.json(
        { error: "Customer information is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Get cart session
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cart_session")?.value;
    
    if (!cartId) {
      return NextResponse.json(
        { error: "No cart found" },
        { status: 400 }
      );
    }

    const cartData = cookieStore.get(`cart_${cartId}`)?.value;
    
    if (!cartData) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const cart = JSON.parse(cartData);
    
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if customer exists or create new lead
      let lead = await tx.lead.findFirst({
        where: {
          email: customer.email,
        },
      });

      // Get default system user (for owner assignment) - moved outside if block
      let systemUser = await tx.user.findFirst({
        where: {
          OR: [
            { role: "ADMIN" },
            { role: "SUPER_ADMIN" }
          ]
        },
      });

      // If no admin user found, create a default one
      if (!systemUser) {
        systemUser = await tx.user.create({
          data: {
            email: "system@thepoolshop.africa",
            name: "System User",
            role: "ADMIN",
          },
        });
      }

      if (!lead) {
        // Create new lead from customer
        const [firstName, ...lastNameParts] = customer.name.split(" ");
        const lastName = lastNameParts.join(" ") || firstName;

        lead = await tx.lead.create({
          data: {
            firstName,
            lastName,
            email: customer.email,
            phone: customer.phone || "",
            company: customer.company,
            status: "NEW",
            leadType: "INDIVIDUAL",
            source: "ECOMMERCE",
            subject: "Online Store Customer",
            ownerId: systemUser ? systemUser.id : "system",
            billingAddress: billingAddress || shippingAddress,
            shippingAddress: shippingAddress,
            hasBillingAddress: true,
            hasShippingAddress: true,
            sameAsBilling: !billingAddress,
          },
        });
      }

      // Create quotation from cart
      const quotationNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate totals
      let subtotal = 0;
      const quotationLines = [];
      
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { stockItems: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const totalStock = product.stockItems.reduce(
          (sum, si) => sum + si.available,
          0
        );

        if (totalStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${totalStock}, Requested: ${item.quantity}`
          );
        }

        // Convert product price from its base currency to GHS
        let unitPriceInGHS = product.price || 0;
        const baseCurrency = product.baseCurrency || "GHS";
        
        if (baseCurrency !== "GHS" && product.price) {
          const priceConversion = await convertCurrency(baseCurrency, "GHS", product.price);
          if (priceConversion) {
            unitPriceInGHS = priceConversion.convertedAmount;
          } else {
            console.warn(`Failed to convert price for product ${product.id} from ${baseCurrency} to GHS`);
          }
        }

        const lineTotal = unitPriceInGHS * item.quantity;
        subtotal += lineTotal;

        quotationLines.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: unitPriceInGHS, // Store in GHS
          discount: 0,
          lineTotal,
        });
      }

      const tax = subtotal * 0.125; // 12.5% VAT
      const total = subtotal + tax;


      // Create quotation
      const quotation = await tx.quotation.create({
        data: {
          number: quotationNumber,
          status: "SENT",
          subject: `Online Order - ${customer.name}`,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          notes: notes || "Order placed via online store",
          currency: "GHS",
          subtotal,
          tax,
          total,
          taxInclusive: true,
          leadId: lead.id,
          ownerId: systemUser ? systemUser.id : "system",
          customerType: "STANDARD",
          billingAddressSnapshot: billingAddress || shippingAddress,
          shippingAddressSnapshot: shippingAddress,
          lines: {
            create: quotationLines,
          },
        },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create invoice from quotation
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          subject: `Invoice - ${customer.name}`,
          quotationId: quotation.id,
          leadId: lead.id,
          status: "SENT",
          paymentStatus: paymentMethod === "ONLINE" || paymentMethod === "PAYSTACK" ? "UNPAID" : "UNPAID", // Will be updated by webhook when payment is confirmed
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          currency: "GHS",
          subtotal,
          tax,
          discount: 0,
          total,
          amountPaid: 0,
          amountDue: total,
          taxInclusive: true,
          paymentTerms: "Net 7 days",
          customerType: "STANDARD",
          billingAddressSnapshot: billingAddress || shippingAddress,
          shippingAddressSnapshot: shippingAddress,
          notes: `Payment Method: ${paymentMethod}\n${notes || ""}`,
          ownerId: systemUser ? systemUser.id : "system",
          lines: {
            create: quotationLines.map(line => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discount: line.discount,
              lineTotal: line.lineTotal,
            })),
          },
        },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update stock levels
      for (const item of cart.items) {
        // Get stock items for the product
        const stockItems = await tx.stockItem.findMany({
          where: {
            productId: item.productId,
            available: { gt: 0 },
          },
          orderBy: {
            available: "asc", // Use items with less stock first (FIFO-ish)
          },
        });

        let remainingQuantity = item.quantity;

        for (const stockItem of stockItems) {
          if (remainingQuantity <= 0) break;

          const quantityToDeduct = Math.min(
            remainingQuantity,
            stockItem.available
          );

          // Update stock item
          await tx.stockItem.update({
            where: { id: stockItem.id },
            data: {
              available: stockItem.available - quantityToDeduct,
              reserved: stockItem.reserved + quantityToDeduct,
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              stockItemId: stockItem.id,
              type: "SALE",
              quantity: -quantityToDeduct,
              reference: invoice.number,
              reason: "Online store sale",
              notes: "Invoice: " + invoice.number,
              warehouseId: stockItem.warehouseId,
            },
          });

          remainingQuantity -= quantityToDeduct;
        }
      }

      return {
        quotation,
        invoice,
        lead,
      };
    });

    // Clear the cart after successful transaction
    const clearCookieStore = await cookies();
    clearCookieStore.delete(`cart_${cartId}`);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: {
        quotationNumber: result.quotation.number,
        invoiceNumber: result.invoice.number,
        total: result.invoice.total,
        currency: result.invoice.currency,
        status: "PROCESSING",
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Checkout failed"
      },
      { status: 500 }
    );
  }
}
