import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/inventory/stocktake/[id] - Get stocktake session details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const stocktake = await prisma.stocktakeSession.findUnique({
      where: { id },
      include: {
        warehouse: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                barcode: true,
                uomBase: true
              }
            },
            stockItem: {
              select: {
                quantity: true,
                available: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!stocktake) {
      return NextResponse.json(
        { error: 'Stocktake session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(stocktake);
  } catch (error) {
    console.error('Error fetching stocktake:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocktake session' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/inventory/stocktake/[id] - Update stocktake session (complete/cancel)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes } = await request.json();
    
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const stocktake = await prisma.stocktakeSession.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // If completing, generate stock adjustments for variances
    if (status === 'COMPLETED') {
      await generateStockAdjustments(stocktake);
    }
    
    return NextResponse.json(stocktake);
  } catch (error) {
    console.error('Error updating stocktake:', error);
    return NextResponse.json(
      { error: 'Failed to update stocktake session' },
      { status: 500 }
    );
  }
}

/**
 * Generate stock adjustment movements for variances
 */
async function generateStockAdjustments(stocktake: any) {
  for (const item of stocktake.items) {
    const variance = item.countedQuantity - item.systemQuantity;
    
    if (variance !== 0) {
      // Create stock movement for the variance
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          stockItemId: item.stockItemId,
          type: 'ADJUSTMENT',
          quantity: variance,
          reference: stocktake.sessionNumber,
          reason: 'Physical Count Adjustment',
          notes: `Stocktake variance: System ${item.systemQuantity}, Counted ${item.countedQuantity}, Variance ${variance}`,
          warehouseId: stocktake.warehouseId
        }
      });
      
      // Update stock item
      const newQuantity = item.countedQuantity;
      await prisma.stockItem.update({
        where: { id: item.stockItemId },
        data: {
          quantity: newQuantity,
          available: Math.max(0, newQuantity)
        }
      });
    }
  }
}

