import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface BulkStockMovementRequest {
  productId: string;
  stockItemId?: string;
  type: 'RECEIPT' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  quantity: number;
  warehouseId?: string;
  reference?: string;
  reason?: string;
  notes?: string;
  unitCost?: number;
  totalCost?: number;
}

interface BulkStockMovementData {
  movements: BulkStockMovementRequest[];
}

// POST /api/stock-movements/bulk - Create multiple stock movements
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const movementsData = formData.get('movements') as string;
    const grnFile = formData.get('grnFile') as File | null;
    const poFile = formData.get('poFile') as File | null;
    
    if (!movementsData) {
      return NextResponse.json(
        { error: 'No movements provided' },
        { status: 400 }
      );
    }

    const body: BulkStockMovementData = JSON.parse(movementsData);
    const { movements } = body;

    if (!movements || !Array.isArray(movements) || movements.length === 0) {
      return NextResponse.json(
        { error: 'No movements provided' },
        { status: 400 }
      );
    }

    if (movements.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 movements allowed per bulk upload' },
        { status: 400 }
      );
    }

    const results = {
      successCount: 0,
      errorCount: 0,
      details: [] as any[]
    };

    // Process movements in batches to avoid overwhelming the database
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < movements.length; i += batchSize) {
      batches.push(movements.slice(i, i + batchSize));
    }

    let createdMovementIds: string[] = [];

    for (const batch of batches) {
      const batchResults = await processBatch(batch);
      results.successCount += batchResults.successCount;
      results.errorCount += batchResults.errorCount;
      results.details.push(...batchResults.details);
      
      // Collect created movement IDs for GRN attachment
      const batchMovementIds = batchResults.details
        .filter(detail => detail.success && detail.stockMovementId)
        .map(detail => detail.stockMovementId);
      createdMovementIds.push(...batchMovementIds);
    }

    // Handle GRN file upload for all created movements
    if (grnFile && grnFile.size > 0 && createdMovementIds.length > 0) {
      try {
        const grnBuffer = await grnFile.arrayBuffer();
        const grnPath = `uploads/stock-movements/bulk-${Date.now()}-${grnFile.name}`;
        
        // Create directory if it doesn't exist
        const fs = await import('fs/promises');
        const path = await import('path');
        const dir = path.dirname(grnPath);
        await fs.mkdir(dir, { recursive: true });
        
        // Save file
        await fs.writeFile(grnPath, Buffer.from(grnBuffer));
        
        // Update all movements with GRN file path
        for (const movementId of createdMovementIds) {
          const existingMovement = await prisma.stockMovement.findUnique({
            where: { id: movementId },
            select: { notes: true }
          });
          
          const updatedNotes = existingMovement?.notes 
            ? `${existingMovement.notes}\n\nGRN: ${grnPath}`
            : `GRN: ${grnPath}`;
            
          await prisma.stockMovement.update({
            where: { id: movementId },
            data: { notes: updatedNotes }
          });
        }
      } catch (fileError) {
        console.error('Error saving GRN file for bulk upload:', fileError);
        // Don't fail the entire request if file save fails
      }
    }

    // Handle PO file upload for all created movements
    if (poFile && poFile.size > 0 && createdMovementIds.length > 0) {
      try {
        const poBuffer = await poFile.arrayBuffer();
        const poPath = `uploads/stock-movements/bulk-po-${Date.now()}-${poFile.name}`;
        
        // Create directory if it doesn't exist
        const fs = await import('fs/promises');
        const path = await import('path');
        const dir = path.dirname(poPath);
        await fs.mkdir(dir, { recursive: true });
        
        // Save file
        await fs.writeFile(poPath, Buffer.from(poBuffer));
        
        // Update all movements with PO file path
        for (const movementId of createdMovementIds) {
          const existingMovement = await prisma.stockMovement.findUnique({
            where: { id: movementId },
            select: { notes: true }
          });
          
          const updatedNotes = existingMovement?.notes 
            ? `${existingMovement.notes}\n\nPO: ${poPath}`
            : `PO: ${poPath}`;
            
          await prisma.stockMovement.update({
            where: { id: movementId },
            data: { notes: updatedNotes }
          });
        }
      } catch (fileError) {
        console.error('Error saving PO file for bulk upload:', fileError);
        // Don't fail the entire request if file save fails
      }
    }

    return NextResponse.json({
      message: 'Bulk upload processed',
      ...results
    });

  } catch (error) {
    console.error('Error processing bulk stock movements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processBatch(movements: BulkStockMovementRequest[]) {
  const results = {
    successCount: 0,
    errorCount: 0,
    details: [] as any[]
  };

  for (const movement of movements) {
    try {
      // Validate required fields
      if (!movement.productId || !movement.type || movement.quantity === undefined) {
        results.errorCount++;
        results.details.push({
          productId: movement.productId,
          error: 'Missing required fields: productId, type, or quantity'
        });
        continue;
      }

      // Get or create stock item
      let stockItem;
      if (movement.stockItemId) {
        stockItem = await prisma.stockItem.findUnique({
          where: { id: movement.stockItemId }
        });
      } else if (movement.warehouseId) {
        // Find existing stock item or create new one
        stockItem = await prisma.stockItem.findFirst({
          where: {
            productId: movement.productId,
            warehouseId: movement.warehouseId
          }
        });

        if (!stockItem) {
          // Get product to fetch cost for totalValue calculation
          const product = await prisma.product.findUnique({
            where: { id: movement.productId },
            select: { cost: true }
          });

          // Create new stock item
          stockItem = await prisma.stockItem.create({
            data: {
              productId: movement.productId,
              warehouseId: movement.warehouseId,
              quantity: 0,
              available: 0,
              reserved: 0,
              reorderPoint: 0,
              averageCost: movement.unitCost || 0,
              totalValue: 0 * (product?.cost || 0) // Will be updated after quantity changes
            }
          });
        }
      } else {
        results.errorCount++;
        results.details.push({
          productId: movement.productId,
          error: 'Either stockItemId or warehouseId must be provided'
        });
        continue;
      }

      if (!stockItem) {
        results.errorCount++;
        results.details.push({
          productId: movement.productId,
          error: 'Could not find or create stock item'
        });
        continue;
      }

      // Calculate new quantities
      const quantityChange = movement.quantity;
      const newQuantity = stockItem.quantity + quantityChange;
      const newAvailable = stockItem.available + quantityChange;

      // Validate quantities
      if (newQuantity < 0 || newAvailable < 0) {
        results.errorCount++;
        results.details.push({
          productId: movement.productId,
          error: 'Insufficient stock for this movement'
        });
        continue;
      }

      // Calculate costs
      let unitCost = movement.unitCost;
      let totalCost = movement.totalCost;

      if (movement.type === 'RECEIPT' && unitCost) {
        // Update average cost for receipts
        const currentTotalValue = stockItem.averageCost * stockItem.quantity;
        const newTotalValue = currentTotalValue + (unitCost * Math.abs(quantityChange));
        const newAverageCost = newQuantity > 0 ? newTotalValue / newQuantity : stockItem.averageCost;
        
        unitCost = unitCost;
        totalCost = totalCost || (unitCost * Math.abs(quantityChange));
        
        // Update stock item with new average cost
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            averageCost: newAverageCost,
            totalValue: newTotalValue
          }
        });
      }

      // Create stock movement
      const stockMovement = await prisma.stockMovement.create({
        data: {
          productId: movement.productId,
          stockItemId: stockItem.id,
          type: movement.type,
          quantity: quantityChange,
          unitCost: unitCost,
          totalCost: totalCost,
          warehouseId: movement.warehouseId || stockItem.warehouseId,
          reference: movement.reference,
          reason: movement.reason,
          notes: movement.notes,
          userId: null // TODO: Get from session
        }
      });

      // Get product to fetch cost for totalValue calculation
      const product = await prisma.product.findUnique({
        where: { id: movement.productId },
        select: { cost: true }
      });

      // Update stock item quantities
      await prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          quantity: newQuantity,
          available: newAvailable,
          totalValue: newQuantity * (product?.cost || 0)
        }
      });

      results.successCount++;
      results.details.push({
        productId: movement.productId,
        stockMovementId: stockMovement.id,
        success: true
      });

    } catch (error) {
      console.error('Error processing individual movement:', error);
      results.errorCount++;
      results.details.push({
        productId: movement.productId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

// GET /api/stock-movements/bulk - Get bulk upload history (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This could be expanded to track bulk upload sessions
    // For now, just return recent stock movements
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uomBase: true,
          }
        },
        stockItem: {
          select: {
            id: true,
            quantity: true,
            available: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      movements,
      total: movements.length
    });

  } catch (error) {
    console.error('Error fetching bulk movements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
