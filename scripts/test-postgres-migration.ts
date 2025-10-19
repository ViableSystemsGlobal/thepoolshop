import { PrismaClient } from '@prisma/client';

// Test PostgreSQL migration
async function testPostgresMigration() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://nanasasu@localhost:5432/adpoolsgroup_test"
      }
    }
  });

  try {
    console.log('🔄 Testing PostgreSQL migration...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL test database');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    // Test a simple query
    const settings = await prisma.systemSettings.findMany({
      take: 5
    });
    console.log(`📊 Found ${settings.length} system settings`);
    
    console.log('✅ PostgreSQL migration test successful!');
    
  } catch (error) {
    console.error('❌ PostgreSQL migration test failed:', error);
    console.log('💡 Make sure to run: npx prisma migrate deploy');
  } finally {
    await prisma.$disconnect();
  }
}

testPostgresMigration();
