import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { convertCurrency } from "@/lib/currency";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "adpools-secret-key-2024-production-change-me";

// GET /api/public/shop/orders - Get customer orders
export async function GET(request: NextRequest) {
  try {
    // Get customer token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      console.error("Token verification failed:", error);
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

    // Get customer from database
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    if (!customer) {
      console.error("Customer not found for ID:", decoded.id);
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    console.log("Fetching orders for customer:", customer.email);

    // Get search params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {
      lead: {
        email: customer.email,
      },
    };

    if (status && status !== "all") {
      where.status = status;
    }

    // Fetch invoices (orders) for this customer
    console.log("Querying invoices with where clause:", JSON.stringify(where, null, 2));
    let invoices = [];
    try {
      invoices = await prisma.invoice.findMany({
        where,
        include: {
          quotation: {
            include: {
              lines: {
                include: {
                  product: true,
                },
              },
            },
          },
          lines: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: true,
                  baseCurrency: true,
                },
              },
            },
          },
          lead: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              company: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      
      console.log(`Found ${invoices.length} invoices for customer`);
    } catch (dbError) {
      console.error("Database error fetching invoices:", dbError);
      throw new Error(`Database query failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }

    // Get total count
    const total = await prisma.invoice.count({ where });

    // Transform invoices to orders format
    const orders = await Promise.all(invoices.map(async (invoice) => {
      try {
        const invoiceCurrency = invoice.currency || "GHS";
        
        // Parse images for products and convert prices
        const items = await Promise.all((invoice.lines || []).map(async (line) => {
          try {
            let images = [];
            if (line.product?.images) {
              try {
                images = JSON.parse(line.product.images);
              } catch {
                images = [line.product.images];
              }
            }

            // Convert unit price to GHS
            // Check product's base currency first, then fall back to invoice currency
            let unitPriceInGHS = line.unitPrice || 0;
            const productBaseCurrency = line.product?.baseCurrency || invoiceCurrency;
            const sourceCurrency = productBaseCurrency || invoiceCurrency || "GHS";
            
            if (sourceCurrency !== "GHS" && line.unitPrice) {
              try {
                const priceConversion = await convertCurrency(sourceCurrency, "GHS", line.unitPrice);
                if (priceConversion) {
                  unitPriceInGHS = priceConversion.convertedAmount;
                } else {
                  console.warn(`Failed to convert unit price from ${sourceCurrency} to GHS for product ${line.productId}, using original price`);
                }
              } catch (conversionError) {
                console.error(`Currency conversion error for product ${line.productId}:`, conversionError);
                // Continue with original price if conversion fails
              }
            }

            // Convert discount using same currency as unit price
            let discountInGHS = line.discount || 0;
            if (sourceCurrency !== "GHS" && line.discount) {
              try {
                const discountConversion = await convertCurrency(sourceCurrency, "GHS", line.discount);
                if (discountConversion) {
                  discountInGHS = discountConversion.convertedAmount;
                }
              } catch (conversionError) {
                console.error(`Discount conversion error:`, conversionError);
                // Continue with original discount if conversion fails
              }
            }

            // Calculate line total in GHS
            const lineTotalInGHS = (unitPriceInGHS * line.quantity) - discountInGHS;

            return {
              id: line.id,
              productId: line.productId,
              productName: line.product?.name || "Product",
              productSku: line.product?.sku || "",
              quantity: line.quantity,
              unitPrice: unitPriceInGHS,
              discount: discountInGHS,
              lineTotal: lineTotalInGHS,
              image: images[0] || null,
            };
          } catch (lineError) {
            console.error(`Error processing line ${line.id}:`, lineError);
            // Return a minimal line item if processing fails
            return {
              id: line.id,
              productId: line.productId,
              productName: line.product?.name || "Product",
              productSku: line.product?.sku || "",
              quantity: line.quantity || 0,
              unitPrice: line.unitPrice || 0,
              discount: line.discount || 0,
              lineTotal: ((line.unitPrice || 0) * (line.quantity || 0)) - (line.discount || 0),
              image: null,
            };
          }
        }));

      // Determine order status
      let orderStatus = "PENDING";
      if (invoice.status === "PAID" || invoice.paymentStatus === "PAID") {
        orderStatus = "COMPLETED";
      } else if (invoice.status === "SENT") {
        orderStatus = "PROCESSING";
      } else if (invoice.status === "CANCELLED") {
        orderStatus = "CANCELLED";
      }

      // Recalculate totals from converted line items (more accurate than converting invoice totals)
      const recalculatedSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const recalculatedTax = recalculatedSubtotal * 0.125; // 12.5% VAT
      const recalculatedTotal = recalculatedSubtotal + recalculatedTax;
      
      // Use recalculated totals from converted line items (more accurate)
      let subtotalInGHS = recalculatedSubtotal;
      let taxInGHS = recalculatedTax;
      let discountInGHS = invoice.discount || 0;
      let totalInGHS = recalculatedTotal;
      let amountPaidInGHS = invoice.amountPaid || 0;
      let amountDueInGHS = invoice.amountDue || 0;

      // Convert payment-related amounts if invoice currency is not GHS
      if (invoiceCurrency !== "GHS") {
        if (invoice.discount) {
          const discountConversion = await convertCurrency(invoiceCurrency, "GHS", invoice.discount);
          if (discountConversion) {
            discountInGHS = discountConversion.convertedAmount;
          }
        }
        if (invoice.amountPaid) {
          const amountPaidConversion = await convertCurrency(invoiceCurrency, "GHS", invoice.amountPaid);
          if (amountPaidConversion) {
            amountPaidInGHS = amountPaidConversion.convertedAmount;
          }
        }
        if (invoice.amountDue) {
          const amountDueConversion = await convertCurrency(invoiceCurrency, "GHS", invoice.amountDue);
          if (amountDueConversion) {
            amountDueInGHS = amountDueConversion.convertedAmount;
          }
        }
      }

      // Parse addresses
      let shippingAddress = null;
      let billingAddress = null;
      
      try {
        if (invoice.shippingAddressSnapshot) {
          shippingAddress = typeof invoice.shippingAddressSnapshot === 'string' 
            ? JSON.parse(invoice.shippingAddressSnapshot)
            : invoice.shippingAddressSnapshot;
        }
        if (invoice.billingAddressSnapshot) {
          billingAddress = typeof invoice.billingAddressSnapshot === 'string'
            ? JSON.parse(invoice.billingAddressSnapshot) 
            : invoice.billingAddressSnapshot;
        }
      } catch (e) {
        console.error("Error parsing addresses:", e);
      }

      return {
        id: invoice.id,
        orderNumber: invoice.number,
        quotationNumber: invoice.quotation?.number,
        status: orderStatus,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentTerms || "CASH",
        orderDate: invoice.issueDate || invoice.createdAt,
        dueDate: invoice.dueDate,
        currency: "GHS", // Always return in GHS
        subtotal: subtotalInGHS,
        tax: taxInGHS,
        discount: discountInGHS,
        total: totalInGHS,
        amountPaid: amountPaidInGHS,
        amountDue: amountDueInGHS,
        items: items,
        itemCount: items.length,
        customer: {
          name: `${invoice.lead?.firstName || ""} ${invoice.lead?.lastName || ""}`.trim() || invoice.lead?.email,
          email: invoice.lead?.email,
          phone: invoice.lead?.phone,
          company: invoice.lead?.company,
        },
        shippingAddress,
        billingAddress,
        notes: invoice.notes,
      };
      } catch (invoiceError) {
        console.error(`Error processing invoice ${invoice.id}:`, invoiceError);
        // Return a simplified version if processing fails
        return {
          id: invoice.id,
          orderNumber: invoice.number,
          status: "ERROR",
          paymentStatus: invoice.paymentStatus,
          paymentMethod: invoice.paymentTerms || "CASH",
          orderDate: invoice.issueDate || invoice.createdAt,
          currency: invoice.currency || "GHS",
          subtotal: invoice.subtotal || 0,
          tax: invoice.tax || 0,
          total: invoice.total || 0,
          items: [],
          itemCount: 0,
          customer: {
            name: `${invoice.lead?.firstName || ""} ${invoice.lead?.lastName || ""}`.trim() || invoice.lead?.email || "Unknown",
            email: invoice.lead?.email || "",
          },
        };
      }
    }));

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    console.error("Error details:", error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { 
        error: "Failed to fetch orders",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// GET order by ID (via POST for body support)
export async function POST(request: NextRequest) {
  try {
    // Get customer token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      console.error("Token verification failed:", error);
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

    // Get order ID from body
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch invoice (order) with customer validation
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: orderId,
        lead: {
          email: decoded.email,
        },
      },
      include: {
        quotation: {
          include: {
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
        lead: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            company: true,
            billingAddress: true,
            shippingAddress: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Transform invoice to detailed order format
    const invoiceCurrency = invoice.currency || "GHS";
    const items = await Promise.all((invoice.lines || []).map(async (line) => {
      let images = [];
      if (line.product?.images) {
        try {
          images = JSON.parse(line.product.images);
        } catch {
          images = [line.product.images];
        }
      }

      let attributes = {};
      if (line.product?.attributes) {
        try {
          attributes = JSON.parse(line.product.attributes as string);
        } catch {
          attributes = {};
        }
      }

      // Convert unit price to GHS
      // Check product's base currency first, then fall back to invoice currency
      let unitPriceInGHS = line.unitPrice || 0;
      const productBaseCurrency = line.product?.baseCurrency || invoiceCurrency;
      const sourceCurrency = productBaseCurrency || invoiceCurrency || "GHS";
      
      if (sourceCurrency !== "GHS" && line.unitPrice) {
        const priceConversion = await convertCurrency(sourceCurrency, "GHS", line.unitPrice);
        if (priceConversion) {
          unitPriceInGHS = priceConversion.convertedAmount;
        } else {
          console.warn(`Failed to convert unit price from ${sourceCurrency} to GHS for product ${line.productId}`);
        }
      }

      // Convert discount using same currency as unit price
      let discountInGHS = line.discount || 0;
      if (sourceCurrency !== "GHS" && line.discount) {
        const discountConversion = await convertCurrency(sourceCurrency, "GHS", line.discount);
        if (discountConversion) {
          discountInGHS = discountConversion.convertedAmount;
        }
      }

      // Calculate line total in GHS
      const lineTotalInGHS = (unitPriceInGHS * line.quantity) - discountInGHS;

      return {
        id: line.id,
        productId: line.productId,
        productName: line.product?.name || "Product",
        productDescription: line.product?.description,
        productSku: line.product?.sku || "",
        quantity: line.quantity,
        unitPrice: unitPriceInGHS,
        discount: discountInGHS,
        lineTotal: lineTotalInGHS,
        images: images,
        attributes: attributes,
      };
    }));

    // Determine order status
    let orderStatus = "PENDING";
    if (invoice.status === "PAID" || invoice.paymentStatus === "PAID") {
      orderStatus = "COMPLETED";
    } else if (invoice.status === "SENT") {
      orderStatus = "PROCESSING";
    } else if (invoice.status === "CANCELLED") {
      orderStatus = "CANCELLED";
    }

    // Recalculate totals from converted line items (more accurate than converting invoice totals)
    const recalculatedSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const recalculatedTax = recalculatedSubtotal * 0.125; // 12.5% VAT
    const recalculatedTotal = recalculatedSubtotal + recalculatedTax;
    
    // Use recalculated totals from converted line items (more accurate)
    let subtotalInGHS = recalculatedSubtotal;
    let taxInGHS = recalculatedTax;
    let discountInGHS = invoice.discount || 0;
    let totalInGHS = recalculatedTotal;
    let amountPaidInGHS = invoice.amountPaid || 0;
    let amountDueInGHS = invoice.amountDue || 0;

    // Convert payment-related amounts if invoice currency is not GHS
    if (invoiceCurrency !== "GHS") {
        if (invoice.discount) {
          const discountConversion = await convertCurrency(invoiceCurrency, "GHS", invoice.discount);
          if (discountConversion) {
            discountInGHS = discountConversion.convertedAmount;
          }
        }
        if (invoice.amountPaid) {
          const amountPaidConversion = await convertCurrency(invoiceCurrency, "GHS", invoice.amountPaid);
          if (amountPaidConversion) {
            amountPaidInGHS = amountPaidConversion.convertedAmount;
          }
        }
        if (invoice.amountDue) {
          const amountDueConversion = await convertCurrency(invoiceCurrency, "GHS", invoice.amountDue);
          if (amountDueConversion) {
            amountDueInGHS = amountDueConversion.convertedAmount;
          }
        }
      }

      // Convert payment amounts
      const paymentsInGHS = await Promise.all((invoice.payments || []).map(async (payment) => {
        let amountInGHS = payment.amount || 0;
        if (invoiceCurrency !== "GHS" && payment.amount) {
          const paymentConversion = await convertCurrency(invoiceCurrency, "GHS", payment.amount);
          if (paymentConversion) {
            amountInGHS = paymentConversion.convertedAmount;
          }
        }
        return {
          id: payment.id,
          amount: amountInGHS,
          method: payment.method,
          reference: payment.reference,
          date: payment.createdAt,
          notes: payment.notes,
        };
      }));

      // Parse addresses
      let shippingAddress = null;
      let billingAddress = null;
      
      try {
        if (invoice.shippingAddressSnapshot) {
          shippingAddress = typeof invoice.shippingAddressSnapshot === 'string' 
            ? JSON.parse(invoice.shippingAddressSnapshot)
            : invoice.shippingAddressSnapshot;
        }
        if (invoice.billingAddressSnapshot) {
          billingAddress = typeof invoice.billingAddressSnapshot === 'string'
            ? JSON.parse(invoice.billingAddressSnapshot) 
            : invoice.billingAddressSnapshot;
        }
      } catch (e) {
        console.error("Error parsing addresses:", e);
      }

      const order = {
        id: invoice.id,
        orderNumber: invoice.number,
        quotationNumber: invoice.quotation?.number,
        status: orderStatus,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentTerms || "CASH",
        orderDate: invoice.issueDate || invoice.createdAt,
        dueDate: invoice.dueDate,
        currency: "GHS", // Always return in GHS
        subtotal: subtotalInGHS,
        tax: taxInGHS,
        discount: discountInGHS,
        total: totalInGHS,
        amountPaid: amountPaidInGHS,
        amountDue: amountDueInGHS,
      items: items,
      itemCount: items.length,
      customer: {
        name: `${invoice.lead?.firstName || ""} ${invoice.lead?.lastName || ""}`.trim() || invoice.lead?.email,
        email: invoice.lead?.email,
        phone: invoice.lead?.phone,
        company: invoice.lead?.company,
      },
        shippingAddress,
        billingAddress,
        notes: invoice.notes,
        payments: paymentsInGHS,
      timeline: [
        {
          status: "ORDER_PLACED",
          date: invoice.createdAt,
          description: "Order was placed",
        },
        ...(invoice.status === "SENT" || invoice.status === "PAID" ? [{
          status: "PROCESSING",
          date: invoice.issueDate || invoice.createdAt,
          description: "Order is being processed",
        }] : []),
        ...(invoice.paymentStatus === "PAID" ? [{
          status: "PAYMENT_RECEIVED",
          date: invoice.payments[0]?.createdAt || invoice.updatedAt,
          description: "Payment has been received",
        }] : []),
        ...(invoice.status === "PAID" ? [{
          status: "COMPLETED",
          date: invoice.updatedAt,
          description: "Order has been completed",
        }] : []),
      ],
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
