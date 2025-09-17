import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStockItems() {
  try {
    console.log('Updating existing stock items...');

    // Get the main warehouse
    const mainWarehouse = await prisma.warehouse.findUnique({
      where: { code: 'MAIN' }
    });

    if (!mainWarehouse) {
      console.error('Main warehouse not found!');
      return;
    }

    // Get all stock items that don't have a warehouse assigned
    const stockItems = await prisma.stockItem.findMany({
      where: {
        warehouseId: null
      },
      include: {
        product: true
      }
    });

    console.log(`Found ${stockItems.length} stock items to update`);

    // Update each stock item with default warehouse and sample costs
    for (const stockItem of stockItems) {
      // Generate a sample cost based on product name (for demo purposes)
      let sampleCost = 10.00; // Default cost
      
      if (stockItem.product.name.toLowerCase().includes('chlorine')) {
        sampleCost = 25.50;
      } else if (stockItem.product.name.toLowerCase().includes('salt')) {
        sampleCost = 5.75;
      }

      const totalValue = stockItem.quantity * sampleCost;

      await prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          warehouseId: mainWarehouse.id,
          averageCost: sampleCost,
          totalValue: totalValue
        }
      });

      console.log(`Updated ${stockItem.product.name}: ${stockItem.quantity} units @ $${sampleCost} = $${totalValue.toFixed(2)}`);
    }

    console.log('Stock items update complete.');
  } catch (error) {
    console.error('Error updating stock items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStockItems();
