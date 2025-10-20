import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Updating branding settings...');

  try {
    // Update branding settings
    const brandingSettings = [
      { key: 'company_name', value: 'AdPools Group', category: 'branding' },
      { key: 'company_logo', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'favicon', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'primary_color', value: '#dc2626', category: 'branding' },
      { key: 'secondary_color', value: '#b91c1c', category: 'branding' },
      { key: 'company_description', value: 'A practical, single-tenant system for sales and distribution management', category: 'branding' }
    ];

    for (const setting of brandingSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category
        }
      });
      console.log(`✅ Updated ${setting.key}: ${setting.value}`);
    }

    console.log('\n🎉 Branding settings updated successfully!');
    console.log('\n📋 Current branding:');
    console.log('   Company: AdPools Group');
    console.log('   Logo: /uploads/branding/favicon_1760896671527.jpg');
    console.log('   Primary Color: #dc2626 (Red)');
    console.log('   Secondary Color: #b91c1c (Dark Red)');
    console.log('\n🚀 The branding will now be consistent across all devices!');

  } catch (error) {
    console.error('❌ Failed to update branding settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
