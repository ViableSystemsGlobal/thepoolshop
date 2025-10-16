const { PrismaClient } = require('@prisma/client');

async function testWrite() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database write...');
    
    const result = await prisma.systemSettings.upsert({
      where: { key: 'test_key' },
      update: { value: 'test_value_updated' },
      create: {
        key: 'test_key',
        value: 'test_value',
        type: 'string',
        category: 'test'
      }
    });
    
    console.log('✅ Database write successful:', result);
    
    // Clean up
    await prisma.systemSettings.delete({
      where: { key: 'test_key' }
    });
    
    console.log('✅ Test record deleted');
    
  } catch (error) {
    console.error('❌ Database write failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWrite();
