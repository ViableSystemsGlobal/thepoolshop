const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBrandingSettings() {
  console.log('🎨 Updating branding settings (JS)...');
  try {
    const brandingSettings = [
      { key: 'company_name', value: 'AdPools Group', category: 'branding' },
      { key: 'company_logo', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'favicon', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'primary_color', value: '#dc2626', category: 'branding' }, // red
      { key: 'secondary_color', value: '#b91c1c', category: 'branding' }, // dark red
      { key: 'company_description', value: 'A practical, single-tenant system for sales and distribution management', category: 'branding' }
    ];

    for (const setting of brandingSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value, category: setting.category }
      });
      console.log(`✅ Upserted ${setting.key}`);
    }

    console.log('\n🎉 Branding updated: primary=#dc2626, secondary=#b91c1c');
  } catch (error) {
    console.error('❌ Failed to update branding settings:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

updateBrandingSettings();
