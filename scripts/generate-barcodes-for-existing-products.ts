import { PrismaClient } from '@prisma/client';
import { generateBarcode, validateBarcode } from '../src/lib/barcode-utils';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting barcode generation for existing products...\n');
  
  // Get all products without barcodes
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
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  for (const product of productsWithoutBarcodes) {
    try {
      // Skip if SKU is null
      if (!product.sku) {
        errorCount++;
        const errorMsg = `✗ Product ${product.id}: No SKU available`;
        errors.push(errorMsg);
        console.error(errorMsg);
        continue;
      }
      
      // Generate barcode from SKU
      let barcode = generateBarcode(product.sku, 'EAN13');
      let attempts = 0;
      const maxAttempts = 5;
      
      // Ensure uniqueness
      while (attempts < maxAttempts) {
        const existingBarcode = await prisma.product.findUnique({
          where: { barcode }
        });
        
        if (!existingBarcode) break;
        
        // Generate with timestamp for uniqueness
        barcode = generateBarcode(`${product.sku}-${Date.now()}-${attempts}`, 'EAN13');
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Could not generate unique barcode');
      }
      
      // Validate
      if (!validateBarcode(barcode, 'EAN13')) {
        throw new Error('Generated barcode failed validation');
      }
      
      // Update product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          barcode,
          barcodeType: 'EAN13',
          generateBarcode: true
        }
      });
      
      successCount++;
      console.log(`✓ ${product.sku.padEnd(20)} → ${barcode} | ${product.name?.slice(0, 40) || ''}`);
      
    } catch (error) {
      errorCount++;
      const errorMsg = `✗ ${product.sku || product.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`Generation Complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(err => console.log(err));
  }
  
  console.log('\n' + '='.repeat(80));
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

