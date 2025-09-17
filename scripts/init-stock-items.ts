import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initStockItems() {
  try {
    console.log('Initializing stock items for existing products...');
    
    // Get all products that don't have stock items
    const productsWithoutStock = await prisma.product.findMany({
      where: {
        stockItem: null
      },
      select: {
        id: true,
        name: true,
        sku: true
      }
    });

    console.log(`Found ${productsWithoutStock.length} products without stock items`);

    // Create stock items for each product
    for (const product of productsWithoutStock) {
      await prisma.stockItem.create({
        data: {
          productId: product.id,
          quantity: 0,
          reserved: 0,
          available: 0,
        }
      });
      console.log(`Created stock item for product: ${product.name} (${product.sku})`);
    }

    console.log('Stock items initialization completed!');
  } catch (error) {
    console.error('Error initializing stock items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initStockItems();
