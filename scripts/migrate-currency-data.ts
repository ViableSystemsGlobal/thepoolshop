import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCurrencyData() {
  try {
    console.log('Starting currency data migration...');

    // Get all products with importCurrency
    const products = await prisma.product.findMany({
      where: {
        importCurrency: {
          not: null
        }
      }
    });

    console.log(`Found ${products.length} products to migrate`);

    // Update each product with the new currency fields
    for (const product of products) {
      const importCurrency = product.importCurrency || 'USD';
      
      // Set original cost currency to the import currency
      // Set base currency to GHS (system default)
      // Set original cost to the current cost value
      // Set original price to the current price value
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          originalCostCurrency: importCurrency,
          originalPriceCurrency: importCurrency,
          originalCost: product.cost,
          originalPrice: product.price,
          baseCurrency: 'GHS',
          // Keep the existing price and cost as they are (assuming they're already in GHS)
        }
      });

      console.log(`Migrated product: ${product.name} (${product.sku})`);
    }

    console.log('Currency data migration completed successfully!');
  } catch (error) {
    console.error('Error during currency data migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCurrencyData()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
