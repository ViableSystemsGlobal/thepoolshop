import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Quick fix for user and abilities...');

  try {
    const problematicUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    
    // Step 1: Ensure the user exists
    console.log('\n👤 Step 1: Ensuring user exists...');
    let user = await prisma.user.findUnique({
      where: { id: problematicUserId }
    });

    if (!user) {
      console.log('Creating missing user...');
      const hashedPassword = await hash('admin123', 10);
      user = await prisma.user.create({
        data: {
          id: problematicUserId,
          email: 'admin@adpools.com',
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Created user: ${user.id}`);
    } else {
      console.log(`✅ User exists: ${user.email}`);
    }

    // Step 2: Ensure SUPER_ADMIN role exists
    console.log('\n🔐 Step 2: Ensuring SUPER_ADMIN role exists...');
    let superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (!superAdminRole) {
      console.log('Creating SUPER_ADMIN role...');
      superAdminRole = await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Super Administrator with full system access',
          isSystem: true,
          isActive: true,
        }
      });
      console.log(`✅ Created role: ${superAdminRole.name}`);
    } else {
      console.log(`✅ Role exists: ${superAdminRole.name}`);
    }

    // Step 3: Ensure role assignment exists
    console.log('\n🔗 Step 3: Ensuring role assignment exists...');
    let roleAssignment = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId: problematicUserId,
          roleId: superAdminRole.id
        }
      }
    });

    if (!roleAssignment) {
      console.log('Creating role assignment...');
      roleAssignment = await prisma.userRoleAssignment.create({
        data: {
          userId: problematicUserId,
          roleId: superAdminRole.id,
          isActive: true
        }
      });
      console.log(`✅ Created role assignment`);
    } else {
      console.log(`✅ Role assignment exists`);
    }

    // Step 4: Ensure basic abilities exist
    console.log('\n⚡ Step 4: Ensuring basic abilities exist...');
    const basicAbilities = [
      'dashboard.view',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
      'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
      'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
      'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
      'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
      'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'settings.view', 'settings.create', 'settings.edit', 'settings.delete',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
      'communication.view', 'communication.create', 'communication.edit', 'communication.delete',
      'agents.view', 'agents.create', 'agents.edit', 'agents.delete',
      'commissions.view', 'commissions.create', 'commissions.edit', 'commissions.delete',
      'drm.view', 'drm.create', 'drm.edit', 'drm.delete',
      'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
      'ai_analyst.access', 'ai-analyst.view'
    ];

    let abilitiesCreated = 0;
    for (const abilityName of basicAbilities) {
      const ability = await prisma.ability.upsert({
        where: { name: abilityName },
        update: {},
        create: {
          name: abilityName,
          resource: abilityName.split('.')[0],
          action: abilityName.split('.')[1],
          description: `${abilityName.split('.')[1]} ${abilityName.split('.')[0]}`
        }
      });

      // Check if role-ability assignment exists
      const roleAbility = await prisma.roleAbility.findUnique({
        where: {
          roleId_abilityId: {
            roleId: superAdminRole.id,
            abilityId: ability.id
          }
        }
      });

      if (!roleAbility) {
        await prisma.roleAbility.create({
          data: {
            roleId: superAdminRole.id,
            abilityId: ability.id
          }
        });
        abilitiesCreated++;
      }
    }
    console.log(`✅ Ensured ${basicAbilities.length} abilities exist, created ${abilitiesCreated} new assignments`);

    // Step 5: Test the abilities API
    console.log('\n🧪 Step 5: Testing abilities API...');
    const userWithRoles = await prisma.user.findUnique({
      where: { id: problematicUserId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                roleAbilities: {
                  include: {
                    ability: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (userWithRoles) {
      const abilities: string[] = [];
      userWithRoles.userRoles.forEach(assignment => {
        assignment.role.roleAbilities.forEach(roleAbility => {
          if (!abilities.includes(roleAbility.ability.name)) {
            abilities.push(roleAbility.ability.name);
          }
        });
      });
      
      console.log(`✅ User has ${abilities.length} abilities`);
      console.log(`✅ Sample abilities: ${abilities.slice(0, 5).join(', ')}`);
    }

    console.log('\n🎉 Quick fix completed!');
    console.log('\n📋 What was fixed:');
    console.log('- ✅ User exists with correct ID');
    console.log('- ✅ SUPER_ADMIN role exists');
    console.log('- ✅ Role assignment exists');
    console.log('- ✅ Basic abilities exist and are assigned');
    console.log('\n⚠️  Try refreshing your browser and creating a lead now!');

  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
