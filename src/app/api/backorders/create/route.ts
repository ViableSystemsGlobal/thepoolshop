import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/backorders/create - Create backorders from quotations or proformas when stock is insufficient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderType, orderId, orderNumber } = body;

    if (!orderType || !orderId || !orderNumber) {
      return NextResponse.json(
        { error: "orderType, orderId, and orderNumber are required" },
        { status: 400 }
      );
    }

    let orderLines = [];
    let accountId = '';
    let ownerId = '';

    // Get order lines based on type
    if (orderType === 'QUOTATION') {
      const quotation = await prisma.quotation.findUnique({
        where: { id: orderId },
        include: {
          lines: {
            include: {
              product: {
                include: {
                  stockItems: true
                }
              }
            }
          }
        }
      });

      if (!quotation) {
        return NextResponse.json(
          { error: "Quotation not found" },
          { status: 404 }
        );
      }

      orderLines = quotation.lines;
      accountId = quotation.accountId || '';
      ownerId = quotation.ownerId;
    } else if (orderType === 'PROFORMA') {
      const proforma = await prisma.proforma.findUnique({
        where: { id: orderId },
        include: {
          lines: {
            include: {
              product: {
                include: {
                  stockItems: true
                }
              }
            }
          }
        }
      });

      if (!proforma) {
        return NextResponse.json(
          { error: "Proforma not found" },
          { status: 404 }
        );
      }

      orderLines = proforma.lines;
      accountId = proforma.accountId || '';
      ownerId = proforma.ownerId;
    } else {
      return NextResponse.json(
        { error: "Invalid order type. Must be QUOTATION or PROFORMA" },
        { status: 400 }
      );
    }

    const createdBackorders = [];

    // Process each line to check stock availability
    for (const line of orderLines) {
      const product = line.product;
      const totalAvailableStock = product.stockItems.reduce((sum, item) => sum + item.available, 0);
      
      // If ordered quantity exceeds available stock, create a backorder
      if (line.quantity > totalAvailableStock) {
        const backorderQuantity = line.quantity - totalAvailableStock;
        
        // Check if backorder already exists for this order and product
        const existingBackorder = await prisma.backorder.findFirst({
          where: {
            orderId: orderId,
            orderType: orderType,
            productId: product.id
          }
        });

        if (!existingBackorder) {
          const backorder = await prisma.backorder.create({
            data: {
              orderNumber: orderNumber,
              orderType: orderType,
              orderId: orderId,
              productId: product.id,
              quantity: line.quantity,
              quantityFulfilled: Math.max(0, totalAvailableStock),
              quantityPending: backorderQuantity,
              unitPrice: line.unitPrice,
              lineTotal: line.lineTotal,
              status: totalAvailableStock > 0 ? 'PARTIALLY_FULFILLED' : 'PENDING',
              priority: 'NORMAL',
              accountId: accountId,
              ownerId: ownerId,
              notes: `Auto-created from ${orderType.toLowerCase()} ${orderNumber}`
            }
          });

          createdBackorders.push(backorder);
        }
      }
    }

    return NextResponse.json({
      success: true,
      createdBackorders,
      message: `Created ${createdBackorders.length} backorders for ${orderType.toLowerCase()} ${orderNumber}`
    });
  } catch (error) {
    console.error("Error creating backorders:", error);
    return NextResponse.json(
      { error: "Failed to create backorders" },
      { status: 500 }
    );
  }
}
