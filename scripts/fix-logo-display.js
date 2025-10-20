const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixLogoDisplay() {
  try {
    console.log('🖼️ Fixing logo display issue...');
    
    // Check current company logo setting
    const currentSettings = await prisma.systemSettings.findFirst();
    console.log('Current logo setting:', currentSettings?.company_logo);
    
    // Check what files exist in the branding directory
    const brandingDir = '/app/uploads/branding';
    console.log(`\n📁 Checking files in ${brandingDir}:`);
    
    try {
      const files = fs.readdirSync(brandingDir);
      console.log('Files found:', files);
      
      // Look for any favicon or logo files
      const logoFiles = files.filter(file => 
        file.includes('favicon') || file.includes('logo')
      );
      console.log('Logo/favicon files:', logoFiles);
      
      if (logoFiles.length > 0) {
        // Use the most recent favicon file
        const latestFavicon = logoFiles
          .filter(file => file.includes('favicon'))
          .sort()
          .pop();
        
        if (latestFavicon) {
          const logoPath = `/uploads/branding/${latestFavicon}`;
          console.log(`\n🔧 Setting logo to: ${logoPath}`);
          
          // Update the database
          await prisma.systemSettings.upsert({
            where: { id: currentSettings?.id || 'default' },
            update: { 
              company_logo: logoPath,
              updatedAt: new Date()
            },
            create: {
              id: 'default',
              company_name: 'AdPools Group',
              company_logo: logoPath,
              primary_color: '#dc2626',
              secondary_color: '#b91c1c',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          console.log('✅ Database updated with correct logo path');
        }
      } else {
        console.log('\n⚠️ No logo files found. Creating fallback...');
        
        // Create a simple SVG favicon as fallback
        const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#dc2626" rx="20"/>
  <text x="50" y="60" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">AP</text>
</svg>`;
        
        const fallbackPath = path.join(brandingDir, 'favicon_default.svg');
        fs.writeFileSync(fallbackPath, fallbackSvg);
        console.log('✅ Created fallback SVG favicon');
        
        // Update database to use fallback
        await prisma.systemSettings.upsert({
          where: { id: currentSettings?.id || 'default' },
          update: { 
            company_logo: '/uploads/branding/favicon_default.svg',
            updatedAt: new Date()
          },
          create: {
            id: 'default',
            company_name: 'AdPools Group',
            company_logo: '/uploads/branding/favicon_default.svg',
            primary_color: '#dc2626',
            secondary_color: '#b91c1c',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log('✅ Database updated with fallback logo');
      }
      
    } catch (dirError) {
      console.log('Directory not accessible, creating it...');
      fs.mkdirSync(brandingDir, { recursive: true });
      
      // Create a simple SVG favicon
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#dc2626" rx="20"/>
  <text x="50" y="60" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">AP</text>
</svg>`;
      
      const fallbackPath = path.join(brandingDir, 'favicon_default.svg');
      fs.writeFileSync(fallbackPath, fallbackSvg);
      console.log('✅ Created directory and fallback SVG favicon');
      
      // Update database
      await prisma.systemSettings.upsert({
        where: { id: currentSettings?.id || 'default' },
        update: { 
          company_logo: '/uploads/branding/favicon_default.svg',
          updatedAt: new Date()
        },
        create: {
          id: 'default',
          company_name: 'AdPools Group',
          company_logo: '/uploads/branding/favicon_default.svg',
          primary_color: '#dc2626',
          secondary_color: '#b91c1c',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Database updated with fallback logo');
    }
    
    // Verify the final setting
    const finalSettings = await prisma.systemSettings.findFirst();
    console.log('\n📊 Final logo setting:', finalSettings?.company_logo);
    
    console.log('\n🎉 Logo display fix completed!');
    console.log('The login page should now show the company logo.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLogoDisplay();
