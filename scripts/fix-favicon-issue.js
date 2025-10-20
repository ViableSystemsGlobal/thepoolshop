const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixFaviconIssue() {
  try {
    console.log('🔍 Fixing favicon issue...\n');
    
    // 1. Check what's in the database
    const faviconSetting = await prisma.systemSettings.findUnique({
      where: { key: 'company_favicon' }
    });
    
    console.log('📊 Current favicon in database:', faviconSetting?.value || 'Not set');
    
    // 2. Check what files exist
    const brandingDir = '/app/uploads/branding';
    console.log('\n📁 Files in branding directory:');
    
    if (fs.existsSync(brandingDir)) {
      const files = fs.readdirSync(brandingDir);
      files.forEach(file => {
        console.log(`  - ${file}`);
      });
      
      // 3. Use the fallback favicon if it exists
      const fallbackFavicon = path.join(brandingDir, 'fallback-favicon.png');
      if (fs.existsSync(fallbackFavicon)) {
        console.log('\n✅ Found fallback-favicon.png, updating database...');
        
        await prisma.systemSettings.upsert({
          where: { key: 'company_favicon' },
          update: { value: '/uploads/branding/fallback-favicon.png' },
          create: { 
            key: 'company_favicon', 
            value: '/uploads/branding/fallback-favicon.png',
            description: 'Company favicon URL'
          }
        });
        
        console.log('✅ Database updated with fallback favicon');
      } else {
        console.log('\n⚠️ No fallback favicon found');
        
        // 4. Clear the invalid favicon path
        if (faviconSetting) {
          console.log('🧹 Clearing invalid favicon path from database...');
          await prisma.systemSettings.delete({
            where: { key: 'company_favicon' }
          });
          console.log('✅ Invalid favicon path cleared');
        }
      }
    } else {
      console.log('  ❌ Directory does not exist');
      
      // Create the directory
      console.log('\n📁 Creating branding directory...');
      fs.mkdirSync(brandingDir, { recursive: true });
      console.log('✅ Directory created');
      
      // Clear any invalid favicon path
      if (faviconSetting) {
        console.log('🧹 Clearing invalid favicon path from database...');
        await prisma.systemSettings.delete({
          where: { key: 'company_favicon' }
        });
        console.log('✅ Invalid favicon path cleared');
      }
    }
    
    console.log('\n✅ Favicon issue fixed!');
    console.log('📝 Next steps:');
    console.log('  1. Upload a new favicon in Settings → System');
    console.log('  2. The upload should now work correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFaviconIssue();
