const { PrismaClient } = require('@prisma/client');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function fixMissingUploads() {
  console.log('🔧 Fixing missing uploads and creating fallback files...');

  try {
    // Create uploads directories
    const uploadDirs = [
      '/app/uploads',
      '/app/uploads/branding',
      '/app/uploads/products',
      '/app/uploads/leads',
      '/app/uploads/tasks',
      '/app/uploads/warehouses',
      '/app/uploads/distributor-leads'
    ];

    for (const dir of uploadDirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    }

    // Create a simple fallback favicon
    const fallbackFaviconPath = '/app/uploads/branding/fallback-favicon.png';
    if (!existsSync(fallbackFaviconPath)) {
      // Create a simple 1x1 transparent PNG as fallback
      const fallbackPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      writeFileSync(fallbackFaviconPath, fallbackPng);
      console.log(`✅ Created fallback favicon: ${fallbackFaviconPath}`);
    }

    // Update system settings to use fallback files
    console.log('\n📝 Updating system settings with fallback paths...');
    
    const fallbackSettings = [
      { key: 'company_logo', value: '/uploads/branding/fallback-favicon.png' },
      { key: 'favicon', value: '/uploads/branding/fallback-favicon.png' }
    ];

    for (const setting of fallbackSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: 'branding'
        }
      });
      console.log(`✅ Updated ${setting.key} to use fallback`);
    }

    console.log('\n🎉 Upload fix complete!');
    console.log('\n📋 What this fixes:');
    console.log('   ✅ Creates missing upload directories');
    console.log('   ✅ Provides fallback favicon/logo files');
    console.log('   ✅ Updates database to use fallback paths');
    console.log('   ✅ Prevents 404 errors for missing images');
    console.log('\n⚠️  Note: Files will still be lost on container restart');
    console.log('   Consider setting up persistent storage for production');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingUploads();
