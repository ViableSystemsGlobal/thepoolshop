import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running complete database setup...');

  try {
    // Step 1: Create currencies
    console.log('📊 Creating currencies...');
    const usd = await prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isActive: true,
      },
    });

    const ghs = await prisma.currency.upsert({
      where: { code: 'GHS' },
      update: {},
      create: {
        code: 'GHS',
        name: 'Ghana Cedi',
        symbol: '₵',
        isActive: true,
      },
    });
    console.log('✅ Currencies created');

    // Step 2: Create categories
    console.log('📁 Creating categories...');
    const electronics = await prisma.category.upsert({
      where: { id: 'electronics' },
      update: {},
      create: {
        id: 'electronics',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
      },
    });

    const office = await prisma.category.upsert({
      where: { id: 'office' },
      update: {},
      create: {
        id: 'office',
        name: 'Office Supplies',
        description: 'Office equipment and supplies',
      },
    });
    console.log('✅ Categories created');

    // Step 3: Create warehouse
    console.log('🏪 Creating warehouse...');
    const warehouse = await prisma.warehouse.upsert({
      where: { code: 'MAIN' },
      update: {},
      create: {
        name: 'Main Warehouse',
        code: 'MAIN',
        address: 'Accra, Ghana',
        city: 'Accra',
        country: 'Ghana',
        isActive: true,
      },
    });
    console.log('✅ Warehouse created');

    // Step 4: Create roles with abilities
    console.log('🔐 Creating roles and permissions...');
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

    // Create roles and abilities
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

    // Step 5: Create admin user with proper role
    console.log('👤 Creating admin user...');
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found');
    }

    const hashedPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@adpools.com' },
      update: { 
        role: 'SUPER_ADMIN',
        roleId: superAdminRole.id,
        password: hashedPassword
      },
      create: {
        email: 'admin@adpools.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
    console.log('✅ Admin user created/updated');

    // Step 6: Create system settings
    console.log('⚙️ Creating system settings...');
    const settings = [
      { key: 'company_name', value: 'The PoolShop' },
      { key: 'company_logo', value: '/uploads/branding/favicon_1760896671527.jpg' },
      { key: 'primary_color', value: '#ea580c' },
      { key: 'secondary_color', value: '#c2410c' },
      { key: 'company_description', value: 'A practical, single-tenant system for sales and distribution management' },
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: 'branding',
          type: 'string',
        },
      });
    }
    console.log('✅ System settings created');

    console.log('🎉 Complete database setup finished successfully!');
    console.log('');
    console.log('📋 What was created:');
    console.log('- 2 currencies (USD, GHS)');
    console.log('- 2 categories (Electronics, Office)');
    console.log('- 1 warehouse (Main Warehouse)');
    console.log('- 6 roles with full permissions');
    console.log('- 1 admin user (admin@adpools.com)');
    console.log('- 5 system settings');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('Email: admin@adpools.com');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  Remember to change the admin password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
