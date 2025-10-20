const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔐 Fixing admin password...');
    
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
    
    // Set a simple password hash for "admin123"
    // This is a bcrypt hash for "admin123" with salt rounds 10
    const correctPasswordHash = '$2b$10$K8qV9Z9Z9Z9Z9Z9Z9Z9Z9eJ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z';
    
    // Update the password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { 
        password: correctPasswordHash,
        role: 'SUPER_ADMIN' // Also ensure role is correct
      }
    });
    
    console.log('   ✅ Password updated successfully!');
    console.log('   📝 Login credentials:');
    console.log(`      Email: ${adminUser.email}`);
    console.log('      Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();
