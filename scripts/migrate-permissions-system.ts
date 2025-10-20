import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Complete list of all abilities in the system
const ALL_ABILITIES = [
  // Dashboard
  'dashboard.view',
  
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
  'stock-movements.view', 'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage',
  
  // DRM (Distributor Relationship Management)
  'drm.view', 'drm.create', 'drm.edit', 'drm.delete', 'drm.manage',
  'distributor-leads.view', 'distributor-leads.create', 'distributor-leads.edit', 'distributor-leads.delete',
  'distributors.view', 'distributors.create', 'distributors.edit', 'distributors.delete',
  'routes-mapping.view', 'routes-mapping.create', 'routes-mapping.edit', 'routes-mapping.delete',
  'engagement.view', 'engagement.create', 'engagement.edit', 'engagement.delete',
  'drm-orders.view',
  
  // Communication
  'communication.view', 'communication.create', 'communication.edit', 'communication.delete',
  'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
  'email.view', 'email.send', 'email.bulk_send', 'email.history',
  'templates.view', 'communication-logs.view',
  
  // Agents & Commissions
  'agents.view', 'agents.create', 'agents.update', 'agents.delete',
  'commissions.view', 'commissions.create', 'commissions.update', 'commissions.delete',
  
  // Tasks
  'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
  
  // Users & Roles
  'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage',
  'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage',
  
  // Settings
  'settings.view', 'settings.create', 'settings.edit', 'settings.delete', 'settings.manage',
  'product-settings.view', 'currency-settings.view', 'business-settings.view',
  'google-maps.view', 'google-maps.config', 'credit-monitoring.view', 'credit-monitoring.manage',
  'system-settings.view', 'notifications.view', 'notifications.create', 'notifications.edit', 
  'notifications.delete', 'notifications.config', 'ai-settings.view', 'ai-settings.manage',
  'notification-templates.view', 'notification-templates.create', 'notification-templates.edit', 'notification-templates.delete',
  'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
  'lead-sources.view', 'lead-sources.create', 'lead-sources.edit', 'lead-sources.delete',
  
  // Reports
  'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
  
  // AI & Analytics
  'ai_analyst.access', 'ai-analyst.view',
  
  // Navigation abilities (for sidebar visibility)
  'crm.view', 'sales.view', 'inventory.view', 'communication.view', 'reports.view'
];

// Role definitions with their abilities
const ROLE_DEFINITIONS = {
  'SUPER_ADMIN': {
    name: 'SUPER_ADMIN',
    description: 'Super Administrator with full system access',
    abilities: ALL_ABILITIES, // Super admin gets everything
    isSystem: true,
    isActive: true
  },
  'ADMIN': {
    name: 'ADMIN',
    description: 'Administrator with most system access',
    abilities: ALL_ABILITIES.filter(ability => 
      !ability.includes('users.delete') && 
      !ability.includes('roles.delete') &&
      !ability.includes('settings.delete')
    ),
    isSystem: true,
    isActive: true
  },
  'MANAGER': {
    name: 'MANAGER',
    description: 'Manager with operational access',
    abilities: [
      'dashboard.view',
      'products.view', 'products.create', 'products.edit',
      'leads.view', 'leads.create', 'leads.edit',
      'accounts.view', 'accounts.create', 'accounts.edit',
      'invoices.view', 'invoices.create', 'invoices.edit',
      'quotations.view', 'quotations.create', 'quotations.edit',
      'payments.view', 'payments.create', 'payments.edit',
      'orders.view', 'orders.create', 'orders.edit',
      'warehouses.view', 'warehouses.create', 'warehouses.edit',
      'stock.view', 'stock.create', 'stock.edit',
      'inventory.view', 'inventory.create', 'inventory.edit',
      'users.view', 'users.create', 'users.edit',
      'reports.view', 'reports.create',
      'tasks.view', 'tasks.create', 'tasks.edit',
      'communication.view', 'communication.create',
      'crm.view', 'sales.view', 'inventory.view'
    ],
    isSystem: true,
    isActive: true
  },
  'SALES_REP': {
    name: 'SALES_REP',
    description: 'Sales Representative with sales-focused access',
    abilities: [
      'dashboard.view',
      'products.view',
      'leads.view', 'leads.create', 'leads.edit',
      'accounts.view', 'accounts.create', 'accounts.edit',
      'invoices.view', 'invoices.create', 'invoices.edit',
      'quotations.view', 'quotations.create', 'quotations.edit',
      'payments.view', 'payments.create',
      'orders.view', 'orders.create', 'orders.edit',
      'reports.view',
      'tasks.view', 'tasks.create', 'tasks.edit',
      'communication.view', 'communication.create',
      'crm.view', 'sales.view'
    ],
    isSystem: true,
    isActive: true
  },
  'VIEWER': {
    name: 'VIEWER',
    description: 'Read-only access to most system features',
    abilities: [
      'dashboard.view',
      'products.view',
      'leads.view',
      'accounts.view',
      'invoices.view',
      'quotations.view',
      'payments.view',
      'orders.view',
      'warehouses.view',
      'stock.view',
      'inventory.view',
      'users.view',
      'reports.view',
      'tasks.view',
      'communication.view',
      'crm.view', 'sales.view', 'inventory.view'
    ],
    isSystem: true,
    isActive: true
  }
};

