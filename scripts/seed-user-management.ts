import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUserManagement() {
  console.log('👥 Seeding user management system...');

  try {
    // Create default abilities
    console.log('🔐 Creating default abilities...');
    
    const abilities = [
      // User Management
      { name: 'users.create', resource: 'users', action: 'create', description: 'Create new users' },
      { name: 'users.read', resource: 'users', action: 'read', description: 'View user information' },
      { name: 'users.update', resource: 'users', action: 'update', description: 'Update user information' },
      { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
      { name: 'users.manage', resource: 'users', action: 'manage', description: 'Full user management' },

      // Role Management
      { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create new roles' },
      { name: 'roles.read', resource: 'roles', action: 'read', description: 'View role information' },
      { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update roles' },
      { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles' },

      // Product Management
      { name: 'products.create', resource: 'products', action: 'create', description: 'Create new products' },
      { name: 'products.read', resource: 'products', action: 'read', description: 'View product information' },
      { name: 'products.update', resource: 'products', action: 'update', description: 'Update product information' },
      { name: 'products.delete', resource: 'products', action: 'delete', description: 'Delete products' },
      { name: 'products.manage', resource: 'products', action: 'manage', description: 'Full product management' },

      // Inventory Management
      { name: 'inventory.read', resource: 'inventory', action: 'read', description: 'View inventory levels' },
      { name: 'inventory.update', resource: 'inventory', action: 'update', description: 'Update inventory' },
      { name: 'inventory.manage', resource: 'inventory', action: 'manage', description: 'Full inventory management' },
      { name: 'stock-movements.create', resource: 'stock-movements', action: 'create', description: 'Create stock movements' },
      { name: 'stock-movements.read', resource: 'stock-movements', action: 'read', description: 'View stock movements' },

      // Sales Management
      { name: 'orders.create', resource: 'orders', action: 'create', description: 'Create new orders' },
      { name: 'orders.read', resource: 'orders', action: 'read', description: 'View order information' },
      { name: 'orders.update', resource: 'orders', action: 'update', description: 'Update orders' },
      { name: 'orders.delete', resource: 'orders', action: 'delete', description: 'Delete orders' },
      { name: 'orders.manage', resource: 'orders', action: 'manage', description: 'Full order management' },

      // CRM Management
      { name: 'leads.create', resource: 'leads', action: 'create', description: 'Create new leads' },
      { name: 'leads.read', resource: 'leads', action: 'read', description: 'View lead information' },
      { name: 'leads.update', resource: 'leads', action: 'update', description: 'Update leads' },
      { name: 'leads.delete', resource: 'leads', action: 'delete', description: 'Delete leads' },
      { name: 'leads.manage', resource: 'leads', action: 'manage', description: 'Full lead management' },

      // Financial Management
      { name: 'payments.read', resource: 'payments', action: 'read', description: 'View payment information' },
      { name: 'payments.update', resource: 'payments', action: 'update', description: 'Update payments' },
      { name: 'reports.financial', resource: 'reports', action: 'financial', description: 'Access financial reports' },

      // System Management
      { name: 'settings.read', resource: 'settings', action: 'read', description: 'View system settings' },
      { name: 'settings.update', resource: 'settings', action: 'update', description: 'Update system settings' },
      { name: 'audit.read', resource: 'audit', action: 'read', description: 'View audit logs' },
    ];

    for (const ability of abilities) {
      await prisma.ability.upsert({
        where: { name: ability.name },
        update: ability,
        create: ability,
      });
    }

    console.log('✅ Default abilities created');

    // Create default roles
    console.log('👔 Creating default roles...');

    // Get ability IDs
    const allAbilities = await prisma.ability.findMany();

    // Admin Role - All permissions
    const adminRole = await prisma.role.upsert({
      where: { name: 'Administrator' },
      update: {},
      create: {
        name: 'Administrator',
        description: 'Full system access with all permissions',
        isSystem: true,
        isActive: true,
        roleAbilities: {
          create: allAbilities.map(ability => ({
            abilityId: ability.id
          }))
        }
      }
    });

    // Sales Manager Role
    const salesManagerAbilities = allAbilities.filter(ability => 
      ability.resource === 'leads' || 
      ability.resource === 'orders' || 
      ability.resource === 'products' && ability.action === 'read' ||
      ability.resource === 'inventory' && ability.action === 'read' ||
      ability.resource === 'reports' ||
      ability.name === 'users.read'
    );

    const salesManagerRole = await prisma.role.upsert({
      where: { name: 'Sales Manager' },
      update: {},
      create: {
        name: 'Sales Manager',
        description: 'Manages sales team and processes',
        isSystem: true,
        isActive: true,
        roleAbilities: {
          create: salesManagerAbilities.map(ability => ({
            abilityId: ability.id
          }))
        }
      }
    });

    // Sales Representative Role
    const salesRepAbilities = allAbilities.filter(ability => 
      (ability.resource === 'leads' && ['create', 'read', 'update'].includes(ability.action)) ||
      (ability.resource === 'orders' && ['create', 'read', 'update'].includes(ability.action)) ||
      (ability.resource === 'products' && ability.action === 'read') ||
      (ability.resource === 'inventory' && ability.action === 'read')
    );

    const salesRepRole = await prisma.role.upsert({
      where: { name: 'Sales Representative' },
      update: {},
      create: {
        name: 'Sales Representative',
        description: 'Handles customer interactions and sales',
        isSystem: true,
        isActive: true,
        roleAbilities: {
          create: salesRepAbilities.map(ability => ({
            abilityId: ability.id
          }))
        }
      }
    });

    // Inventory Manager Role
    const inventoryManagerAbilities = allAbilities.filter(ability => 
      ability.resource === 'products' ||
      ability.resource === 'inventory' ||
      ability.resource === 'stock-movements' ||
      (ability.resource === 'orders' && ability.action === 'read')
    );

    const inventoryManagerRole = await prisma.role.upsert({
      where: { name: 'Inventory Manager' },
      update: {},
      create: {
        name: 'Inventory Manager',
        description: 'Manages inventory and stock movements',
        isSystem: true,
        isActive: true,
        roleAbilities: {
          create: inventoryManagerAbilities.map(ability => ({
            abilityId: ability.id
          }))
        }
      }
    });

    // Finance Officer Role
    const financeOfficerAbilities = allAbilities.filter(ability => 
      ability.resource === 'payments' ||
      ability.resource === 'reports' ||
      (ability.resource === 'orders' && ['read', 'update'].includes(ability.action)) ||
      (ability.resource === 'products' && ability.action === 'read')
    );

    const financeOfficerRole = await prisma.role.upsert({
      where: { name: 'Finance Officer' },
      update: {},
      create: {
        name: 'Finance Officer',
        description: 'Handles financial operations and reporting',
        isSystem: true,
        isActive: true,
        roleAbilities: {
          create: financeOfficerAbilities.map(ability => ({
            abilityId: ability.id
          }))
        }
      }
    });

    // Executive Viewer Role
    const executiveViewerAbilities = allAbilities.filter(ability => 
      ability.action === 'read' && 
      ['leads', 'orders', 'products', 'inventory', 'reports', 'payments'].includes(ability.resource)
    );

    const executiveViewerRole = await prisma.role.upsert({
      where: { name: 'Executive Viewer' },
      update: {},
      create: {
        name: 'Executive Viewer',
        description: 'Read-only access to business data and reports',
        isSystem: true,
        isActive: true,
        roleAbilities: {
          create: executiveViewerAbilities.map(ability => ({
            abilityId: ability.id
          }))
        }
      }
    });

    console.log('✅ Default roles created');

    // Create default notification templates
    console.log('📧 Creating notification templates...');

    const templates = [
      {
        name: 'User Invitation',
        type: 'USER_INVITED',
        channels: ['EMAIL'],
        subject: 'Welcome to AD Pools SM',
        body: 'You have been invited to join AD Pools Sales Management System. Please click the link below to set up your account.',
        variables: ['userName', 'inviteLink', 'companyName']
      },
      {
        name: 'Password Reset',
        type: 'PASSWORD_RESET',
        channels: ['EMAIL'],
        subject: 'Password Reset Request',
        body: 'You requested a password reset. Click the link below to reset your password.',
        variables: ['userName', 'resetLink']
      },
      {
        name: 'Low Stock Alert',
        type: 'STOCK_LOW',
        channels: ['EMAIL', 'SMS', 'WHATSAPP'],
        subject: 'Low Stock Alert',
        body: 'Product {{productName}} is running low. Current stock: {{currentStock}}, Reorder point: {{reorderPoint}}',
        variables: ['productName', 'currentStock', 'reorderPoint', 'warehouseName']
      },
      {
        name: 'Order Status Update',
        type: 'ORDER_STATUS',
        channels: ['EMAIL', 'SMS'],
        subject: 'Order Status Update',
        body: 'Your order #{{orderNumber}} status has been updated to {{status}}.',
        variables: ['orderNumber', 'status', 'customerName']
      },
      {
        name: 'Payment Received',
        type: 'PAYMENT_RECEIVED',
        channels: ['EMAIL', 'SMS'],
        subject: 'Payment Received',
        body: 'Payment of {{amount}} has been received for order #{{orderNumber}}.',
        variables: ['amount', 'orderNumber', 'paymentMethod']
      }
    ];

    for (const template of templates) {
      await prisma.notificationTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template,
      });
    }

    console.log('✅ Notification templates created');

    // Update existing users to have proper roles
    console.log('👤 Updating existing users...');
    
    const existingUsers = await prisma.user.findMany();
    
    for (const user of existingUsers) {
      // Find the corresponding role
      let roleName = 'Sales Representative'; // default
      
      switch (user.role) {
        case 'ADMIN':
          roleName = 'Administrator';
          break;
        case 'SALES_MANAGER':
          roleName = 'Sales Manager';
          break;
        case 'SALES_REP':
          roleName = 'Sales Representative';
          break;
        case 'INVENTORY_MANAGER':
          roleName = 'Inventory Manager';
          break;
        case 'FINANCE_OFFICER':
          roleName = 'Finance Officer';
          break;
        case 'EXECUTIVE_VIEWER':
          roleName = 'Executive Viewer';
          break;
      }

      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (role) {
        // Assign role to user
        await prisma.userRoleAssignment.upsert({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: role.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            roleId: role.id,
            isActive: true
          }
        });
      }
    }

    console.log('✅ Existing users updated with roles');

    console.log('🎉 User management system seeded successfully!');
    console.log(`📊 Created ${abilities.length} abilities`);
    console.log(`👔 Created 6 default roles`);
    console.log(`📧 Created ${templates.length} notification templates`);

  } catch (error) {
    console.error('❌ Error seeding user management:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedUserManagement()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
