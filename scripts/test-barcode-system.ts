import { PrismaClient } from '@prisma/client';
import { generateBarcode, validateBarcode, detectBarcodeType } from '../src/lib/barcode-utils';

const prisma = new PrismaClient();

async function testBarcodeSystem() {
  console.log('Testing Barcode System...\n');
  
  // Test 1: Barcode Generation
  console.log('Test 1: Barcode Generation');
  const testSKU = 'TEST-001';
  const ean13 = generateBarcode(testSKU, 'EAN13');
  console.log(`  Generated EAN-13: ${ean13}`);
  console.log(`  Valid: ${validateBarcode(ean13, 'EAN13')}`);
  
  // Test 2: Barcode Detection
  console.log('\nTest 2: Barcode Type Detection');
  console.log(`  ${ean13} → ${detectBarcodeType(ean13)}`);
  console.log(`  6901234567890 → ${detectBarcodeType('6901234567890')}`);
  console.log(`  12345678 → ${detectBarcodeType('12345678')}`);
  
  // Test 3: Database Lookup
  console.log('\nTest 3: Database Product Lookup');
  const firstProduct = await prisma.product.findFirst({
    where: { barcode: { not: null } },
    include: { additionalBarcodes: true }
  });
  
  if (firstProduct) {
    console.log(`  Found product: ${firstProduct.name}`);
    console.log(`  Primary barcode: ${firstProduct.barcode}`);
    console.log(`  Additional barcodes: ${firstProduct.additionalBarcodes.length}`);
  } else {
    console.log('  No products with barcodes found');
  }
  
  // Test 4: Statistics
  console.log('\nTest 4: System Statistics');
  const total = await prisma.product.count();
  const withBarcodes = await prisma.product.count({
    where: { barcode: { not: null } }
  });
  const additionalCount = await prisma.productBarcode.count();
  
  console.log(`  Total products: ${total}`);
  console.log(`  With barcodes: ${withBarcodes} (${((withBarcodes/total)*100).toFixed(1)}%)`);
  console.log(`  Additional barcodes: ${additionalCount}`);
  
  console.log('\n✓ All tests complete!');
}

testBarcodeSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