async function main() {
  console.log('🚀 MIGRATING PERMISSIONS SYSTEM - Starting comprehensive setup...');

  try {
    // Step 1: Create all abilities
    console.log('\n⚡ Step 1: Creating all abilities...');
    const createdAbilities = [];
    
    for (const abilityName of ALL_ABILITIES) {
      const [resource, action] = abilityName.split('.');
      const ability = await prisma.ability.upsert({
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
      createdAbilities.push(ability);
    }
    console.log(`✅ Created/updated ${createdAbilities.length} abilities`);

    // Step 2: Create all roles
    console.log('\n🔐 Step 2: Creating all roles...');
    const createdRoles = [];
    
    for (const [roleKey, roleData] of Object.entries(ROLE_DEFINITIONS)) {
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {
          description: roleData.description,
          isSystem: roleData.isSystem,
          isActive: roleData.isActive
        },
        create: {
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
          isActive: roleData.isActive
        }
      });
      createdRoles.push({ role, abilities: roleData.abilities });
      console.log(`✅ Created/updated role: ${role.name}`);
    }

    // Step 3: Assign abilities to roles
    console.log('\n🔗 Step 3: Assigning abilities to roles...');
    let totalAssignments = 0;
    
    for (const { role, abilities } of createdRoles) {
      // Clear existing assignments for this role
      await prisma.roleAbility.deleteMany({
        where: { roleId: role.id }
      });
      
      // Create new assignments using upsert to avoid conflicts
      for (const abilityName of abilities) {
        const ability = createdAbilities.find(a => a.name === abilityName);
        if (ability) {
          await prisma.roleAbility.upsert({
            where: {
              roleId_abilityId: {
                roleId: role.id,
                abilityId: ability.id
              }
            },
            update: {},
            create: {
              roleId: role.id,
              abilityId: ability.id
            }
          });
          totalAssignments++;
        }
      }
      console.log(`✅ Assigned ${abilities.length} abilities to ${role.name}`);
    }
    console.log(`✅ Total role-ability assignments: ${totalAssignments}`);

    // Step 4: Ensure admin user exists and has SUPER_ADMIN role
    console.log('\n👤 Step 4: Setting up admin user...');
    const adminEmail = 'admin@adpools.com';
    const adminPassword = 'admin123';
    const adminId = 'cmgxgoy9w00008z2z4ajxyw47';
    
    // Create or update admin user
    const hashedPassword = await hash(adminPassword, 10);
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      },
      create: {
        id: adminId,
        email: adminEmail,
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
    console.log(`✅ Admin user ready: ${adminUser.email}`);

    // Step 5: Assign SUPER_ADMIN role to admin user
    console.log('\n👑 Step 5: Assigning SUPER_ADMIN role to admin user...');
    const superAdminRole = createdRoles.find(r => r.role.name === 'SUPER_ADMIN')?.role;
    
    if (superAdminRole) {
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
      console.log('✅ Admin user assigned SUPER_ADMIN role');
    }

    // Step 6: Create system settings
    console.log('\n⚙️  Step 6: Creating system settings...');
    const systemSettings = [
      { key: 'company_name', value: 'AdPools Group', category: 'branding' },
      { key: 'company_logo', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'favicon', value: '/uploads/branding/favicon_1760896671527.jpg', category: 'branding' },
      { key: 'primary_color', value: '#8B5CF6', category: 'branding' },
      { key: 'secondary_color', value: '#7C3AED', category: 'branding' }
    ];

    for (const setting of systemSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          updatedBy: 'system'
        }
      });
    }
    console.log(`✅ Created ${systemSettings.length} system settings`);

    // Step 7: Final verification
    console.log('\n🧪 Step 7: Final verification...');
    const verifyUser = await prisma.user.findUnique({
      where: { id: adminUser.id },
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
      const userAbilities = verifyUser.userRoles
        .flatMap(ur => ur.role.roleAbilities)
        .map(ra => ra.ability.name);
      
      console.log('✅ VERIFICATION SUCCESSFUL:');
      console.log(`   Admin User: ${verifyUser.email}`);
      console.log(`   User ID: ${verifyUser.id}`);
      console.log(`   Role: ${verifyUser.role}`);
      console.log(`   Total Abilities: ${userAbilities.length}`);
      console.log(`   Has CRM Access: ${userAbilities.includes('crm.view')}`);
      console.log(`   Has DRM Access: ${userAbilities.includes('drm.view')}`);
      console.log(`   Can Create Leads: ${userAbilities.includes('leads.create')}`);
      console.log(`   Can Manage Users: ${userAbilities.includes('users.manage')}`);
      console.log(`   Can Access Settings: ${userAbilities.includes('settings.manage')}`);
    }

    // Step 8: Summary
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`   ✅ Abilities Created: ${ALL_ABILITIES.length}`);
    console.log(`   ✅ Roles Created: ${Object.keys(ROLE_DEFINITIONS).length}`);
    console.log(`   ✅ Role-Ability Assignments: ${totalAssignments}`);
    console.log(`   ✅ Admin User: ${adminEmail}`);
    console.log(`   ✅ System Settings: ${systemSettings.length}`);

    console.log('\n🎉 PERMISSIONS SYSTEM MIGRATION COMPLETE!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🚀 The system is now ready with full permissions!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
