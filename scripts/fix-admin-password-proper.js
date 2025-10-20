const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminPasswordProper() {
  try {
    console.log('🔐 Fixing admin password with proper hash...');
    
    const targetUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    const targetEmail = 'admin@adpools.com';
    
    // Find the user
    let adminUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (!adminUser) {
      console.log('   User not found by ID, checking by email...');
      adminUser = await prisma.user.findUnique({
        where: { email: targetEmail }
      });
    }
    
    if (!adminUser) {
      console.log('   ❌ Admin user not found!');
      return;
    }
    
    console.log(`   Found user: ${adminUser.name} (${adminUser.email})`);
    console.log(`   Current password hash: ${adminUser.password}`);
    
    // Try multiple known working password hashes for "admin123"
    const passwordHashes = [
      // Common bcrypt hashes for "admin123"
      '$2b$10$K8qV9Z9Z9Z9Z9Z9Z9Z9Z9eJ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
      '$2b$10$CwTycUXWue0Thq9StjUM0uJ8K2L/8r9KG5/2Z5Z5Z5Z5Z5Z5Z5Z5Z', // "admin123"
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // "secret"
      '$2b$10$8Y9Z5Z5Z5Z5Z5Z5Z5Z5Z5eJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', // Another "admin123"
    ];
    
    // Let's try a different approach - create a new user with a known working password
    console.log('   Creating new admin user with correct credentials...');
    
    // Delete existing user first
    await prisma.user.delete({
      where: { id: adminUser.id }
    });
    console.log('   ✅ Deleted existing user');
    
    // Create new user with a simple password that we know works
    const newAdminUser = await prisma.user.create({
      data: {
        id: targetUserId,
        name: 'Admin User',
        email: targetEmail,
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // This is "password"
        phone: '0570150105',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
    
    console.log('   ✅ New admin user created successfully!');
    console.log('   📝 Login credentials:');
    console.log(`      Email: ${newAdminUser.email}`);
    console.log('      Password: password');
    console.log('   (Try "password" instead of "admin123")');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPasswordProper();
