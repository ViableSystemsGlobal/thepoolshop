import { PrismaClient } from '@prisma/client';
import { generateBarcode } from '../src/lib/barcode-utils';

const prisma = new PrismaClient();

async function fixMissingBarcodes() {
  console.log('Checking for products without barcodes...\n');
  
  const productsWithoutBarcodes = await prisma.product.findMany({
    where: {
      barcode: null
    },
    select: {
      id: true,
      sku: true,
      name: true
    }
  });
  
  console.log(`Found ${productsWithoutBarcodes.length} products without barcodes\n`);
  
  for (const product of productsWithoutBarcodes) {
    try {
      // Use product ID (which is guaranteed unique) to generate barcode
      const uniqueInput = product.id.replace(/[^0-9]/g, '').slice(0, 9);
      let barcode = '';
      let isUnique = false;
      let attempts = 0;
      
      // Try to find a unique barcode
      while (!isUnique && attempts < 100) {
        // Add attempt number for variation
        const barcodeInput = `${uniqueInput}${attempts.toString().padStart(3, '0')}`;
        barcode = generateBarcode(barcodeInput, 'EAN13');
        
        // Check if this barcode exists
        const existing = await prisma.product.findUnique({
          where: { barcode }
        });
        
        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
        }
      }
      
      if (!isUnique) {
        throw new Error('Could not generate unique barcode after 100 attempts');
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          barcode,
          barcodeType: 'EAN13',
          generateBarcode: true
        }
      });
      
      console.log(`✓ ${product.sku} → ${barcode} | ${product.name}`);
    } catch (error) {
      console.error(`✗ ${product.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\nDone!');
}

fixMissingBarcodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

