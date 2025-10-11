import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPoolProducts() {
  console.log('Checking POOL-001 and POOL-002...\n');
  
  const pool001 = await prisma.product.findFirst({
    where: { sku: 'POOL-001' }
  });
  
  const pool002 = await prisma.product.findFirst({
    where: { sku: 'POOL-002' }
  });
  
  console.log('POOL-001:', pool001);
  console.log('\nPOOL-002:', pool002);
  
  // Check all products with barcodes
  const allBarcodes = await prisma.product.findMany({
    where: {
      barcode: { not: null }
    },
    select: {
      sku: true,
      barcode: true
    },
    orderBy: {
      barcode: 'asc'
    }
  });
  
  console.log('\n\nAll barcodes in system:');
  allBarcodes.forEach(p => {
    console.log(`${p.sku}: ${p.barcode}`);
  });
}

checkPoolProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

