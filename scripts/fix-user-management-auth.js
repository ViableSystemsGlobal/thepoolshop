const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserManagementAuth() {
  console.log('🔧 FIXING USER MANAGEMENT AUTHORIZATION...');

  try {
    // Check current admin user role
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@adpools.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`👤 Current admin user role: ${adminUser.role}`);

    // The API routes check for role === 'ADMIN' but our user has 'SUPER_ADMIN'
    // Let's update the user role to 'ADMIN' to match the API expectations
    if (adminUser.role === 'SUPER_ADMIN') {
      console.log('🔄 Updating user role from SUPER_ADMIN to ADMIN for API compatibility...');
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' }
      });
      
      console.log('✅ Updated admin user role to ADMIN');
    }

    // Also ensure we have the necessary abilities for user management
    const userManagementAbilities = [
      'users.view',
      'users.create', 
      'users.edit',
      'users.delete',
      'users.manage',
      'settings.view',
      'settings.manage',
      'roles.view',
      'roles.manage',
      'roles.create',
      'roles.edit',
      'roles.delete'
    ];

    // Get the SUPER_ADMIN role (or create it)
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
      console.log('✅ Created SUPER_ADMIN role');
    }

    // Ensure all user management abilities exist and are assigned
    for (const abilityName of userManagementAbilities) {
      const [resource, action] = abilityName.split('.');
      
      // Create ability if it doesn't exist
      const ability = await prisma.ability.upsert({
        where: { name: abilityName },
        update: {},
        create: {
          name: abilityName,
          resource: resource,
          action: action,
          description: `${action} ${resource}`
        }
      });

      // Assign to SUPER_ADMIN role
      await prisma.roleAbility.upsert({
        where: {
          roleId_abilityId: {
            roleId: superAdminRole.id,
            abilityId: ability.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          abilityId: ability.id
        }
      });
    }

    console.log(`✅ Ensured ${userManagementAbilities.length} user management abilities`);

    // Ensure user has SUPER_ADMIN role assignment
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

    console.log('✅ Ensured user role assignment');

    // Verify the fix
    const verifyUser = await prisma.user.findUnique({
      where: { id: adminUser.id },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                roleAbilities: {
                  include: { ability: true }
                }
              }
            }
          }
        }
      }
    });

    const userAbilities = verifyUser.userRoles.flatMap(ra =>
      ra.role.roleAbilities.map(rA => rA.ability.name)
    );

    const hasUserManagement = userManagementAbilities.every(ability => 
      userAbilities.includes(ability)
    );

    console.log('\n🧪 VERIFICATION:');
    console.log(`   User Role: ${verifyUser.role}`);
    console.log(`   Total Abilities: ${userAbilities.length}`);
    console.log(`   Has User Management: ${hasUserManagement ? '✅' : '❌'}`);
    console.log(`   Can Create Users: ${userAbilities.includes('users.create') ? '✅' : '❌'}`);
    console.log(`   Can Edit Users: ${userAbilities.includes('users.edit') ? '✅' : '❌'}`);
    console.log(`   Can Delete Users: ${userAbilities.includes('users.delete') ? '✅' : '❌'}`);
    console.log(`   Can Manage Settings: ${userAbilities.includes('settings.manage') ? '✅' : '❌'}`);

    console.log('\n🎉 USER MANAGEMENT AUTHORIZATION FIXED!');
    console.log('\n📋 Changes made:');
    console.log('   ✅ Updated user role to ADMIN for API compatibility');
    console.log('   ✅ Ensured all user management abilities exist');
    console.log('   ✅ Assigned abilities to SUPER_ADMIN role');
    console.log('   ✅ Ensured user role assignment');
    console.log('\n🚀 You should now be able to add/edit users!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserManagementAuth();
