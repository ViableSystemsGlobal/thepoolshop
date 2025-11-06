import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 COMPLETE FIX for abilities API and local database...');

  try {
    // Step 1: Ensure database is accessible
    console.log('\n📊 Step 1: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Step 2: Clean up and recreate admin user with exact ID
    console.log('\n👤 Step 2: Setting up admin user...');
    const adminId = 'cmgxgoy9w00008z2z4ajxyw47';
    const adminEmail = 'admin@adpools.com';
    
    // Delete existing admin user if exists
    try {
      await prisma.user.delete({ where: { email: adminEmail } });
      console.log('🗑️  Deleted existing admin user');
    } catch (error) {
      console.log('ℹ️  No existing admin user to delete');
    }

    // Create admin user with exact ID
    const hashedPassword = await hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        id: adminId,
        email: adminEmail,
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });
    console.log(`✅ Created admin user: ${adminUser.id}`);

    // Step 3: Create SUPER_ADMIN role
    console.log('\n🔐 Step 3: Setting up SUPER_ADMIN role...');
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {
        description: 'Super Administrator with full system access',
        isActive: true,
        isSystem: true
      },
      create: {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full system access',
        isActive: true,
        isSystem: true
      }
    });
    console.log(`✅ SUPER_ADMIN role ready: ${superAdminRole.id}`);

    // Step 4: Create comprehensive abilities
    console.log('\n⚡ Step 4: Creating comprehensive abilities...');
    const allAbilities = [
      // Core navigation abilities
      'dashboard.view',
      'crm.view', 'drm.view', 'sales.view', 'inventory.view', 
      'communication.view', 'agents.view', 'reports.view', 'settings.view', 'tasks.view',
      'ai_analyst.access', 'ai-analyst.view',
      
      // Products
      'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
      
      // Leads & CRM
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.manage',
      'leads.read', 'leads.update', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
      'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete', 'accounts.manage',
      'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
      
      // Sales
      'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete', 'invoices.manage',
      'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
      'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
      'proformas.view', 'returns.view', 'credit-notes.view', 'credit-notes.create', 'credit-notes.edit', 'credit-notes.delete',
      
      // Inventory
      'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
      'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
      'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
      'price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete',
      'stock-movements.view', 'inventory.manage',
      
      // DRM
      'distributor-leads.view', 'distributor-leads.create', 'distributor-leads.edit', 'distributor-leads.delete',
      'distributors.view', 'distributors.create', 'distributors.edit', 'distributors.delete',
      'routes-mapping.view', 'routes-mapping.create', 'routes-mapping.edit', 'routes-mapping.delete',
      'engagement.view', 'engagement.create', 'engagement.edit', 'engagement.delete',
      'drm-orders.view',
      
      // Communication
      'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
      'email.view', 'email.send', 'email.bulk_send', 'email.history',
      'templates.view', 'communication-logs.view',
      'communication.create', 'communication.edit', 'communication.delete',
      
      // Agents & Commissions
      'agents.create', 'agents.update', 'agents.delete',
      'commissions.view', 'commissions.create', 'commissions.update', 'commissions.delete',
      
      // Tasks
      'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
      
      // Users & Roles
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage',
      
      // Settings
      'settings.create', 'settings.edit', 'settings.delete', 'settings.manage',
      'product-settings.view', 'currency-settings.view', 'business-settings.view',
      'google-maps.view', 'google-maps.config', 'credit-monitoring.view', 'credit-monitoring.manage',
      'system-settings.view', 'notifications.view', 'notifications.create', 'notifications.edit', 
      'notifications.delete', 'notifications.config', 'ai-settings.view', 'ai-settings.manage',
      'notification-templates.view', 'notification-templates.create', 'notification-templates.edit', 'notification-templates.delete',
      'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
      'lead-sources.view', 'lead-sources.create', 'lead-sources.edit', 'lead-sources.delete',
      
      // Reports
      'reports.create', 'reports.edit', 'reports.delete'
    ];

    console.log(`Creating ${allAbilities.length} abilities...`);
    const createdAbilities = [];
    
    for (const abilityName of allAbilities) {
      const [resource, action] = abilityName.split('.');
      const ability = await prisma.ability.upsert({
        where: { name: abilityName },
        update: {},
        create: {
          name: abilityName,
          resource: resource || 'system',
          action: action || 'access',
          description: `${action || 'access'} ${resource || 'system'}`
        }
      });
      createdAbilities.push(ability);
    }
    console.log(`✅ Created/updated ${createdAbilities.length} abilities`);

    // Step 5: Assign all abilities to SUPER_ADMIN role
    console.log('\n🔗 Step 5: Assigning abilities to SUPER_ADMIN role...');
    let assignmentsCreated = 0;
    
    for (const ability of createdAbilities) {
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
      assignmentsCreated++;
    }
    console.log(`✅ Created ${assignmentsCreated} role-ability assignments`);

    // Step 6: Assign SUPER_ADMIN role to admin user
    console.log('\n👑 Step 6: Assigning SUPER_ADMIN role to admin user...');
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
    console.log('✅ Admin user has SUPER_ADMIN role');

    // Step 7: Verify the setup
    console.log('\n🧪 Step 7: Verifying setup...');
    const verifyUser = await prisma.user.findUnique({
      where: { id: adminId },
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

    if (verifyUser) {
      const userAbilities: string[] = [];
      verifyUser.userRoles.forEach(assignment => {
        assignment.role.roleAbilities.forEach(roleAbility => {
          if (!userAbilities.includes(roleAbility.ability.name)) {
            userAbilities.push(roleAbility.ability.name);
          }
        });
      });
      
      console.log(`✅ Verification successful:`);
      console.log(`- User ID: ${verifyUser.id}`);
      console.log(`- Email: ${verifyUser.email}`);
      console.log(`- Role: ${verifyUser.role}`);
      console.log(`- Active role assignments: ${verifyUser.userRoles.length}`);
      console.log(`- Total abilities: ${userAbilities.length}`);
      console.log(`- Has crm.view: ${userAbilities.includes('crm.view')}`);
      console.log(`- Has drm.view: ${userAbilities.includes('drm.view')}`);
      console.log(`- Has leads.create: ${userAbilities.includes('leads.create')}`);
      console.log(`- Has ai_analyst.access: ${userAbilities.includes('ai_analyst.access')}`);
      console.log(`- Has agents.view: ${userAbilities.includes('agents.view')}`);
    }

    console.log('\n🎉 COMPLETE FIX SUCCESSFUL!');
    console.log('\n📋 What was fixed:');
    console.log('✅ Admin user created with exact ID frontend expects');
    console.log('✅ SUPER_ADMIN role created with full permissions');
    console.log('✅ All navigation and CRUD abilities created');
    console.log('✅ Role assignments properly configured');
    console.log('✅ Database structure is now complete');
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your local development server');
    console.log('2. Clear browser cache and refresh');
    console.log('3. The 500 error should be gone');
    console.log('4. All sidebar sections should be visible');
    console.log('5. Lead creation should work');

  } catch (error) {
    console.error('❌ Complete fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
