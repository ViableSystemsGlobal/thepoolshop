const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswordFinal() {
  try {
    console.log('🔐 Final password fix using bcryptjs...');
    
    const targetUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    const targetEmail = 'admin@adpools.com';
    const plainPassword = 'admin123';
    
    // Generate the correct hash using bcryptjs (same as auth.ts)
    console.log('   Generating password hash...');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log(`   Generated hash: ${hashedPassword}`);
    
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
      console.log('   ❌ Admin user not found! Creating new user...');
      
      adminUser = await prisma.user.create({
        data: {
          id: targetUserId,
          name: 'Admin User',
          email: targetEmail,
          password: hashedPassword,
          phone: '0570150105',
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      console.log('   ✅ New admin user created');
    } else {
      console.log(`   Found user: ${adminUser.name} (${adminUser.email})`);
      
      // Update the password with the correct hash
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { 
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      console.log('   ✅ Password updated with correct bcryptjs hash');
    }
    
    // Test the password hash
    console.log('   🧪 Testing password hash...');
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`   Hash validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`   User ID: ${adminUser.id}`);
    
    if (isValid) {
      console.log('\n🎉 Password fix completed successfully!');
      console.log('   You should now be able to login.');
    } else {
      console.log('\n❌ Password hash validation failed!');
    }
    
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

fixPasswordFinal();
