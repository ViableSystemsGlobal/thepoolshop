const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAllUserConstraints() {
  console.log('🔧 COMPREHENSIVE FIX: Resolving ALL user ID mismatches and foreign key constraints...');

  try {
    const missingUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    const adminEmail = 'admin@adpools.com';
    const adminPassword = 'admin123';

    console.log(`\n👤 Step 1: Checking and fixing user ${missingUserId}...`);
    
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
      console.log(`\n🔄 Updating existing admin user to use the correct ID...`);
      
      // First, we need to update all foreign key references to use the new ID
      console.log('   📝 Updating all foreign key references...');
      
      // Update leads
      await prisma.lead.updateMany({
        where: { ownerId: existingAdmin.id },
        data: { ownerId: missingUserId }
      });
      console.log('   ✅ Updated leads');

      // Update distributors
      await prisma.distributor.updateMany({
        where: { approvedBy: existingAdmin.id },
        data: { approvedBy: missingUserId }
      });
      console.log('   ✅ Updated distributors');

      // Update invoices
      await prisma.invoice.updateMany({
        where: { ownerId: existingAdmin.id },
        data: { ownerId: missingUserId }
      });
      console.log('   ✅ Updated invoices');

      // Update quotations
      await prisma.quotation.updateMany({
        where: { ownerId: existingAdmin.id },
        data: { ownerId: missingUserId }
      });
      console.log('   ✅ Updated quotations');

      // Update tasks
      await prisma.task.updateMany({
        where: { createdBy: existingAdmin.id },
        data: { createdBy: missingUserId }
      });
      console.log('   ✅ Updated tasks');

      // Update accounts
      await prisma.account.updateMany({
        where: { ownerId: existingAdmin.id },
        data: { ownerId: missingUserId }
      });
      console.log('   ✅ Updated accounts');

      // Update user role assignments
      await prisma.userRoleAssignment.updateMany({
        where: { userId: existingAdmin.id },
        data: { userId: missingUserId }
      });
      console.log('   ✅ Updated user role assignments');

      // Now update the user record itself
      const hashedPassword = await hash(adminPassword, 10);
      missingUser = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          id: missingUserId,
          password: hashedPassword,
          name: 'System Administrator',
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Updated admin user to use ID: ${missingUser.id}`);
    } else if (!missingUser && !existingAdmin) {
      console.log(`\n➕ Creating new admin user with correct ID...`);
      
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

    // Step 2: Ensure SUPER_ADMIN role exists
    console.log('\n🔐 Step 2: Ensuring SUPER_ADMIN role...');
    
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

    // Step 3: Ensure role assignment
    console.log('\n🔗 Step 3: Ensuring role assignment...');
    
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

    // Step 4: Ensure comprehensive abilities
    console.log('\n⚡ Step 4: Ensuring comprehensive abilities...');
    
    const allAbilities = [
      // Core abilities
      'dashboard.view',
      'leads.create', 'leads.view', 'leads.edit', 'leads.delete',
      'crm.view', 'drm.view',
      'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
      'users.manage', 'settings.manage',
      
      // Distributor abilities
      'distributors.create', 'distributors.view', 'distributors.edit', 'distributors.delete',
      'distributor-leads.create', 'distributor-leads.view', 'distributor-leads.edit', 'distributor-leads.delete',
      
      // Sales abilities
      'quotations.create', 'quotations.view', 'quotations.edit', 'quotations.delete',
      'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete',
      'orders.create', 'orders.view', 'orders.edit', 'orders.delete',
      
      // Inventory abilities
      'inventory.view', 'inventory.manage',
      'warehouses.create', 'warehouses.view', 'warehouses.edit', 'warehouses.delete',
      'stock.view', 'stock.manage',
      
      // Communication abilities
      'communication.view', 'communication.manage',
      'sms.send', 'email.send',
      
      // Task abilities
      'tasks.create', 'tasks.view', 'tasks.edit', 'tasks.delete',
      
      // Report abilities
      'reports.view', 'reports.generate',
      
      // Agent abilities
      'agents.view', 'agents.manage',
      'commissions.view', 'commissions.manage'
    ];

    for (const abilityName of allAbilities) {
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
    console.log(`✅ Ensured ${allAbilities.length} comprehensive abilities exist`);

    // Step 5: Assign all abilities to SUPER_ADMIN role
    console.log('\n🔗 Step 5: Assigning all abilities to SUPER_ADMIN role...');
    
    // Clear existing assignments for this role
    await prisma.roleAbility.deleteMany({
      where: { roleId: superAdminRole.id }
    });

    // Create new assignments
    for (const abilityName of allAbilities) {
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
    console.log(`✅ Assigned ${allAbilities.length} abilities to SUPER_ADMIN role`);

    // Step 6: Verify the fix
    console.log('\n🧪 Step 6: Verifying the comprehensive fix...');
    
    const verifyUser = await prisma.user.findUnique({
      where: { id: missingUserId },
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

    if (!verifyUser) {
      throw new Error('User verification failed - user not found');
    }

    const userAbilities = verifyUser.userRoles.flatMap(ra =>
      ra.role.roleAbilities.map(rA => rA.ability.name)
    );

    console.log(`✅ COMPREHENSIVE VERIFICATION SUCCESSFUL:`);
    console.log(`   User ID: ${verifyUser.id}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Role: ${verifyUser.role}`);
    console.log(`   Total Abilities: ${userAbilities.length}`);
    console.log(`   Can Create Leads: ${userAbilities.includes('leads.create')}`);
    console.log(`   Can Create Distributors: ${userAbilities.includes('distributors.create')}`);
    console.log(`   Can View CRM: ${userAbilities.includes('crm.view')}`);
    console.log(`   Can Manage Users: ${userAbilities.includes('users.manage')}`);

    console.log('\n🎉 COMPREHENSIVE FIX COMPLETE!');
    console.log('\n📋 The user can now:');
    console.log('   ✅ Create leads without foreign key errors');
    console.log('   ✅ Create distributors without foreign key errors');
    console.log('   ✅ Access all CRM and DRM features');
    console.log('   ✅ Manage all aspects of the system');
    console.log('\n🚀 ALL foreign key constraint issues should now be resolved!');

  } catch (error) {
    console.error('❌ Comprehensive fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAllUserConstraints();
