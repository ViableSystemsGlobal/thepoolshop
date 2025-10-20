const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserAbilities() {
  console.log('🔍 DEBUGGING USER ABILITIES...');

  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@adpools.com' },
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

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`👤 Admin User: ${adminUser.email} (ID: ${adminUser.id})`);
    console.log(`📋 Role: ${adminUser.role}`);
    console.log(`🔗 Role Assignments: ${adminUser.userRoles.length}`);

    // Get all abilities for this user
    const userAbilities = adminUser.userRoles.flatMap(ra =>
      ra.role.roleAbilities.map(rA => rA.ability.name)
    );

    console.log(`⚡ Total Abilities: ${userAbilities.length}`);

    // Check for specific user management abilities
    const userManagementAbilities = [
      'users.view',
      'users.create', 
      'users.edit',
      'users.delete',
      'users.manage',
      'settings.view',
      'settings.manage',
      'roles.view',
      'roles.manage'
    ];

    console.log('\n🔍 User Management Abilities Check:');
    userManagementAbilities.forEach(ability => {
      const hasAbility = userAbilities.includes(ability);
      console.log(`   ${hasAbility ? '✅' : '❌'} ${ability}`);
    });

    // Show first 20 abilities
    console.log('\n📋 First 20 abilities:');
    userAbilities.slice(0, 20).forEach((ability, index) => {
      console.log(`   ${index + 1}. ${ability}`);
    });

    // Check if we need to add missing user management abilities
    const missingAbilities = userManagementAbilities.filter(ability => 
      !userAbilities.includes(ability)
    );

    if (missingAbilities.length > 0) {
      console.log(`\n⚠️  Missing ${missingAbilities.length} user management abilities:`);
      missingAbilities.forEach(ability => console.log(`   - ${ability}`));
      
      console.log('\n🔧 Adding missing user management abilities...');
      
      const superAdminRole = adminUser.userRoles[0]?.role;
      if (superAdminRole) {
        for (const abilityName of missingAbilities) {
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
        
        console.log(`✅ Added ${missingAbilities.length} missing abilities`);
      }
    } else {
      console.log('\n✅ All user management abilities are present');
    }

    console.log('\n🎉 User abilities debug complete!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserAbilities();
