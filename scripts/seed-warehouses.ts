import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWarehouses() {
  try {
    console.log('Seeding warehouses...');

    // Create default warehouses
    const warehouses = [
      {
        name: 'Main Warehouse',
        code: 'MAIN',
        address: '123 Industrial Road',
        city: 'Accra',
        country: 'Ghana',
      },
      {
        name: 'Secondary Warehouse',
        code: 'SEC',
        address: '456 Business District',
        city: 'Kumasi',
        country: 'Ghana',
      },
      {
        name: 'Retail Store',
        code: 'RETAIL',
        address: '789 Shopping Mall',
        city: 'Accra',
        country: 'Ghana',
      },
    ];

    for (const warehouse of warehouses) {
      const existing = await prisma.warehouse.findUnique({
        where: { code: warehouse.code }
      });

      if (!existing) {
        await prisma.warehouse.create({
          data: warehouse
        });
        console.log(`Created warehouse: ${warehouse.name} (${warehouse.code})`);
      } else {
        console.log(`Warehouse already exists: ${warehouse.name} (${warehouse.code})`);
      }
    }

    console.log('Warehouse seeding complete.');
  } catch (error) {
    console.error('Error seeding warehouses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedWarehouses();
