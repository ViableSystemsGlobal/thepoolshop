const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearOldFavicon() {
  try {
    console.log('🧹 Clearing old favicon from database...');
    
    // Delete the old favicon setting
    await prisma.systemSettings.deleteMany({
      where: {
        key: 'company_favicon'
      }
    });
    
    console.log('✅ Old favicon cleared from database');
    console.log('📝 Now try uploading a new favicon - it should work!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearOldFavicon();
