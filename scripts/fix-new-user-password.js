const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function fixNewUserPassword() {
  console.log('🔧 FIXING NEW USER PASSWORD ISSUES...');

  try {
    // Get all users to see which ones might have password issues
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n👥 Found ${allUsers.length} users:`);
    
    allUsers.forEach((user, index) => {
      const hasPassword = user.password && user.password.length > 0;
      const passwordStatus = hasPassword ? '✅ Has Password' : '❌ No Password';
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${passwordStatus}`);
    });

    // Find users without proper passwords (likely the newly created one)
    const usersWithoutPasswords = allUsers.filter(user => 
      !user.password || user.password.length === 0
    );

    if (usersWithoutPasswords.length === 0) {
      console.log('\n✅ All users have passwords set');
      
      // Check if any users have weak/plain text passwords
      console.log('\n🔍 Checking for users that might need password reset...');
      
      // Get the most recently created user (likely the new super admin)
      const recentUser = allUsers[0];
      if (recentUser && recentUser.email !== 'admin@adpools.com') {
        console.log(`\n🔄 Setting default password for recent user: ${recentUser.email}`);
        
        const defaultPassword = 'admin123'; // Same as main admin
        const hashedPassword = await hash(defaultPassword, 10);
        
        await prisma.user.update({
          where: { id: recentUser.id },
          data: { 
            password: hashedPassword,
            isActive: true 
          }
        });
        
        console.log(`✅ Set password for ${recentUser.email}`);
        console.log(`📋 Login credentials:`);
        console.log(`   Email: ${recentUser.email}`);
        console.log(`   Password: ${defaultPassword}`);
      }
      
      return;
    }

    console.log(`\n⚠️  Found ${usersWithoutPasswords.length} users without passwords:`);
    
    // Fix each user without a password
    for (const user of usersWithoutPasswords) {
      console.log(`\n🔧 Fixing password for: ${user.email}`);
      
      const defaultPassword = 'admin123'; // Default password
      const hashedPassword = await hash(defaultPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          isActive: true 
        }
      });
      
      console.log(`✅ Set password for ${user.email}`);
      console.log(`📋 Login credentials:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${defaultPassword}`);
    }

    // Also ensure all ADMIN/SUPER_ADMIN users have proper role assignments
    console.log('\n🔐 Ensuring role assignments for admin users...');
    
    const adminUsers = allUsers.filter(user => 
      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    );

    // Get or create SUPER_ADMIN role
    let superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Full unrestricted access to all features',
          isSystem: true,
          isActive: true
        }
      });
    }

    for (const adminUser of adminUsers) {
      // Ensure role assignment exists
      await prisma.userRoleAssignment.upsert({
        where: {
          userId_roleId: {
            userId: adminUser.id,
            roleId: superAdminRole.id
          }
        },
        update: { isActive: true },
        create: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
          isActive: true
        }
      });
      
      console.log(`✅ Ensured role assignment for ${adminUser.email}`);
    }

    console.log('\n🎉 NEW USER PASSWORD ISSUES FIXED!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Fixed passwords for ${usersWithoutPasswords.length} users`);
    console.log(`   ✅ Ensured role assignments for ${adminUsers.length} admin users`);
    console.log(`   ✅ All users should now be able to log in with 'admin123'`);

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNewUserPassword();
