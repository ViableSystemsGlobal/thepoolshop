import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive abilities based on actual system functionality
const SYSTEM_ABILITIES = [
  // === USER MANAGEMENT ===
  { name: 'users.create', resource: 'users', action: 'create', description: 'Create new users and send invitations' },
  { name: 'users.read', resource: 'users', action: 'read', description: 'View user information and profiles' },
  { name: 'users.update', resource: 'users', action: 'update', description: 'Update user information and status' },
  { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users from the system' },
  { name: 'users.bulk-activate', resource: 'users', action: 'bulk-activate', description: 'Activate multiple users at once' },
  { name: 'users.bulk-deactivate', resource: 'users', action: 'bulk-deactivate', description: 'Deactivate multiple users at once' },

  // === ROLE MANAGEMENT ===
  { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create new custom roles' },
  { name: 'roles.read', resource: 'roles', action: 'read', description: 'View role information and abilities' },
  { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update role permissions and descriptions' },
  { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete custom roles' },

  // === PRODUCT MANAGEMENT ===
  { name: 'products.create', resource: 'products', action: 'create', description: 'Create new products' },
  { name: 'products.read', resource: 'products', action: 'read', description: 'View product information and details' },
  { name: 'products.update', resource: 'products', action: 'update', description: 'Update product information' },
  { name: 'products.delete', resource: 'products', action: 'delete', description: 'Delete products' },
  { name: 'products.bulk-import', resource: 'products', action: 'bulk-import', description: 'Import products from CSV files' },
  { name: 'products.bulk-export', resource: 'products', action: 'bulk-export', description: 'Export products to CSV files' },
  { name: 'products.bulk-activate', resource: 'products', action: 'bulk-activate', description: 'Activate multiple products' },
  { name: 'products.bulk-deactivate', resource: 'products', action: 'bulk-deactivate', description: 'Deactivate multiple products' },
  { name: 'products.bulk-delete', resource: 'products', action: 'bulk-delete', description: 'Delete multiple products' },
  { name: 'products.archive', resource: 'products', action: 'archive', description: 'Archive products' },
  { name: 'products.duplicate', resource: 'products', action: 'duplicate', description: 'Duplicate existing products' },
  { name: 'products.documents.upload', resource: 'products', action: 'documents-upload', description: 'Upload product documents' },
  { name: 'products.documents.download', resource: 'products', action: 'documents-download', description: 'Download product documents' },

  // === INVENTORY MANAGEMENT ===
  { name: 'inventory.read', resource: 'inventory', action: 'read', description: 'View inventory levels and stock overview' },
  { name: 'inventory.update', resource: 'inventory', action: 'update', description: 'Update inventory levels' },
  { name: 'inventory.manage', resource: 'inventory', action: 'manage', description: 'Full inventory management' },

  // === STOCK MOVEMENTS ===
  { name: 'stock-movements.create', resource: 'stock-movements', action: 'create', description: 'Create individual stock movements' },
  { name: 'stock-movements.read', resource: 'stock-movements', action: 'read', description: 'View stock movement history' },
  { name: 'stock-movements.update', resource: 'stock-movements', action: 'update', description: 'Update stock movements' },
  { name: 'stock-movements.delete', resource: 'stock-movements', action: 'delete', description: 'Delete stock movements' },
  { name: 'stock-movements.bulk-create', resource: 'stock-movements', action: 'bulk-create', description: 'Create bulk stock movements from CSV' },
  { name: 'stock-movements.generate-grn', resource: 'stock-movements', action: 'generate-grn', description: 'Generate GRN documents' },
  { name: 'stock-movements.reverse', resource: 'stock-movements', action: 'reverse', description: 'Reverse stock movements' },

  // === WAREHOUSE MANAGEMENT ===
  { name: 'warehouses.create', resource: 'warehouses', action: 'create', description: 'Create new warehouses' },
  { name: 'warehouses.read', resource: 'warehouses', action: 'read', description: 'View warehouse information' },
  { name: 'warehouses.update', resource: 'warehouses', action: 'update', description: 'Update warehouse details' },
  { name: 'warehouses.delete', resource: 'warehouses', action: 'delete', description: 'Delete warehouses' },
  { name: 'warehouses.products.read', resource: 'warehouses', action: 'products-read', description: 'View products in warehouses' },

  // === CATEGORY MANAGEMENT ===
  { name: 'categories.create', resource: 'categories', action: 'create', description: 'Create new product categories' },
  { name: 'categories.read', resource: 'categories', action: 'read', description: 'View product categories' },
  { name: 'categories.update', resource: 'categories', action: 'update', description: 'Update category information' },
  { name: 'categories.delete', resource: 'categories', action: 'delete', description: 'Delete categories' },

  // === UNIT MANAGEMENT ===
  { name: 'units.create', resource: 'units', action: 'create', description: 'Create new measurement units' },
  { name: 'units.read', resource: 'units', action: 'read', description: 'View measurement units' },
  { name: 'units.update', resource: 'units', action: 'update', description: 'Update unit information' },
  { name: 'units.delete', resource: 'units', action: 'delete', description: 'Delete units' },

  // === PRICE LIST MANAGEMENT ===
  { name: 'price-lists.create', resource: 'price-lists', action: 'create', description: 'Create new price lists' },
  { name: 'price-lists.read', resource: 'price-lists', action: 'read', description: 'View price lists' },
  { name: 'price-lists.update', resource: 'price-lists', action: 'update', description: 'Update price lists' },
  { name: 'price-lists.delete', resource: 'price-lists', action: 'delete', description: 'Delete price lists' },
  { name: 'price-lists.items.add', resource: 'price-lists', action: 'items-add', description: 'Add products to price lists' },
  { name: 'price-lists.items.remove', resource: 'price-lists', action: 'items-remove', description: 'Remove products from price lists' },

  // === LEAD MANAGEMENT ===
  { name: 'leads.create', resource: 'leads', action: 'create', description: 'Create new leads' },
  { name: 'leads.read', resource: 'leads', action: 'read', description: 'View lead information' },
  { name: 'leads.update', resource: 'leads', action: 'update', description: 'Update lead information' },
  { name: 'leads.delete', resource: 'leads', action: 'delete', description: 'Delete leads' },
  { name: 'leads.bulk-delete', resource: 'leads', action: 'bulk-delete', description: 'Delete multiple leads' },
  { name: 'leads.bulk-export', resource: 'leads', action: 'bulk-export', description: 'Export leads to CSV' },
  { name: 'leads.bulk-update', resource: 'leads', action: 'bulk-update', description: 'Update multiple leads' },

  // === ACCOUNT MANAGEMENT ===
  { name: 'accounts.create', resource: 'accounts', action: 'create', description: 'Create new customer accounts' },
  { name: 'accounts.read', resource: 'accounts', action: 'read', description: 'View account information' },
  { name: 'accounts.update', resource: 'accounts', action: 'update', description: 'Update account details' },
  { name: 'accounts.delete', resource: 'accounts', action: 'delete', description: 'Delete accounts' },
  { name: 'accounts.bulk-delete', resource: 'accounts', action: 'bulk-delete', description: 'Delete multiple accounts' },
  { name: 'accounts.bulk-export', resource: 'accounts', action: 'bulk-export', description: 'Export accounts to CSV' },

  // === OPPORTUNITY MANAGEMENT ===
  { name: 'opportunities.create', resource: 'opportunities', action: 'create', description: 'Create new opportunities' },
  { name: 'opportunities.read', resource: 'opportunities', action: 'read', description: 'View opportunity information' },
  { name: 'opportunities.update', resource: 'opportunities', action: 'update', description: 'Update opportunities' },
  { name: 'opportunities.delete', resource: 'opportunities', action: 'delete', description: 'Delete opportunities' },

  // === QUOTATION MANAGEMENT ===
  { name: 'quotations.create', resource: 'quotations', action: 'create', description: 'Create new quotations' },
  { name: 'quotations.read', resource: 'quotations', action: 'read', description: 'View quotation information' },
  { name: 'quotations.update', resource: 'quotations', action: 'update', description: 'Update quotations' },
  { name: 'quotations.delete', resource: 'quotations', action: 'delete', description: 'Delete quotations' },

  // === BACKORDER MANAGEMENT ===
  { name: 'backorders.create', resource: 'backorders', action: 'create', description: 'Create new backorders' },
  { name: 'backorders.read', resource: 'backorders', action: 'read', description: 'View backorder information' },
  { name: 'backorders.update', resource: 'backorders', action: 'update', description: 'Update backorders' },
  { name: 'backorders.delete', resource: 'backorders', action: 'delete', description: 'Delete backorders' },

  // === CURRENCY MANAGEMENT ===
  { name: 'currencies.read', resource: 'currencies', action: 'read', description: 'View currency information' },
  { name: 'currencies.convert', resource: 'currencies', action: 'convert', description: 'Convert between currencies' },

  // === FILE MANAGEMENT ===
  { name: 'files.upload', resource: 'files', action: 'upload', description: 'Upload files and documents' },
  { name: 'files.download', resource: 'files', action: 'download', description: 'Download files and documents' },
  { name: 'files.delete', resource: 'files', action: 'delete', description: 'Delete files and documents' },

  // === SETTINGS MANAGEMENT ===
  { name: 'settings.read', resource: 'settings', action: 'read', description: 'View system settings' },
  { name: 'settings.update', resource: 'settings', action: 'update', description: 'Update system settings' },
  { name: 'settings.currency.read', resource: 'settings', action: 'currency-read', description: 'View currency settings' },
  { name: 'settings.currency.update', resource: 'settings', action: 'currency-update', description: 'Update currency settings' },
  { name: 'settings.business.read', resource: 'settings', action: 'business-read', description: 'View business settings' },
  { name: 'settings.business.update', resource: 'settings', action: 'business-update', description: 'Update business settings' },

  // === AUDIT & MONITORING ===
  { name: 'audit.read', resource: 'audit', action: 'read', description: 'View audit logs and system activity' },
  { name: 'notifications.read', resource: 'notifications', action: 'read', description: 'View notification history' },
  { name: 'notifications.send', resource: 'notifications', action: 'send', description: 'Send notifications to users' },

  // === DASHBOARD & REPORTS ===
  { name: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'Access dashboard and overview' },
  { name: 'reports.read', resource: 'reports', action: 'read', description: 'Generate and view reports' },
  { name: 'reports.financial', resource: 'reports', action: 'financial', description: 'Access financial reports' },
  { name: 'reports.sales', resource: 'reports', action: 'sales', description: 'Access sales reports' },
  { name: 'reports.inventory', resource: 'reports', action: 'inventory', description: 'Access inventory reports' },

  // === TASK MANAGEMENT ===
  { name: 'tasks.view', resource: 'tasks', action: 'view', description: 'View tasks and task details' },
  { name: 'tasks.create', resource: 'tasks', action: 'create', description: 'Create new tasks' },
  { name: 'tasks.edit', resource: 'tasks', action: 'edit', description: 'Edit existing tasks' },
  { name: 'tasks.delete', resource: 'tasks', action: 'delete', description: 'Delete tasks' },
  { name: 'tasks.assign', resource: 'tasks', action: 'assign', description: 'Assign tasks to users' },

  // === TASK TEMPLATES ===
  { name: 'task-templates.view', resource: 'task-templates', action: 'view', description: 'View task templates' },
  { name: 'task-templates.create', resource: 'task-templates', action: 'create', description: 'Create new task templates' },
  { name: 'task-templates.edit', resource: 'task-templates', action: 'edit', description: 'Edit task templates' },
  { name: 'task-templates.delete', resource: 'task-templates', action: 'delete', description: 'Delete task templates' },

  // === TASK CATEGORIES ===
  { name: 'task-categories.view', resource: 'task-categories', action: 'view', description: 'View task categories' },
  { name: 'task-categories.create', resource: 'task-categories', action: 'create', description: 'Create new task categories' },
  { name: 'task-categories.edit', resource: 'task-categories', action: 'edit', description: 'Edit task categories' },
  { name: 'task-categories.delete', resource: 'task-categories', action: 'delete', description: 'Delete task categories' },

  // === RECURRING TASKS ===
  { name: 'recurring-tasks.view', resource: 'recurring-tasks', action: 'view', description: 'View recurring tasks' },
  { name: 'recurring-tasks.create', resource: 'recurring-tasks', action: 'create', description: 'Create new recurring tasks' },
  { name: 'recurring-tasks.edit', resource: 'recurring-tasks', action: 'edit', description: 'Edit recurring tasks' },
  { name: 'recurring-tasks.delete', resource: 'recurring-tasks', action: 'delete', description: 'Delete recurring tasks' },
  { name: 'recurring-tasks.generate', resource: 'recurring-tasks', action: 'generate', description: 'Generate tasks from recurring patterns' },

  // === SYSTEM ADMINISTRATION ===
  { name: 'system.admin', resource: 'system', action: 'admin', description: 'Full system administration access' },
  { name: 'system.maintenance', resource: 'system', action: 'maintenance', description: 'Perform system maintenance' },
  { name: 'system.backup', resource: 'system', action: 'backup', description: 'Create system backups' },
  { name: 'system.restore', resource: 'system', action: 'restore', description: 'Restore system from backups' }
];

// Role definitions with updated abilities
const ROLE_DEFINITIONS = {
  'Super Admin': {
    description: 'Full system access with all permissions',
    abilities: SYSTEM_ABILITIES.map(ability => ability.name) // All abilities
  },
  'Administrator': {
    description: 'Full system access with all permissions',
    abilities: SYSTEM_ABILITIES.map(ability => ability.name) // All abilities
  },
  'Sales Manager': {
    description: 'Manages sales team and processes',
    abilities: [
      // User management (limited)
      'users.read',
      'users.update',
      
      // Product management (read access)
      'products.read',
      
      // Inventory (read access)
      'inventory.read',
      
      // Lead management (full)
      'leads.create',
      'leads.read',
      'leads.update',
      'leads.delete',
      'leads.bulk-delete',
      'leads.bulk-export',
      'leads.bulk-update',
      
      // Account management (full)
      'accounts.create',
      'accounts.read',
      'accounts.update',
      'accounts.delete',
      'accounts.bulk-delete',
      'accounts.bulk-export',
      
      // Opportunity management (full)
      'opportunities.create',
      'opportunities.read',
      'opportunities.update',
      'opportunities.delete',
      
      // Quotation management (full)
      'quotations.create',
      'quotations.read',
      'quotations.update',
      'quotations.delete',
      
      // Backorder management (full)
      'backorders.create',
      'backorders.read',
      'backorders.update',
      'backorders.delete',
      
      // Price lists (full)
      'price-lists.create',
      'price-lists.read',
      'price-lists.update',
      'price-lists.delete',
      'price-lists.items.add',
      'price-lists.items.remove',
      
      // Task management (full)
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      'tasks.delete',
      'tasks.assign',
      
      // Task templates (full)
      'task-templates.view',
      'task-templates.create',
      'task-templates.edit',
      'task-templates.delete',
      
      // Task categories (full)
      'task-categories.view',
      'task-categories.create',
      'task-categories.edit',
      'task-categories.delete',
      
      // Recurring tasks (full)
      'recurring-tasks.view',
      'recurring-tasks.create',
      'recurring-tasks.edit',
      'recurring-tasks.delete',
      'recurring-tasks.generate',
      
      // Reports and dashboard
      'dashboard.read',
      'reports.read',
      'reports.sales',
      
      // File management
      'files.upload',
      'files.download'
    ]
  },
  'Sales Representative': {
    description: 'Handles customer interactions and sales',
    abilities: [
      // Product management (read only)
      'products.read',
      
      // Inventory (read only)
      'inventory.read',
      
      // Lead management (create, read, update)
      'leads.create',
      'leads.read',
      'leads.update',
      
      // Account management (create, read, update)
      'accounts.create',
      'accounts.read',
      'accounts.update',
      
      // Opportunity management (create, read, update)
      'opportunities.create',
      'opportunities.read',
      'opportunities.update',
      
      // Quotation management (create, read, update)
      'quotations.create',
      'quotations.read',
      'quotations.update',
      
      // Backorder management (create, read, update)
      'backorders.create',
      'backorders.read',
      'backorders.update',
      
      // Price lists (read only)
      'price-lists.read',
      
      // Task management (create, read, update)
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      
      // Task templates (view only)
      'task-templates.view',
      
      // Task categories (view only)
      'task-categories.view',
      
      // Recurring tasks (view only)
      'recurring-tasks.view',
      
      // Dashboard and basic reports
      'dashboard.read',
      'reports.read',
      'reports.sales',
      
      // File management
      'files.upload',
      'files.download'
    ]
  },
  'Inventory Manager': {
    description: 'Manages inventory and stock movements',
    abilities: [
      // Product management (full)
      'products.create',
      'products.read',
      'products.update',
      'products.delete',
      'products.bulk-import',
      'products.bulk-export',
      'products.bulk-activate',
      'products.bulk-deactivate',
      'products.bulk-delete',
      'products.archive',
      'products.duplicate',
      'products.documents.upload',
      'products.documents.download',
      
      // Inventory management (full)
      'inventory.read',
      'inventory.update',
      'inventory.manage',
      
      // Stock movements (full)
      'stock-movements.create',
      'stock-movements.read',
      'stock-movements.update',
      'stock-movements.delete',
      'stock-movements.bulk-create',
      'stock-movements.generate-grn',
      'stock-movements.reverse',
      
      // Warehouse management (full)
      'warehouses.create',
      'warehouses.read',
      'warehouses.update',
      'warehouses.delete',
      'warehouses.products.read',
      
      // Category management (full)
      'categories.create',
      'categories.read',
      'categories.update',
      'categories.delete',
      
      // Unit management (full)
      'units.create',
      'units.read',
      'units.update',
      'units.delete',
      
      // Backorder management (read and update)
      'backorders.read',
      'backorders.update',
      
      // Task management (full)
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      'tasks.delete',
      'tasks.assign',
      
      // Task templates (full)
      'task-templates.view',
      'task-templates.create',
      'task-templates.edit',
      'task-templates.delete',
      
      // Task categories (full)
      'task-categories.view',
      'task-categories.create',
      'task-categories.edit',
      'task-categories.delete',
      
      // Recurring tasks (full)
      'recurring-tasks.view',
      'recurring-tasks.create',
      'recurring-tasks.edit',
      'recurring-tasks.delete',
      'recurring-tasks.generate',
      
      // Dashboard and inventory reports
      'dashboard.read',
      'reports.read',
      'reports.inventory',
      
      // File management
      'files.upload',
      'files.download',
      'files.delete'
    ]
  },
  'Finance Officer': {
    description: 'Handles financial operations and reporting',
    abilities: [
      // Product management (read only)
      'products.read',
      
      // Inventory (read only)
      'inventory.read',
      
      // Stock movements (read only)
      'stock-movements.read',
      
      // Lead management (read only)
      'leads.read',
      
      // Account management (read only)
      'accounts.read',
      
      // Opportunity management (read only)
      'opportunities.read',
      
      // Quotation management (read and update)
      'quotations.read',
      'quotations.update',
      
      // Backorder management (read and update)
      'backorders.read',
      'backorders.update',
      
      // Price lists (read only)
      'price-lists.read',
      
      // Currency management (full)
      'currencies.read',
      'currencies.convert',
      
      // Task management (read and update)
      'tasks.view',
      'tasks.edit',
      
      // Task templates (view only)
      'task-templates.view',
      
      // Task categories (view only)
      'task-categories.view',
      
      // Recurring tasks (view only)
      'recurring-tasks.view',
      
      // Settings (currency and business)
      'settings.read',
      'settings.currency.read',
      'settings.currency.update',
      'settings.business.read',
      'settings.business.update',
      
      // Dashboard and financial reports
      'dashboard.read',
      'reports.read',
      'reports.financial',
      
      // File management (read and download)
      'files.download'
    ]
  },
  'Executive Viewer': {
    description: 'Read-only access to business data and reports',
    abilities: [
      // Product management (read only)
      'products.read',
      
      // Inventory (read only)
      'inventory.read',
      
      // Stock movements (read only)
      'stock-movements.read',
      
      // Warehouse management (read only)
      'warehouses.read',
      
      // Lead management (read only)
      'leads.read',
      
      // Account management (read only)
      'accounts.read',
      
      // Opportunity management (read only)
      'opportunities.read',
      
      // Quotation management (read only)
      'quotations.read',
      
      // Backorder management (read only)
      'backorders.read',
      
      // Price lists (read only)
      'price-lists.read',
      
      // Currency management (read only)
      'currencies.read',
      
      // Task management (read only)
      'tasks.view',
      
      // Task templates (read only)
      'task-templates.view',
      
      // Task categories (read only)
      'task-categories.view',
      
      // Recurring tasks (read only)
      'recurring-tasks.view',
      
      // Settings (read only)
      'settings.read',
      'settings.currency.read',
      'settings.business.read',
      
      // Dashboard and all reports
      'dashboard.read',
      'reports.read',
      'reports.financial',
      'reports.sales',
      'reports.inventory',
      
      // File management (download only)
      'files.download'
    ]
  }
};

async function updateSystemAbilities() {
  console.log('🔄 Updating system abilities based on current functionality...');

  try {
    // Step 1: Update or create all abilities
    console.log('📝 Updating ability definitions...');
    let createdCount = 0;
    let updatedCount = 0;

    for (const ability of SYSTEM_ABILITIES) {
      const existing = await prisma.ability.findUnique({
        where: { name: ability.name }
      });

      if (existing) {
        await prisma.ability.update({
          where: { name: ability.name },
          data: ability
        });
        updatedCount++;
      } else {
        await prisma.ability.create({
          data: ability
        });
        createdCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} existing abilities`);
    console.log(`✅ Created ${createdCount} new abilities`);

    // Step 2: Update role definitions
    console.log('👔 Updating role definitions...');
    
    for (const [roleName, roleDef] of Object.entries(ROLE_DEFINITIONS)) {
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        console.log(`⚠️ Role "${roleName}" not found, skipping...`);
        continue;
      }

      // Get ability IDs for this role
      const abilityIds = await prisma.ability.findMany({
        where: { name: { in: roleDef.abilities } },
        select: { id: true }
      });

      // Update role abilities
      await prisma.roleAbility.deleteMany({
        where: { roleId: role.id }
      });

      await prisma.roleAbility.createMany({
        data: abilityIds.map(ability => ({
          roleId: role.id,
          abilityId: ability.id
        }))
      });

      console.log(`✅ Updated role "${roleName}" with ${abilityIds.length} abilities`);
    }

    // Step 3: Clean up unused abilities (optional)
    console.log('🧹 Checking for unused abilities...');
    const allAbilities = await prisma.ability.findMany();
    const usedAbilities = new Set(ROLE_DEFINITIONS.Administrator.abilities);
    
    const unusedAbilities = allAbilities.filter(ability => !usedAbilities.has(ability.name));
    
    if (unusedAbilities.length > 0) {
      console.log(`⚠️ Found ${unusedAbilities.length} unused abilities:`);
      unusedAbilities.forEach(ability => {
        console.log(`   - ${ability.name} (${ability.resource}.${ability.action})`);
      });
    }

    console.log('🎉 System abilities updated successfully!');
    console.log(`📊 Total abilities in system: ${allAbilities.length}`);
    console.log(`👔 Roles updated: ${Object.keys(ROLE_DEFINITIONS).length}`);

  } catch (error) {
    console.error('❌ Error updating system abilities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { SYSTEM_ABILITIES, ROLE_DEFINITIONS, updateSystemAbilities };

// Run if called directly
if (require.main === module) {
  updateSystemAbilities()
    .catch((e) => {
      console.error('❌ Update failed:', e);
      process.exit(1);
    });
}
