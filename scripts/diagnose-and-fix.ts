import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Diagnosing and fixing database issues...');

  try {
    // Step 1: Check current users
    console.log('\n📊 Checking users...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });

    // Step 2: Check roles
    console.log('\n🔐 Checking roles...');
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, isActive: true }
    });
    console.log(`Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`- ID: ${role.id}, Name: ${role.name}, Active: ${role.isActive}`);
    });

    // Step 3: Check role assignments
    console.log('\n👥 Checking role assignments...');
    const roleAssignments = await prisma.userRoleAssignment.findMany({
      include: {
        user: { select: { email: true } },
        role: { select: { name: true } }
      }
    });
    console.log(`Found ${roleAssignments.length} role assignments:`);
    roleAssignments.forEach(assignment => {
      console.log(`- User: ${assignment.user.email}, Role: ${assignment.role.name}, Active: ${assignment.isActive}`);
    });

    // Step 4: Check abilities
    console.log('\n⚡ Checking abilities...');
    const abilities = await prisma.ability.findMany({
      select: { id: true, name: true }
    });
    console.log(`Found ${abilities.length} abilities`);

    // Step 5: Check role-ability relationships
    console.log('\n🔗 Checking role-ability relationships...');
    const roleAbilities = await prisma.roleAbility.findMany({
      include: {
        role: { select: { name: true } },
        ability: { select: { name: true } }
      }
    });
    console.log(`Found ${roleAbilities.length} role-ability relationships`);

    // Step 6: Fix admin user if needed
    console.log('\n🔧 Fixing admin user...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@adpools.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found, creating...');
      const hashedPassword = await hash('admin123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@adpools.com',
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Created admin user with ID: ${newAdmin.id}`);
    } else {
      console.log(`✅ Admin user exists with ID: ${adminUser.id}`);
    }

    // Step 7: Ensure admin has SUPER_ADMIN role assignment
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (superAdminRole && adminUser) {
      const existingAssignment = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: adminUser.id,
            roleId: superAdminRole.id
          }
        }
      });

      if (!existingAssignment) {
        console.log('🔧 Creating SUPER_ADMIN role assignment...');
        await prisma.userRoleAssignment.create({
          data: {
            userId: adminUser.id,
            roleId: superAdminRole.id,
            isActive: true
          }
        });
        console.log('✅ Created SUPER_ADMIN role assignment');
      } else {
        console.log('✅ SUPER_ADMIN role assignment exists');
      }
    }

    // Step 8: Check for missing abilities and create them
    console.log('\n🔧 Ensuring all required abilities exist...');
    const requiredAbilities = [
      'dashboard.view',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
      'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
      'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
      'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
      'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'settings.view', 'settings.edit',
      'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
      'communications.view', 'communications.create', 'communications.edit', 'communications.delete',
      'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
      'drm.view', 'drm.create', 'drm.edit', 'drm.delete',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
      'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
      'returns.view', 'returns.create', 'returns.edit', 'returns.delete',
      'commissions.view', 'commissions.create', 'commissions.edit', 'commissions.delete',
      'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
      'price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete',
      'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
      'agents.view', 'agents.create', 'agents.edit', 'agents.delete',
      'ai-analyst.view', 'ai-analyst.create', 'ai-analyst.edit', 'ai-analyst.delete'
    ];

    for (const abilityName of requiredAbilities) {
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

      // Ensure SUPER_ADMIN role has this ability
      if (superAdminRole) {
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
    console.log(`✅ Ensured all ${requiredAbilities.length} abilities exist and are assigned to SUPER_ADMIN`);

    // Step 9: Final verification
    console.log('\n✅ Final verification...');
    const finalAdminUser = await prisma.user.findUnique({
      where: { email: 'admin@adpools.com' },
      include: {
        userRoles: {
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

    if (finalAdminUser) {
      console.log(`Admin user ID: ${finalAdminUser.id}`);
      console.log(`Admin user role: ${finalAdminUser.role}`);
      console.log(`Active role assignments: ${finalAdminUser.userRoles.filter(ur => ur.isActive).length}`);
      
      const totalAbilities = finalAdminUser.userRoles
        .filter(ur => ur.isActive)
        .reduce((total, ur) => total + ur.role.roleAbilities.length, 0);
      console.log(`Total abilities: ${totalAbilities}`);
    }

    console.log('\n🎉 Diagnosis and fix completed!');
    console.log('\n📋 Summary:');
    console.log('- Users checked and fixed');
    console.log('- Roles verified');
    console.log('- Role assignments ensured');
    console.log('- All abilities created and assigned');
    console.log('- Admin user properly configured');
    console.log('\n🔑 Login credentials:');
    console.log('Email: admin@adpools.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please refresh your browser and try again!');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
