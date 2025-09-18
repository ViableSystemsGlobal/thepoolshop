import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/backorders - Get products that are out of stock or below reorder point
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'out-of-stock', 'low-stock', 'all'
    const category = searchParams.get('category');
    const warehouse = searchParams.get('warehouse');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for filtering
    const where: any = {
      active: true,
      stockItems: {
        some: {}
      }
    };

    if (category) {
      where.categoryId = category;
    }

    if (warehouse) {
      where.stockItems = {
        some: {
          warehouseId: warehouse
        }
      };
    }

    // Get products with their stock information
    const products = await prisma.product.findMany({
      where,
      include: {
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
      },
      orderBy: {
        name: 'asc'
      },
      take: limit,
      skip: offset,
    });

    // Filter and categorize products based on stock status
    const backorderProducts = products.map(product => {
      const totalStock = product.stockItems.reduce((sum, item) => sum + item.available, 0);
      const totalReserved = product.stockItems.reduce((sum, item) => sum + item.reserved, 0);
      const maxReorderPoint = Math.max(...product.stockItems.map(item => item.reorderPoint));
      const totalValue = product.stockItems.reduce((sum, item) => sum + item.totalValue, 0);
      
      // Determine status
      let stockStatus: 'out-of-stock' | 'low-stock' | 'in-stock' = 'in-stock';
      if (totalStock === 0) {
        stockStatus = 'out-of-stock';
      } else if (totalStock <= maxReorderPoint) {
        stockStatus = 'low-stock';
      }

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        cost: product.cost,
        baseCurrency: product.baseCurrency,
        stockStatus,
        totalStock,
        totalReserved,
        totalAvailable: totalStock - totalReserved,
        maxReorderPoint,
        totalValue,
        stockItems: product.stockItems.map(item => ({
          id: item.id,
          warehouse: item.warehouse,
          quantity: item.quantity,
          available: item.available,
          reserved: item.reserved,
          reorderPoint: item.reorderPoint,
          averageCost: item.averageCost,
          totalValue: item.totalValue
        })),
        lastUpdated: product.updatedAt
      };
    });

    // Apply status filter
    let filteredProducts = backorderProducts;
    if (status && status !== 'all') {
      filteredProducts = backorderProducts.filter(product => product.stockStatus === status);
    }

    // Calculate summary statistics
    const summary = {
      total: backorderProducts.length,
      outOfStock: backorderProducts.filter(p => p.stockStatus === 'out-of-stock').length,
      lowStock: backorderProducts.filter(p => p.stockStatus === 'low-stock').length,
      totalValue: backorderProducts.reduce((sum, p) => sum + p.totalValue, 0),
      criticalItems: backorderProducts.filter(p => p.stockStatus === 'out-of-stock' || (p.stockStatus === 'low-stock' && p.totalAvailable <= 0)).length
    };

    return NextResponse.json({
      products: filteredProducts,
      summary,
      total: filteredProducts.length,
      hasMore: offset + filteredProducts.length < backorderProducts.length,
    });
  } catch (error) {
    console.error("Error fetching backorders:", error);
    return NextResponse.json(
      { error: "Failed to fetch backorders" },
      { status: 500 }
    );
  }
}

// POST /api/backorders - Create bulk reorder or stock adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, items, notes } = body;

    if (!action || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Action and items are required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const item of items) {
      try {
        if (action === 'adjust_reorder_point') {
          // Update reorder point for stock items
          await prisma.stockItem.updateMany({
            where: {
              productId: item.productId,
              warehouseId: item.warehouseId || null
            },
            data: {
              reorderPoint: item.newReorderPoint
            }
          });
          
          results.push({
            productId: item.productId,
            warehouseId: item.warehouseId,
            action: 'reorder_point_updated',
            newReorderPoint: item.newReorderPoint
          });
        } else if (action === 'create_purchase_order') {
          // Create a stock movement for purchase order
          const stockItem = await prisma.stockItem.findFirst({
            where: {
              productId: item.productId,
              warehouseId: item.warehouseId || null
            }
          });

          if (stockItem) {
            await prisma.stockMovement.create({
              data: {
                productId: item.productId,
                stockItemId: stockItem.id,
                type: 'RECEIPT',
                quantity: item.quantity,
                unitCost: item.unitCost,
                totalCost: item.quantity * (item.unitCost || 0),
                reference: `PO-${Date.now()}-${item.productId.slice(-6)}`,
                reason: 'Purchase Order',
                notes: notes || `Bulk reorder for ${item.productName}`,
                warehouseId: item.warehouseId
              }
            });

            results.push({
              productId: item.productId,
              warehouseId: item.warehouseId,
              action: 'purchase_order_created',
              quantity: item.quantity,
              reference: `PO-${Date.now()}-${item.productId.slice(-6)}`
            });
          }
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.productId}:`, itemError);
        results.push({
          productId: item.productId,
          warehouseId: item.warehouseId,
          action: 'error',
          error: itemError instanceof Error ? itemError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully processed ${results.filter(r => r.action !== 'error').length} items`
    });
  } catch (error) {
    console.error("Error processing backorders action:", error);
    return NextResponse.json(
      { error: "Failed to process backorders action" },
      { status: 500 }
    );
  }
}
