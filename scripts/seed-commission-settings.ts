import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding commission settings...');

  const settings = [
    {
      key: 'commission_enabled',
      value: 'true',
      description: 'Enable automatic commission creation on paid invoices',
      category: 'COMMISSION',
      isActive: true
    },
    {
      key: 'commission_system_rate',
      value: '10',
      description: 'System-wide commission rate (%) for team deals',
      category: 'COMMISSION',
      isActive: true
    },
    {
      key: 'commission_calculation_type',
      value: 'REVENUE',
      description: 'Commission calculation type: REVENUE (invoice total) or PROFIT (invoice total - costs)',
      category: 'COMMISSION',
      isActive: true
    },
    {
      key: 'commission_min_invoice_amount',
      value: '0',
      description: 'Minimum invoice amount to qualify for commission',
      category: 'COMMISSION',
      isActive: true
    }
  ];

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
        category: setting.category,
        isActive: setting.isActive
      },
      create: setting
    });

    console.log(`✅ Created/updated setting: ${setting.key}`);
  }

  console.log('✅ Commission settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding commission settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

