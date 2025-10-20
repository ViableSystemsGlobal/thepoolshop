const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPermissionsAndLeads() {
  try {
    console.log('🚀 Fixing permissions and leads issues...');
    
    // 1. Create SUPER_ADMIN role
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: { description: 'Full system access' },
      create: { name: 'SUPER_ADMIN', description: 'Full system access' }
    });
    console.log('✅ SUPER_ADMIN role created');
    
    // 2. Create all essential abilities
    const abilities = [
      // Dashboard
      { name: 'dashboard.view', description: 'View dashboard', resource: 'dashboard', action: 'view' },
      
      // Products
      { name: 'products.view', description: 'View products', resource: 'products', action: 'view' },
      { name: 'products.create', description: 'Create products', resource: 'products', action: 'create' },
      { name: 'products.edit', description: 'Edit products', resource: 'products', action: 'edit' },
      { name: 'products.delete', description: 'Delete products', resource: 'products', action: 'delete' },
      
      // CRM
      { name: 'crm.view', description: 'View CRM', resource: 'crm', action: 'view' },
      { name: 'crm.create', description: 'Create CRM records', resource: 'crm', action: 'create' },
      { name: 'crm.edit', description: 'Edit CRM records', resource: 'crm', action: 'edit' },
      { name: 'crm.delete', description: 'Delete CRM records', resource: 'crm', action: 'delete' },
      { name: 'crm.leads', description: 'Manage leads', resource: 'crm', action: 'leads' },
      { name: 'crm.contacts', description: 'Manage contacts', resource: 'crm', action: 'contacts' },
      { name: 'crm.accounts', description: 'Manage accounts', resource: 'crm', action: 'accounts' },
      { name: 'crm.opportunities', description: 'Manage opportunities', resource: 'crm', action: 'opportunities' },
      
      // DRM
      { name: 'drm.view', description: 'View DRM', resource: 'drm', action: 'view' },
      { name: 'drm.create', description: 'Create DRM records', resource: 'drm', action: 'create' },
      { name: 'drm.edit', description: 'Edit DRM records', resource: 'drm', action: 'edit' },
      { name: 'drm.delete', description: 'Delete DRM records', resource: 'drm', action: 'delete' },
      { name: 'drm.distributors', description: 'Manage distributors', resource: 'drm', action: 'distributors' },
      { name: 'drm.leads', description: 'Manage distributor leads', resource: 'drm', action: 'leads' },
      
      // Users
      { name: 'users.view', description: 'View users', resource: 'users', action: 'view' },
      { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
      { name: 'users.edit', description: 'Edit users', resource: 'users', action: 'edit' },
      { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
      
      // Settings
      { name: 'settings.view', description: 'View settings', resource: 'settings', action: 'view' },
      { name: 'settings.edit', description: 'Edit settings', resource: 'settings', action: 'edit' },
      
      // Inventory
      { name: 'inventory.view', description: 'View inventory', resource: 'inventory', action: 'view' },
      { name: 'inventory.manage', description: 'Manage inventory', resource: 'inventory', action: 'manage' },
      
      // Orders
      { name: 'orders.view', description: 'View orders', resource: 'orders', action: 'view' },
      { name: 'orders.create', description: 'Create orders', resource: 'orders', action: 'create' },
      { name: 'orders.edit', description: 'Edit orders', resource: 'orders', action: 'edit' },
      { name: 'orders.delete', description: 'Delete orders', resource: 'orders', action: 'delete' },
      
      // Invoices
      { name: 'invoices.view', description: 'View invoices', resource: 'invoices', action: 'view' },
      { name: 'invoices.create', description: 'Create invoices', resource: 'invoices', action: 'create' },
      { name: 'invoices.edit', description: 'Edit invoices', resource: 'invoices', action: 'edit' },
      { name: 'invoices.delete', description: 'Delete invoices', resource: 'invoices', action: 'delete' },
      
      // Tasks
      { name: 'tasks.view', description: 'View tasks', resource: 'tasks', action: 'view' },
      { name: 'tasks.create', description: 'Create tasks', resource: 'tasks', action: 'create' },
      { name: 'tasks.edit', description: 'Edit tasks', resource: 'tasks', action: 'edit' },
      { name: 'tasks.delete', description: 'Delete tasks', resource: 'tasks', action: 'delete' },
      
      // Reports
      { name: 'reports.view', description: 'View reports', resource: 'reports', action: 'view' }
    ];
    
    console.log(`Creating ${abilities.length} abilities...`);
    
    for (const ability of abilities) {
      await prisma.ability.upsert({
        where: { name: ability.name },
        update: ability,
        create: ability
      });
    }
    console.log('✅ All abilities created');
    
    // 3. Assign all abilities to SUPER_ADMIN
    const allAbilities = await prisma.ability.findMany();
    console.log(`Assigning ${allAbilities.length} abilities to SUPER_ADMIN...`);
    
    for (const ability of allAbilities) {
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
    console.log('✅ All abilities assigned to SUPER_ADMIN');
    
    // 4. Assign user to SUPER_ADMIN role
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@adpools.com' }
    });
    
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id
      }
    });
    console.log('✅ Admin user assigned to SUPER_ADMIN role');
    
    // 5. Fix the leads issue by creating a sample lead
    console.log('🔧 Creating sample lead to test leads functionality...');
    
    const sampleLead = await prisma.lead.upsert({
      where: { 
        email: 'sample@example.com'
      },
      update: {
        name: 'Sample Lead',
        email: 'sample@example.com',
        phone: '+1234567890',
        company: 'Sample Company',
        status: 'NEW',
        source: 'WEBSITE',
        ownerId: adminUser.id,
        addedBy: adminUser.id
      },
      create: {
        name: 'Sample Lead',
        email: 'sample@example.com',
        phone: '+1234567890',
        company: 'Sample Company',
        status: 'NEW',
        source: 'WEBSITE',
        ownerId: adminUser.id,
        addedBy: adminUser.id
      }
    });
    console.log('✅ Sample lead created');
    
    // 6. Verify the setup
    const userAbilities = await prisma.userRoleAssignment.findMany({
      where: { userId: adminUser.id },
      include: {
        role: {
          include: {
            abilities: {
              include: {
                ability: true
              }
            }
          }
        }
      }
    });
    
    const totalAbilities = userAbilities.reduce((total, assignment) => {
      return total + assignment.role.abilities.length;
    }, 0);
    
    console.log(`✅ Verification: Admin user has ${totalAbilities} abilities`);
    
    const leadCount = await prisma.lead.count({
      where: { ownerId: adminUser.id }
    });
    console.log(`✅ Verification: Admin user has ${leadCount} leads`);
    
    console.log('🎉 Permissions and leads issues fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissionsAndLeads();
