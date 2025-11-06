import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database for production...');

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

    // Create exchange rate for USD to GHS
    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_effectiveDate: {
          fromCurrency: 'USD',
          toCurrency: 'GHS',
          effectiveDate: new Date('2025-01-01'),
        },
      },
      update: { rate: 12.5 },
      create: {
        fromCurrency: 'USD',
        toCurrency: 'GHS',
        rate: 12.5,
        effectiveDate: new Date('2025-01-01'),
        source: 'manual',
      },
    });

    console.log('✅ Created exchange rates');

    // Create default categories
    await prisma.category.upsert({
      where: { id: 'pool-equipment' },
      update: {},
      create: {
        id: 'pool-equipment',
        name: 'Pool Equipment',
        description: 'Swimming pool equipment and accessories',
      },
    });

    await prisma.category.upsert({
      where: { id: 'chemicals' },
      update: {},
      create: {
        id: 'chemicals',
        name: 'Pool Chemicals',
        description: 'Pool cleaning and maintenance chemicals',
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

    // Create admin user with password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@thepoolshop.africa' },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      create: {
        email: 'admin@thepoolshop.africa',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Created admin user');

    // Create system settings
    const settings = [
      { key: 'company_name', value: 'The PoolShop', category: 'branding', type: 'string' },
      { key: 'company_logo', value: '/uploads/branding/logo.png', category: 'branding', type: 'string' },
      { key: 'primary_color', value: '#ea580c', category: 'branding', type: 'string' },
      { key: 'secondary_color', value: '#c2410c', category: 'branding', type: 'string' },
      { key: 'company_description', value: 'Everything Swimming Pool and more...', category: 'branding', type: 'string' },
      { key: 'default_currency', value: 'GHS', category: 'general', type: 'string' },
      { key: 'tax_rate', value: '0.125', category: 'financial', type: 'number' },
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });
    }

    console.log('✅ Created system settings');

    console.log('\n🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('Email: admin@thepoolshop.africa');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password immediately after first login!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

