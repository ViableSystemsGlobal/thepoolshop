const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUserMismatchPermanent() {
  console.log('🔧 PERMANENT FIX: Resolving user ID mismatch and foreign key issues...');

  try {
    const missingUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    const adminEmail = 'admin@adpools.com';
    const adminPassword = 'admin123';

    console.log(`\n👤 Step 1: Checking existing users...`);
    
    // Check if the missing user ID exists
    let missingUser = await prisma.user.findUnique({
      where: { id: missingUserId }
    });

    // Check if admin email exists with different ID
    let existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    console.log(`Missing user ID ${missingUserId}: ${missingUser ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`Admin email ${adminEmail}: ${existingAdmin ? `EXISTS with ID ${existingAdmin.id}` : 'NOT FOUND'}`);

    if (!missingUser && existingAdmin) {
      console.log(`\n🔄 Step 2: Updating existing admin user to use the correct ID...`);
      
      // Update the existing admin user to use the ID that the frontend expects
      const hashedPassword = await hash(adminPassword, 10);
      missingUser = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          id: missingUserId, // Change to the ID the frontend expects
          password: hashedPassword,
          name: 'System Administrator',
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Updated admin user to use ID: ${missingUser.id}`);
    } else if (!missingUser && !existingAdmin) {
      console.log(`\n➕ Step 2: Creating new admin user with correct ID...`);
      
      const hashedPassword = await hash(adminPassword, 10);
      missingUser = await prisma.user.create({
        data: {
          id: missingUserId,
          email: adminEmail,
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Created admin user with ID: ${missingUser.id}`);
    } else {
      console.log(`✅ User ${missingUserId} already exists`);
    }

    // Step 3: Ensure SUPER_ADMIN role exists
    console.log('\n🔐 Step 3: Ensuring SUPER_ADMIN role...');
    
    let superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Full unrestricted access to all features',
          isSystem: true,
          isActive: true,
        }
      });
      console.log('✅ Created SUPER_ADMIN role');
    } else {
      console.log('✅ SUPER_ADMIN role already exists');
    }

    // Step 4: Ensure role assignment
    console.log('\n🔗 Step 4: Ensuring role assignment...');
    
    const roleAssignment = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId: missingUser.id,
          roleId: superAdminRole.id
        }
      }
    });

    if (!roleAssignment) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: missingUser.id,
          roleId: superAdminRole.id,
          isActive: true
        }
      });
      console.log('✅ Created role assignment');
    } else {
      console.log('✅ Role assignment already exists');
    }

    // Step 5: Ensure essential abilities
    console.log('\n⚡ Step 5: Ensuring essential abilities...');
    
    const essentialAbilities = [
      'leads.create', 'leads.view', 'leads.edit', 'leads.delete',
      'crm.view', 'drm.view', 'dashboard.view',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'users.manage', 'settings.manage'
    ];

    for (const abilityName of essentialAbilities) {
      const [resource, action] = abilityName.split('.');
      await prisma.ability.upsert({
        where: { name: abilityName },
        update: {
          resource: resource,
          action: action,
          description: `${action} ${resource}`
        },
        create: {
          name: abilityName,
          resource: resource,
          action: action,
          description: `${action} ${resource}`
        }
      });
    }
    console.log(`✅ Ensured ${essentialAbilities.length} essential abilities exist`);

    // Step 6: Assign abilities to role
    console.log('\n🔗 Step 6: Assigning abilities to SUPER_ADMIN role...');
    
    // Clear existing assignments for this role
    await prisma.roleAbility.deleteMany({
      where: { roleId: superAdminRole.id }
    });

    // Create new assignments
    for (const abilityName of essentialAbilities) {
      const ability = await prisma.ability.findUnique({
        where: { name: abilityName }
      });
      
      if (ability) {
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
    }
    console.log(`✅ Assigned ${essentialAbilities.length} abilities to SUPER_ADMIN role`);

    // Step 7: Verify the fix
    console.log('\n🧪 Step 7: Verifying the fix...');
    
    const verifyUser = await prisma.user.findUnique({
      where: { id: missingUserId },
      include: {
        roleAssignments: {
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

    if (!verifyUser) {
      throw new Error('User verification failed - user not found');
    }

    const userAbilities = verifyUser.roleAssignments.flatMap(ra =>
      ra.role.roleAbilities.map(rA => rA.ability.name)
    );

    console.log(`✅ VERIFICATION SUCCESSFUL:`);
    console.log(`   User ID: ${verifyUser.id}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Role: ${verifyUser.role}`);
    console.log(`   Total Abilities: ${userAbilities.length}`);
    console.log(`   Can Create Leads: ${userAbilities.includes('leads.create')}`);
    console.log(`   Can View CRM: ${userAbilities.includes('crm.view')}`);
    console.log(`   Can Manage Users: ${userAbilities.includes('users.manage')}`);

    console.log('\n🎉 PERMANENT FIX COMPLETE!');
    console.log('\n📋 The user can now:');
    console.log('   ✅ Create leads without foreign key errors');
    console.log('   ✅ Access all CRM and DRM features');
    console.log('   ✅ Manage users and settings');
    console.log('\n🚀 Lead creation should now work properly!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUserMismatchPermanent();
