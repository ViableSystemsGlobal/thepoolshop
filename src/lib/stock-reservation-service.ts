import { prisma } from '@/lib/prisma';

export interface StockReservation {
  productId: string;
  quantity: number;
  warehouseId?: string;
}

export interface ReservationResult {
  success: boolean;
  message?: string;
  reservations?: any[];
}

/**
 * Stock Reservation Service
 * Manages stock reservations for invoices to prevent overselling
 */
export class StockReservationService {
  
  /**
   * Reserve stock for invoice line items
   */
  static async reserveStock(
    invoiceId: string,
    lineItems: StockReservation[]
  ): Promise<ReservationResult> {
    try {
      console.log(`📦 Reserving stock for invoice ${invoiceId}`);
      
      const reservations = [];

      for (const item of lineItems) {
        // Get stock items for this product
        const stockItems = await prisma.stockItem.findMany({
          where: {
            productId: item.productId,
            ...(item.warehouseId && { warehouseId: item.warehouseId })
          },
          orderBy: { quantity: 'desc' } // Use warehouse with most stock first
        });

        if (stockItems.length === 0) {
          return {
            success: false,
            message: `No stock found for product ${item.productId}`
          };
        }

        let remainingToReserve = item.quantity;
        
        for (const stockItem of stockItems) {
          if (remainingToReserve <= 0) break;

          const availableQty = stockItem.quantity - stockItem.reserved;
          
          if (availableQty <= 0) continue;

          const reserveQty = Math.min(availableQty, remainingToReserve);

          // Update stock item to reserve quantity
          await prisma.stockItem.update({
            where: { id: stockItem.id },
            data: {
              reserved: stockItem.reserved + reserveQty,
              available: stockItem.quantity - (stockItem.reserved + reserveQty)
            }
          });

          reservations.push({
            stockItemId: stockItem.id,
            productId: item.productId,
            quantity: reserveQty,
            warehouseId: stockItem.warehouseId
          });

          remainingToReserve -= reserveQty;
          
          console.log(`✅ Reserved ${reserveQty} units from stock item ${stockItem.id}`);
        }

        if (remainingToReserve > 0) {
          // Rollback reservations
          await this.unreserveStock(invoiceId, reservations);
          return {
            success: false,
            message: `Insufficient stock for product ${item.productId}. Need ${item.quantity}, only ${item.quantity - remainingToReserve} available.`
          };
        }
      }

      // Store reservation metadata
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          notes: `Stock reserved: ${JSON.stringify(reservations)}`
        }
      });

      console.log(`✅ Successfully reserved stock for invoice ${invoiceId}`);
      
      return {
        success: true,
        message: 'Stock reserved successfully',
        reservations
      };

    } catch (error) {
      console.error('Error reserving stock:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reserve stock'
      };
    }
  }

  /**
   * Unreserve stock (when invoice is cancelled)
   */
  static async unreserveStock(
    invoiceId: string,
    reservations: any[]
  ): Promise<ReservationResult> {
    try {
      console.log(`🔄 Unreserving stock for invoice ${invoiceId}`);

      for (const reservation of reservations) {
        const stockItem = await prisma.stockItem.findUnique({
          where: { id: reservation.stockItemId }
        });

        if (stockItem) {
          await prisma.stockItem.update({
            where: { id: stockItem.id },
            data: {
              reserved: Math.max(0, stockItem.reserved - reservation.quantity),
              available: stockItem.quantity - Math.max(0, stockItem.reserved - reservation.quantity)
            }
          });
          
          console.log(`✅ Unreserved ${reservation.quantity} units from stock item ${stockItem.id}`);
        }
      }

      console.log(`✅ Successfully unreserved stock for invoice ${invoiceId}`);
      
      return {
        success: true,
        message: 'Stock unreserved successfully'
      };

    } catch (error) {
      console.error('Error unreserving stock:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unreserve stock'
      };
    }
  }

  /**
   * Deduct stock (when invoice is paid)
   */
  static async deductStock(
    invoiceId: string,
    lineItems: StockReservation[],
    userId: string
  ): Promise<ReservationResult> {
    try {
      console.log(`📤 Deducting stock for invoice ${invoiceId}`);

      const deductions = [];

      for (const item of lineItems) {
        // Get stock items for this product
        const stockItems = await prisma.stockItem.findMany({
          where: {
            productId: item.productId,
            reserved: { gt: 0 }, // Only from items with reservations
            ...(item.warehouseId && { warehouseId: item.warehouseId })
          },
          orderBy: { reserved: 'desc' } // Deduct from most reserved first
        });

        let remainingToDeduct = item.quantity;

        for (const stockItem of stockItems) {
          if (remainingToDeduct <= 0) break;

          const deductQty = Math.min(stockItem.reserved, remainingToDeduct);

          // Update stock item - reduce both quantity and reserved
          await prisma.stockItem.update({
            where: { id: stockItem.id },
            data: {
              quantity: stockItem.quantity - deductQty,
              reserved: stockItem.reserved - deductQty,
              available: (stockItem.quantity - deductQty) - (stockItem.reserved - deductQty)
            }
          });

          // Create stock movement record
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              stockItemId: stockItem.id,
              type: 'OUT',
              quantity: deductQty,
              warehouseId: stockItem.warehouseId,
              reference: `Invoice ${invoiceId}`,
              notes: `Stock deducted for paid invoice`,
              createdBy: userId
            }
          });

          deductions.push({
            stockItemId: stockItem.id,
            productId: item.productId,
            quantity: deductQty,
            warehouseId: stockItem.warehouseId
          });

          remainingToDeduct -= deductQty;
          
          console.log(`✅ Deducted ${deductQty} units from stock item ${stockItem.id}`);
        }

        if (remainingToDeduct > 0) {
          console.warn(`⚠️ Could not deduct all stock for product ${item.productId}. Remaining: ${remainingToDeduct}`);
        }
      }

      console.log(`✅ Successfully deducted stock for invoice ${invoiceId}`);
      
      return {
        success: true,
        message: 'Stock deducted successfully',
        reservations: deductions
      };

    } catch (error) {
      console.error('Error deducting stock:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to deduct stock'
      };
    }
  }

  /**
   * Check if enough stock is available for reservation
   */
  static async checkStockAvailability(
    lineItems: StockReservation[]
  ): Promise<{ available: boolean; insufficientItems: string[] }> {
    const insufficientItems: string[] = [];

    for (const item of lineItems) {
      const stockItems = await prisma.stockItem.findMany({
        where: {
          productId: item.productId,
          ...(item.warehouseId && { warehouseId: item.warehouseId })
        }
      });

      const totalAvailable = stockItems.reduce((sum, si) => sum + (si.quantity - si.reserved), 0);

      if (totalAvailable < item.quantity) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true }
        });
        insufficientItems.push(`${product?.name || 'Unknown'} (${product?.sku || 'N/A'}): Need ${item.quantity}, Available ${totalAvailable}`);
      }
    }

    return {
      available: insufficientItems.length === 0,
      insufficientItems
    };
  }
}

