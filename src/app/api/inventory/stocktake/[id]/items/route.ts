import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/inventory/stocktake/[id]/items - Add/update counted item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { productId, countedQuantity, notes, barcode } = await request.json();
    
    if (!productId || countedQuantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and counted quantity are required' },
        { status: 400 }
      );
    }
    
    // Get stocktake session
    const session = await prisma.stocktakeSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Stocktake session not found' },
        { status: 404 }
      );
    }
    
    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot modify completed or cancelled stocktake' },
        { status: 400 }
      );
    }
    
    // Get product and stock item
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockItems: {
          where: { warehouseId: session.warehouseId }
        }
      }
    });
    
    if (!product || !product.stockItems[0]) {
      return NextResponse.json(
        { error: 'Product not found in this warehouse' },
        { status: 404 }
      );
    }
    
    const stockItem = product.stockItems[0];
    const systemQuantity = stockItem.quantity;
    const variance = countedQuantity - systemQuantity;
    
    // Check if item already counted in this session
    const existingItem = await prisma.stocktakeItem.findFirst({
      where: {
        stocktakeSessionId: sessionId,
        productId: productId
      }
    });
    
    let item;
    if (existingItem) {
      // Update existing count
      item = await prisma.stocktakeItem.update({
        where: { id: existingItem.id },
        data: {
          countedQuantity,
          variance: countedQuantity - systemQuantity,
          notes,
          scannedBarcode: barcode
        }
      });
    } else {
      // Create new count entry
      item = await prisma.stocktakeItem.create({
        data: {
          stocktakeSessionId: sessionId,
          productId,
          stockItemId: stockItem.id,
          systemQuantity,
          countedQuantity,
          variance,
          notes,
          scannedBarcode: barcode
        }
      });
    }
    
    // Return item with product details
    const itemWithDetails = await prisma.stocktakeItem.findUnique({
      where: { id: item.id },
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
      }
    });
    
    return NextResponse.json(itemWithDetails, { status: 201 });
  } catch (error) {
    console.error('Error adding stocktake item:', error);
    return NextResponse.json(
      { error: 'Failed to add counted item' },
      { status: 500 }
    );
  }
}

