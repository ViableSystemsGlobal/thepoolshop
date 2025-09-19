import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuperAdminRole() {
  try {
    console.log('Creating Super Admin role and abilities...');

    // First, create all the abilities
    const abilities = [
      // General abilities
      { name: "users.manage", resource: "users", action: "manage", description: "Full user management" },
      { name: "users.create", resource: "users", action: "create", description: "Create new users" },
      { name: "users.edit", resource: "users", action: "edit", description: "Edit user information" },
      { name: "users.delete", resource: "users", action: "delete", description: "Delete users" },
      { name: "users.view", resource: "users", action: "view", description: "View user information" },
      { name: "users.profile.manage", resource: "users", action: "profile-manage", description: "Profile management" },
      { name: "users.reset.password", resource: "users", action: "reset-password", description: "Reset user passwords" },
      { name: "users.login.manage", resource: "users", action: "login-manage", description: "Login management" },
      { name: "users.import", resource: "users", action: "import", description: "Import users" },
      { name: "users.logs.history", resource: "users", action: "logs-history", description: "View user logs" },
      { name: "users.chat.manage", resource: "users", action: "chat-manage", description: "Chat management" },
      { name: "settings.manage", resource: "settings", action: "manage", description: "System settings" },
      { name: "roles.manage", resource: "roles", action: "manage", description: "Role management" },
      { name: "roles.create", resource: "roles", action: "create", description: "Create roles" },
      { name: "roles.edit", resource: "roles", action: "edit", description: "Edit roles" },
      { name: "roles.delete", resource: "roles", action: "delete", description: "Delete roles" },

      // Sales & CRM abilities
      { name: "leads.manage", resource: "leads", action: "manage", description: "Lead management" },
      { name: "leads.create", resource: "leads", action: "create", description: "Create leads" },
      { name: "leads.edit", resource: "leads", action: "edit", description: "Edit leads" },
      { name: "leads.delete", resource: "leads", action: "delete", description: "Delete leads" },
      { name: "leads.view", resource: "leads", action: "view", description: "View leads" },
      { name: "opportunities.manage", resource: "opportunities", action: "manage", description: "Opportunity management" },
      { name: "opportunities.create", resource: "opportunities", action: "create", description: "Create opportunities" },
      { name: "opportunities.edit", resource: "opportunities", action: "edit", description: "Edit opportunities" },
      { name: "opportunities.delete", resource: "opportunities", action: "delete", description: "Delete opportunities" },
      { name: "opportunities.view", resource: "opportunities", action: "view", description: "View opportunities" },
      { name: "quotations.manage", resource: "quotations", action: "manage", description: "Quotation management" },
      { name: "quotations.create", resource: "quotations", action: "create", description: "Create quotations" },
      { name: "quotations.edit", resource: "quotations", action: "edit", description: "Edit quotations" },
      { name: "quotations.delete", resource: "quotations", action: "delete", description: "Delete quotations" },
      { name: "quotations.view", resource: "quotations", action: "view", description: "View quotations" },
      { name: "accounts.manage", resource: "accounts", action: "manage", description: "Account management" },
      { name: "accounts.create", resource: "accounts", action: "create", description: "Create accounts" },
      { name: "accounts.edit", resource: "accounts", action: "edit", description: "Edit accounts" },
      { name: "accounts.delete", resource: "accounts", action: "delete", description: "Delete accounts" },
      { name: "accounts.view", resource: "accounts", action: "view", description: "View accounts" },

      // Inventory abilities
      { name: "products.manage", resource: "products", action: "manage", description: "Product management" },
      { name: "products.create", resource: "products", action: "create", description: "Create products" },
      { name: "products.edit", resource: "products", action: "edit", description: "Edit products" },
      { name: "products.delete", resource: "products", action: "delete", description: "Delete products" },
      { name: "products.view", resource: "products", action: "view", description: "View products" },
      { name: "products.import", resource: "products", action: "import", description: "Import products" },
      { name: "products.export", resource: "products", action: "export", description: "Export products" },
      { name: "inventory.manage", resource: "inventory", action: "manage", description: "Inventory management" },
      { name: "inventory.view", resource: "inventory", action: "view", description: "View inventory" },
      { name: "inventory.adjust", resource: "inventory", action: "adjust", description: "Adjust inventory" },
      { name: "warehouses.manage", resource: "warehouses", action: "manage", description: "Warehouse management" },
      { name: "warehouses.create", resource: "warehouses", action: "create", description: "Create warehouses" },
      { name: "warehouses.edit", resource: "warehouses", action: "edit", description: "Edit warehouses" },
      { name: "warehouses.delete", resource: "warehouses", action: "delete", description: "Delete warehouses" },
      { name: "warehouses.view", resource: "warehouses", action: "view", description: "View warehouses" },
      { name: "stock-movements.manage", resource: "stock-movements", action: "manage", description: "Stock movement management" },
      { name: "stock-movements.create", resource: "stock-movements", action: "create", description: "Create stock movements" },
      { name: "stock-movements.edit", resource: "stock-movements", action: "edit", description: "Edit stock movements" },
      { name: "stock-movements.delete", resource: "stock-movements", action: "delete", description: "Delete stock movements" },
      { name: "stock-movements.view", resource: "stock-movements", action: "view", description: "View stock movements" },

      // Finance abilities
      { name: "invoices.manage", resource: "invoices", action: "manage", description: "Invoice management" },
      { name: "invoices.create", resource: "invoices", action: "create", description: "Create invoices" },
      { name: "invoices.edit", resource: "invoices", action: "edit", description: "Edit invoices" },
      { name: "invoices.delete", resource: "invoices", action: "delete", description: "Delete invoices" },
      { name: "invoices.view", resource: "invoices", action: "view", description: "View invoices" },
      { name: "payments.manage", resource: "payments", action: "manage", description: "Payment management" },
      { name: "payments.create", resource: "payments", action: "create", description: "Create payments" },
      { name: "payments.edit", resource: "payments", action: "edit", description: "Edit payments" },
      { name: "payments.delete", resource: "payments", action: "delete", description: "Delete payments" },
      { name: "payments.view", resource: "payments", action: "view", description: "View payments" },
      { name: "currency.manage", resource: "currency", action: "manage", description: "Currency management" },
      { name: "currency.settings", resource: "currency", action: "settings", description: "Currency settings" },

      // Reports abilities
      { name: "reports.view", resource: "reports", action: "view", description: "View reports" },
      { name: "reports.sales", resource: "reports", action: "sales", description: "Sales reports" },
      { name: "reports.inventory", resource: "reports", action: "inventory", description: "Inventory reports" },
      { name: "reports.financial", resource: "reports", action: "financial", description: "Financial reports" },
      { name: "reports.users", resource: "reports", action: "users", description: "User reports" },
      { name: "reports.export", resource: "reports", action: "export", description: "Export reports" },
      { name: "dashboard.view", resource: "dashboard", action: "view", description: "Dashboard access" },
    ];

    // Create abilities if they don't exist
    console.log('Creating abilities...');
    for (const ability of abilities) {
      await prisma.ability.upsert({
        where: { name: ability.name },
        update: ability,
        create: ability,
      });
    }

    // Create Super Admin role
    console.log('Creating Super Admin role...');
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super Admin' },
      update: {
        description: 'Full system access with all permissions',
        isSystem: true,
        isActive: true,
      },
      create: {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
        isActive: true,
      },
    });

    // Get all abilities
    const allAbilities = await prisma.ability.findMany();

    // Assign all abilities to Super Admin role
    console.log('Assigning all abilities to Super Admin role...');
    for (const ability of allAbilities) {
      await prisma.roleAbility.upsert({
        where: {
          roleId_abilityId: {
            roleId: superAdminRole.id,
            abilityId: ability.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          abilityId: ability.id,
        },
      });
    }

    // Create other basic roles
    console.log('Creating basic roles...');
    
    // Admin role (most permissions except some super admin functions)
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {
        description: 'Administrative access with most system permissions',
        isSystem: true,
        isActive: true,
      },
      create: {
        name: 'Admin',
        description: 'Administrative access with most system permissions',
        isSystem: true,
        isActive: true,
      },
    });

    // Staff role (limited permissions)
    const staffRole = await prisma.role.upsert({
      where: { name: 'Staff' },
      update: {
        description: 'Staff member with limited system access',
        isSystem: true,
        isActive: true,
      },
      create: {
        name: 'Staff',
        description: 'Staff member with limited system access',
        isSystem: true,
        isActive: true,
      },
    });

    // Client role (minimal permissions)
    const clientRole = await prisma.role.upsert({
      where: { name: 'Client' },
      update: {
        description: 'Client with minimal system access',
        isSystem: true,
        isActive: true,
      },
      create: {
        name: 'Client',
        description: 'Client with minimal system access',
        isSystem: true,
        isActive: true,
      },
    });

    // Assign abilities to other roles
    console.log('Assigning abilities to other roles...');
    
    // Admin gets most abilities (exclude some super admin functions)
    const adminAbilities = allAbilities.filter(ability => 
      !ability.name.includes('roles.manage') && 
      !ability.name.includes('settings.manage') &&
      !ability.name.includes('users.import')
    );
    
    for (const ability of adminAbilities) {
      await prisma.roleAbility.upsert({
        where: {
          roleId_abilityId: {
            roleId: adminRole.id,
            abilityId: ability.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          abilityId: ability.id,
        },
      });
    }

    // Staff gets limited abilities
    const staffAbilities = allAbilities.filter(ability => 
      ability.resource === 'products' || 
      ability.resource === 'inventory' ||
      ability.resource === 'leads' ||
      ability.resource === 'quotations' ||
      (ability.resource === 'users' && ability.action === 'view')
    );
    
    for (const ability of staffAbilities) {
      await prisma.roleAbility.upsert({
        where: {
          roleId_abilityId: {
            roleId: staffRole.id,
            abilityId: ability.id,
          },
        },
        update: {},
        create: {
          roleId: staffRole.id,
          abilityId: ability.id,
        },
      });
    }

    // Client gets minimal abilities
    const clientAbilities = allAbilities.filter(ability => 
      ability.resource === 'products' && ability.action === 'view' ||
      ability.resource === 'quotations' && (ability.action === 'view' || ability.action === 'create')
    );
    
    for (const ability of clientAbilities) {
      await prisma.roleAbility.upsert({
        where: {
          roleId_abilityId: {
            roleId: clientRole.id,
            abilityId: ability.id,
          },
        },
        update: {},
        create: {
          roleId: clientRole.id,
          abilityId: ability.id,
        },
      });
    }

    console.log('✅ Super Admin role and abilities created successfully!');
    console.log(`📊 Created ${allAbilities.length} abilities`);
    console.log(`👑 Super Admin role: ${superAdminRole.name} (${allAbilities.length} abilities)`);
    console.log(`👨‍💼 Admin role: ${adminRole.name} (${adminAbilities.length} abilities)`);
    console.log(`👷 Staff role: ${staffRole.name} (${staffAbilities.length} abilities)`);
    console.log(`👤 Client role: ${clientRole.name} (${clientAbilities.length} abilities)`);

  } catch (error) {
    console.error('❌ Error creating Super Admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdminRole();
