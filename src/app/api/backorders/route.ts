import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/backorders - Get actual customer orders that cannot be fulfilled due to insufficient stock
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'PENDING', 'PARTIALLY_FULFILLED', 'all'
    const priority = searchParams.get('priority'); // 'LOW', 'NORMAL', 'HIGH', 'URGENT', 'all'
    const account = searchParams.get('account');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for filtering
    const where: any = {
      status: {
        in: ['PENDING', 'PARTIALLY_FULFILLED']
      }
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (account) {
      where.accountId = account;
    }

    // Get backorders with related data
    let backorders = [];
    try {
      backorders = await prisma.backorder.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            category: {
              select: {
                id: true,
                name: true
              }
            },
            stockItems: {
              include: {
                warehouse: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        },
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit,
      skip: offset,
    });
    } catch (error) {
      console.error('Error fetching backorders:', error);
      // Return empty result if there's an error
      return NextResponse.json({
        backorders: [],
        summary: {
          total: 0,
          pending: 0,
          partiallyFulfilled: 0,
          urgent: 0,
          high: 0,
          totalValue: 0,
          totalQuantity: 0
        }
      });
    }

    // Calculate summary statistics
    let allBackorders = [];
    try {
      allBackorders = await prisma.backorder.findMany({
        where: {
          status: {
            in: ['PENDING', 'PARTIALLY_FULFILLED']
          }
        }
      });
    } catch (error) {
      console.error('Error fetching backorders for summary:', error);
      allBackorders = [];
    }

    const summary = {
      total: allBackorders.length,
      pending: allBackorders.filter(b => b.status === 'PENDING').length,
      partiallyFulfilled: allBackorders.filter(b => b.status === 'PARTIALLY_FULFILLED').length,
      urgent: allBackorders.filter(b => b.priority === 'URGENT').length,
      high: allBackorders.filter(b => b.priority === 'HIGH').length,
      totalValue: allBackorders.reduce((sum, b) => sum + b.lineTotal, 0),
      totalQuantity: allBackorders.reduce((sum, b) => sum + b.quantityPending, 0)
    };

    return NextResponse.json({
      backorders,
      summary,
      total: backorders.length,
      hasMore: offset + backorders.length < allBackorders.length,
    });
  } catch (error) {
    console.error("Error fetching backorders:", error);
    return NextResponse.json(
      { error: "Failed to fetch backorders" },
      { status: 500 }
    );
  }
}

// POST /api/backorders - Handle backorder actions (fulfill, update priority, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, backorderIds, quantity, notes } = body;

    if (!action || !backorderIds || !Array.isArray(backorderIds)) {
      return NextResponse.json(
        { error: "Action and backorderIds are required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const backorderId of backorderIds) {
      try {
        const backorder = await prisma.backorder.findUnique({
          where: { id: backorderId },
          include: {
            product: {
              include: {
                stockItems: true
              }
            }
          }
        });

        if (!backorder) {
          results.push({
            backorderId,
            action: 'error',
            error: 'Backorder not found'
          });
          continue;
        }

        if (action === 'fulfill') {
          // Fulfill backorder (create stock movement and update backorder)
          const fulfillQuantity = quantity || backorder.quantityPending;
          
          if (fulfillQuantity > backorder.quantityPending) {
            results.push({
              backorderId,
              action: 'error',
              error: 'Fulfill quantity exceeds pending quantity'
            });
            continue;
          }

          // Find the stock item to update
          const stockItem = backorder.product.stockItems[0];
          if (!stockItem) {
            results.push({
              backorderId,
              action: 'error',
              error: 'No stock item found for product'
            });
            continue;
          }

          // Create stock movement for the sale
          await prisma.stockMovement.create({
            data: {
              productId: backorder.productId,
              stockItemId: stockItem.id,
              type: 'SALE',
              quantity: -fulfillQuantity, // Negative for sale
              unitCost: backorder.unitPrice,
              totalCost: fulfillQuantity * backorder.unitPrice,
              reference: backorder.orderNumber,
              reason: 'Backorder Fulfillment',
              notes: notes || `Fulfilled backorder ${backorder.orderNumber}`,
              warehouseId: stockItem.warehouseId
            }
          });

          // Update backorder
          const newQuantityFulfilled = backorder.quantityFulfilled + fulfillQuantity;
          const newQuantityPending = backorder.quantity - newQuantityFulfilled;
          const newStatus = newQuantityPending <= 0 ? 'FULFILLED' : 'PARTIALLY_FULFILLED';

          await prisma.backorder.update({
            where: { id: backorderId },
            data: {
              quantityFulfilled: newQuantityFulfilled,
              quantityPending: newQuantityPending,
              status: newStatus,
              fulfilledAt: newStatus === 'FULFILLED' ? new Date() : null,
              notes: notes || backorder.notes
            }
          });

          results.push({
            backorderId,
            action: 'fulfilled',
            quantity: fulfillQuantity,
            newStatus
          });

        } else if (action === 'update_priority') {
          // Update backorder priority
          await prisma.backorder.update({
            where: { id: backorderId },
            data: {
              priority: body.priority || backorder.priority,
              notes: notes || backorder.notes
            }
          });

          results.push({
            backorderId,
            action: 'priority_updated',
            newPriority: body.priority
          });

        } else if (action === 'cancel') {
          // Cancel backorder
          await prisma.backorder.update({
            where: { id: backorderId },
            data: {
              status: 'CANCELLED',
              notes: notes || backorder.notes
            }
          });

          results.push({
            backorderId,
            action: 'cancelled'
          });
        }
      } catch (itemError) {
        console.error(`Error processing backorder ${backorderId}:`, itemError);
        results.push({
          backorderId,
          action: 'error',
          error: itemError instanceof Error ? itemError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully processed ${results.filter(r => r.action !== 'error').length} backorders`
    });
  } catch (error) {
    console.error("Error processing backorders action:", error);
    return NextResponse.json(
      { error: "Failed to process backorders action" },
      { status: 500 }
    );
  }
}
