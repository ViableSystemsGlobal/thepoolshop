import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/stock-movements/[id]/reverse - Reverse a stock movement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the stock movement with all related data
    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: true,
        stockItem: true,
        warehouse: true,
        fromWarehouse: true,
        toWarehouse: true,
      }
    });

    if (!movement) {
      return NextResponse.json(
        { error: "Stock movement not found" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create a reverse movement
      const reverseMovement = await tx.stockMovement.create({
        data: {
          productId: movement.productId,
          stockItemId: movement.stockItemId,
          type: movement.type,
          quantity: -movement.quantity, // Reverse the quantity
          unitCost: movement.unitCost,
          totalCost: movement.totalCost ? -movement.totalCost : null,
          reference: `REV-${movement.reference || movement.id}`,
          reason: `Reversal of movement ${movement.id}`,
          notes: `Reversed movement: ${movement.notes || ''}`,
          userId: movement.userId,
          warehouseId: movement.warehouseId,
          fromWarehouseId: movement.toWarehouseId, // Swap warehouses for transfers
          toWarehouseId: movement.fromWarehouseId,
        },
      });

      // Update stock quantities
      const newQuantity = movement.stockItem.quantity - movement.quantity;
      const newAvailable = Math.max(0, newQuantity - movement.stockItem.reserved);

      // Calculate new average cost (simplified - in practice you might want more sophisticated cost tracking)
      let newAverageCost = movement.stockItem.averageCost;
      if (movement.quantity < 0 && movement.unitCost) {
        // If original was a stock-out, reversing it adds stock back
        const currentTotalCost = movement.stockItem.quantity * movement.stockItem.averageCost;
        const reverseTotalCost = Math.abs(movement.quantity) * movement.unitCost;
        const combinedTotalCost = currentTotalCost + reverseTotalCost;
        newAverageCost = newQuantity > 0 ? combinedTotalCost / newQuantity : movement.stockItem.averageCost;
      }

      const newTotalValue = newQuantity * newAverageCost;

      // Update the stock item
      await tx.stockItem.update({
        where: { id: movement.stockItemId },
        data: {
          quantity: newQuantity,
          available: newAvailable,
          averageCost: newAverageCost,
          totalValue: newTotalValue,
        },
      });

      // Handle transfer movements - update the other warehouse too
      if (movement.type === 'TRANSFER_OUT' && movement.toWarehouseId) {
        // Find the corresponding TRANSFER_IN movement
        const transferInMovement = await tx.stockMovement.findFirst({
          where: {
            productId: movement.productId,
            warehouseId: movement.toWarehouseId,
            type: 'TRANSFER_IN',
            reference: movement.reference,
          },
          include: { stockItem: true }
        });

        if (transferInMovement) {
          // Update the destination warehouse stock
          const destNewQuantity = transferInMovement.stockItem.quantity - Math.abs(movement.quantity);
          const destNewAvailable = Math.max(0, destNewQuantity - transferInMovement.stockItem.reserved);

          await tx.stockItem.update({
            where: { id: transferInMovement.stockItemId },
            data: {
              quantity: destNewQuantity,
              available: destNewAvailable,
            },
          });

          // Create reverse movement for destination warehouse
          await tx.stockMovement.create({
            data: {
              productId: movement.productId,
              stockItemId: transferInMovement.stockItemId,
              type: 'TRANSFER_OUT',
              quantity: -Math.abs(movement.quantity),
              unitCost: movement.unitCost,
              totalCost: movement.totalCost ? -movement.totalCost : null,
              reference: `REV-${movement.reference || movement.id}`,
              reason: `Reversal of transfer to ${movement.toWarehouse?.name}`,
              notes: `Reversed transfer from ${movement.warehouse?.name}`,
              userId: movement.userId,
              warehouseId: movement.toWarehouseId,
              fromWarehouseId: movement.toWarehouseId,
              toWarehouseId: movement.warehouseId,
            },
          });
        }
      } else if (movement.type === 'TRANSFER_IN' && movement.fromWarehouseId) {
        // Find the corresponding TRANSFER_OUT movement
        const transferOutMovement = await tx.stockMovement.findFirst({
          where: {
            productId: movement.productId,
            warehouseId: movement.fromWarehouseId,
            type: 'TRANSFER_OUT',
            reference: movement.reference,
          },
          include: { stockItem: true }
        });

        if (transferOutMovement) {
          // Update the source warehouse stock
          const sourceNewQuantity = transferOutMovement.stockItem.quantity + Math.abs(movement.quantity);
          const sourceNewAvailable = Math.max(0, sourceNewQuantity - transferOutMovement.stockItem.reserved);

          await tx.stockItem.update({
            where: { id: transferOutMovement.stockItemId },
            data: {
              quantity: sourceNewQuantity,
              available: sourceNewAvailable,
            },
          });

          // Create reverse movement for source warehouse
          await tx.stockMovement.create({
            data: {
              productId: movement.productId,
              stockItemId: transferOutMovement.stockItemId,
              type: 'TRANSFER_IN',
              quantity: Math.abs(movement.quantity),
              unitCost: movement.unitCost,
              totalCost: movement.totalCost ? movement.totalCost : null,
              reference: `REV-${movement.reference || movement.id}`,
              reason: `Reversal of transfer from ${movement.fromWarehouse?.name}`,
              notes: `Reversed transfer to ${movement.warehouse?.name}`,
              userId: movement.userId,
              warehouseId: movement.fromWarehouseId,
              fromWarehouseId: movement.warehouseId,
              toWarehouseId: movement.fromWarehouseId,
            },
          });
        }
      }

      return reverseMovement;
    });

    return NextResponse.json({
      message: "Movement reversed successfully",
      reverseMovementId: result.id
    });
  } catch (error) {
    console.error("Error reversing movement:", error);
    return NextResponse.json(
      { error: "Failed to reverse movement" },
      { status: 500 }
    );
  }
}
