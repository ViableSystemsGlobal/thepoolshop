const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function debugUploadState() {
  try {
    console.log('🔍 Debugging upload state...\n');
    
    // Check what's in the branding directory
    const brandingDir = '/app/uploads/branding';
    console.log('📁 Files in branding directory:');
    if (fs.existsSync(brandingDir)) {
      const files = fs.readdirSync(brandingDir);
      files.forEach(file => {
        const filePath = path.join(brandingDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${stats.size} bytes, ${stats.mtime})`);
      });
    } else {
      console.log('  ❌ Directory does not exist');
    }
    
    console.log('\n🗄️ Database settings:');
    
    // Check favicon setting
    const faviconSetting = await prisma.systemSettings.findUnique({
      where: { key: 'company_favicon' }
    });
    console.log('  Favicon setting:', faviconSetting?.value || 'Not set');
    
    // Check logo setting
    const logoSetting = await prisma.systemSettings.findUnique({
      where: { key: 'company_logo' }
    });
    console.log('  Logo setting:', logoSetting?.value || 'Not set');
    
    // Check if the files referenced in DB actually exist
    if (faviconSetting?.value) {
      const faviconPath = faviconSetting.value.replace('/uploads/', '/app/uploads/');
      console.log(`  Favicon file exists: ${fs.existsSync(faviconPath)} (${faviconPath})`);
    }
    
    if (logoSetting?.value) {
      const logoPath = logoSetting.value.replace('/uploads/', '/app/uploads/');
      console.log(`  Logo file exists: ${fs.existsSync(logoPath)} (${logoPath})`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUploadState();
