import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database...');

  try {
    // Create default currencies
    const usd = await prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isActive: true,
      },
    });

    const ghs = await prisma.currency.upsert({
      where: { code: 'GHS' },
      update: {},
      create: {
        code: 'GHS',
        name: 'Ghana Cedi',
        symbol: '₵',
        isActive: true,
      },
    });

    console.log('✅ Created currencies');

    // Create default categories
    const electronics = await prisma.category.upsert({
      where: { id: 'electronics' },
      update: {},
      create: {
        id: 'electronics',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
      },
    });

    const office = await prisma.category.upsert({
      where: { id: 'office' },
      update: {},
      create: {
        id: 'office',
        name: 'Office Supplies',
        description: 'Office equipment and supplies',
      },
    });

    console.log('✅ Created categories');

    // Create default warehouse
    const warehouse = await prisma.warehouse.upsert({
      where: { code: 'MAIN' },
      update: {},
      create: {
        name: 'Main Warehouse',
        code: 'MAIN',
        address: 'Accra, Ghana',
        city: 'Accra',
        country: 'Ghana',
        isActive: true,
      },
    });

    console.log('✅ Created warehouse');

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@adpools.com' },
      update: {},
      create: {
        email: 'admin@adpools.com',
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Created admin user');

    // Create system settings
    const settings = [
      { key: 'company_name', value: 'The PoolShop' },
      { key: 'company_logo', value: '/uploads/branding/favicon_1760896671527.jpg' },
      { key: 'primary_color', value: '#ea580c' },
      { key: 'secondary_color', value: '#c2410c' },
      { key: 'company_description', value: 'A practical, single-tenant system for sales and distribution management' },
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: 'branding',
          type: 'string',
        },
      });
    }

    console.log('✅ Created system settings');

    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Created:');
    console.log('- 2 currencies (USD, GHS)');
    console.log('- 2 categories (Electronics, Office)');
    console.log('- 1 warehouse (Main Warehouse)');
    console.log('- 1 admin user (admin@adpools.com)');
    console.log('- 5 system settings');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
