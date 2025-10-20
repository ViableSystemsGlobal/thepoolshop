import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Setting up roles and permissions...');

  try {
    // Create default roles
    const roles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Full system access with all permissions',
        isSystem: true,
        isActive: true,
        abilities: [
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
        ]
      },
      {
        name: 'ADMIN',
        description: 'Administrative access with most permissions',
        isSystem: true,
        isActive: true,
        abilities: [
          'dashboard.view',
          'products.view', 'products.create', 'products.edit', 'products.delete',
          'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
          'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
          'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
          'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
          'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
          'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
          'users.view', 'users.create', 'users.edit',
          'settings.view', 'settings.edit',
          'reports.view', 'reports.create', 'reports.edit',
          'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
          'communications.view', 'communications.create', 'communications.edit',
          'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
          'drm.view', 'drm.create', 'drm.edit', 'drm.delete',
          'payments.view', 'payments.create', 'payments.edit',
          'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
          'returns.view', 'returns.create', 'returns.edit',
          'commissions.view', 'commissions.create', 'commissions.edit',
          'backorders.view', 'backorders.create', 'backorders.edit',
          'price-lists.view', 'price-lists.create', 'price-lists.edit',
          'categories.view', 'categories.create', 'categories.edit',
          'agents.view', 'agents.create', 'agents.edit',
          'ai-analyst.view', 'ai-analyst.create', 'ai-analyst.edit'
        ]
      },
      {
        name: 'SALES_MANAGER',
        description: 'Sales management with customer and order permissions',
        isSystem: true,
        isActive: true,
        abilities: [
          'dashboard.view',
          'products.view',
          'orders.view', 'orders.create', 'orders.edit',
          'invoices.view', 'invoices.create', 'invoices.edit',
          'customers.view', 'customers.create', 'customers.edit',
          'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
          'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
          'payments.view', 'payments.create', 'payments.edit',
          'reports.view',
          'tasks.view', 'tasks.create', 'tasks.edit',
          'communications.view', 'communications.create', 'communications.edit',
          'crm.view', 'crm.create', 'crm.edit',
          'commissions.view', 'commissions.create', 'commissions.edit',
          'categories.view'
        ]
      },
      {
        name: 'SALES_REP',
        description: 'Sales representative with limited permissions',
        isSystem: true,
        isActive: true,
        abilities: [
          'dashboard.view',
          'products.view',
          'orders.view', 'orders.create', 'orders.edit',
          'invoices.view', 'invoices.create',
          'customers.view', 'customers.create', 'customers.edit',
          'leads.view', 'leads.create', 'leads.edit',
          'quotations.view', 'quotations.create', 'quotations.edit',
          'payments.view', 'payments.create',
          'tasks.view', 'tasks.create', 'tasks.edit',
          'communications.view', 'communications.create',
          'crm.view', 'crm.create', 'crm.edit',
          'categories.view'
        ]
      },
      {
        name: 'WAREHOUSE_MANAGER',
        description: 'Warehouse and inventory management',
        isSystem: true,
        isActive: true,
        abilities: [
          'dashboard.view',
          'products.view', 'products.create', 'products.edit',
          'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
          'warehouses.view', 'warehouses.create', 'warehouses.edit',
          'orders.view', 'orders.edit',
          'invoices.view',
          'reports.view',
          'tasks.view', 'tasks.create', 'tasks.edit',
          'backorders.view', 'backorders.create', 'backorders.edit',
          'categories.view', 'categories.create', 'categories.edit'
        ]
      },
      {
        name: 'ACCOUNTANT',
        description: 'Financial and accounting access',
        isSystem: true,
        isActive: true,
        abilities: [
          'dashboard.view',
          'products.view',
          'orders.view',
          'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
          'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
          'quotations.view',
          'returns.view', 'returns.create', 'returns.edit',
          'commissions.view', 'commissions.create', 'commissions.edit',
          'reports.view', 'reports.create', 'reports.edit',
          'tasks.view', 'tasks.create', 'tasks.edit',
          'categories.view'
        ]
      }
    ];

    // Create roles
    for (const roleData of roles) {
      const { abilities, ...roleInfo } = roleData;
      
      const role = await prisma.role.upsert({
        where: { name: roleInfo.name },
        update: { ...roleInfo },
        create: { ...roleInfo }
      });

      // Create abilities for this role
      for (const ability of abilities) {
        await prisma.ability.upsert({
          where: { 
            roleId_ability: {
              roleId: role.id,
              ability: ability
            }
          },
          update: {},
          create: {
            roleId: role.id,
            ability: ability
          }
        });
      }

      console.log(`✅ Created role: ${roleInfo.name} with ${abilities.length} abilities`);
    }

    // Update admin user to have SUPER_ADMIN role
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (superAdminRole) {
      await prisma.user.update({
        where: { email: 'admin@adpools.com' },
        data: { 
          role: 'SUPER_ADMIN',
          roleId: superAdminRole.id
        }
      });
      console.log('✅ Updated admin user with SUPER_ADMIN role');
    }

    console.log('🎉 Permissions setup completed successfully!');
    console.log('');
    console.log('📋 Created roles:');
    roles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });

  } catch (error) {
    console.error('❌ Permissions setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
