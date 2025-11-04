import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setRedThemeDefault() {
  console.log('🎨 Setting red theme as system default...');

  try {
    // Update branding settings to ensure red is the default
    const brandingSettings = [
      { key: 'primary_color', value: '#dc2626', category: 'branding' },
      { key: 'secondary_color', value: '#b91c1c', category: 'branding' },
      { key: 'company_name', value: 'AdPools Group', category: 'branding' },
      { key: 'company_logo', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'favicon', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'company_description', value: 'A practical, single-tenant system for sales and distribution management', category: 'branding' }
    ];

    for (const setting of brandingSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          type: 'string',
          description: `System ${setting.key.replace('_', ' ')} setting`
        }
      });
      console.log(`✅ Set ${setting.key}: ${setting.value}`);
    }

    console.log('\n🎉 Red theme set as system default!');
    console.log('📋 System branding:');
    console.log('   Primary Color: #dc2626 (Red)');
    console.log('   Secondary Color: #b91c1c (Dark Red)');
    console.log('   Company: AdPools Group');
    console.log('   Logo: /uploads/branding/favicon_1760896671527.jpg');
    console.log('\n🚀 All users will now see the red theme by default!');

  } catch (error) {
    console.error('❌ Failed to set red theme default:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setRedThemeDefault();
