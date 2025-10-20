const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { mkdirSync, existsSync, writeFileSync } = require('fs');

const prisma = new PrismaClient();

async function fixAllProductionIssues() {
  console.log('🔧 COMPREHENSIVE PRODUCTION FIX: Resolving all issues...');

  try {
    // Step 1: Fix user ID mismatches and ensure canonical user exists
    console.log('\n👤 Step 1: Ensuring canonical admin user exists...');
    const canonicalUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    const adminEmail = 'admin@adpools.com';
    const adminPassword = 'admin123';

    // Check if canonical user exists
    let canonicalUser = await prisma.user.findUnique({
      where: { id: canonicalUserId }
    });

    if (!canonicalUser) {
      // Check if admin email exists with different ID
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (existingAdmin) {
        console.log(`Found existing admin with different ID: ${existingAdmin.id}`);
        
        // Update all foreign key references to use canonical ID
        console.log('   📝 Updating all foreign key references...');
        
        // Update in batches to avoid conflicts
        await prisma.lead.updateMany({
          where: { ownerId: existingAdmin.id },
          data: { ownerId: canonicalUserId }
        });
        
        await prisma.distributor.updateMany({
          where: { approvedBy: existingAdmin.id },
          data: { approvedBy: canonicalUserId }
        });
        
        await prisma.distributorLead.updateMany({
          where: { submittedBy: existingAdmin.id },
          data: { submittedBy: canonicalUserId }
        });
        
        await prisma.invoice.updateMany({
          where: { ownerId: existingAdmin.id },
          data: { ownerId: canonicalUserId }
        });
        
        await prisma.quotation.updateMany({
          where: { ownerId: existingAdmin.id },
          data: { ownerId: canonicalUserId }
        });
        
        await prisma.task.updateMany({
          where: { createdBy: existingAdmin.id },
          data: { createdBy: canonicalUserId }
        });
        
        await prisma.account.updateMany({
          where: { ownerId: existingAdmin.id },
          data: { ownerId: canonicalUserId }
        });
        
        await prisma.userRoleAssignment.updateMany({
          where: { userId: existingAdmin.id },
          data: { userId: canonicalUserId }
        });
        
        console.log('   ✅ Updated all foreign key references');
        
        // Now update the user record itself
        const hashedPassword = await hash(adminPassword, 10);
        canonicalUser = await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            id: canonicalUserId,
            password: hashedPassword,
            name: 'System Administrator',
            role: 'SUPER_ADMIN',
            isActive: true,
          }
        });
        console.log(`✅ Updated admin user to canonical ID: ${canonicalUser.id}`);
      } else {
        // Create new canonical user
        const hashedPassword = await hash(adminPassword, 10);
        canonicalUser = await prisma.user.create({
          data: {
            id: canonicalUserId,
            email: adminEmail,
            name: 'System Administrator',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
          }
        });
        console.log(`✅ Created canonical admin user: ${canonicalUser.id}`);
      }
    } else {
      console.log(`✅ Canonical user already exists: ${canonicalUser.id}`);
    }

    // Step 2: Create comprehensive abilities (all 180+ abilities)
    console.log('\n⚡ Step 2: Creating comprehensive abilities (180+ abilities)...');
    
    const allAbilities = [
      // Core abilities
      'dashboard.view', 'dashboard.manage',
      
      // CRM abilities
      'crm.view', 'crm.manage',
      'leads.create', 'leads.view', 'leads.edit', 'leads.delete', 'leads.manage',
      'leads.assign', 'leads.convert', 'leads.export', 'leads.import',
      'accounts.create', 'accounts.view', 'accounts.edit', 'accounts.delete', 'accounts.manage',
      'contacts.create', 'contacts.view', 'contacts.edit', 'contacts.delete', 'contacts.manage',
      'opportunities.create', 'opportunities.view', 'opportunities.edit', 'opportunities.delete', 'opportunities.manage',
      
      // DRM abilities
      'drm.view', 'drm.manage',
      'distributors.create', 'distributors.view', 'distributors.edit', 'distributors.delete', 'distributors.manage',
      'distributor-leads.create', 'distributor-leads.view', 'distributor-leads.edit', 'distributor-leads.delete', 'distributor-leads.manage',
      'distributor-leads.approve', 'distributor-leads.reject',
      'routes.create', 'routes.view', 'routes.edit', 'routes.delete', 'routes.manage',
      'zones.create', 'zones.view', 'zones.edit', 'zones.delete', 'zones.manage',
      
      // Sales abilities
      'sales.view', 'sales.manage',
      'quotations.create', 'quotations.view', 'quotations.edit', 'quotations.delete', 'quotations.manage',
      'quotations.send', 'quotations.approve', 'quotations.convert',
      'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete', 'invoices.manage',
      'invoices.send', 'invoices.approve', 'invoices.void',
      'orders.create', 'orders.view', 'orders.edit', 'orders.delete', 'orders.manage',
      'orders.fulfill', 'orders.ship', 'orders.cancel',
      'proformas.create', 'proformas.view', 'proformas.edit', 'proformas.delete', 'proformas.manage',
      
      // Products abilities
      'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
      'products.import', 'products.export', 'products.bulk-edit',
      'categories.create', 'categories.view', 'categories.edit', 'categories.delete', 'categories.manage',
      'price-lists.create', 'price-lists.view', 'price-lists.edit', 'price-lists.delete', 'price-lists.manage',
      
      // Inventory abilities
      'inventory.view', 'inventory.manage',
      'stock.view', 'stock.manage', 'stock.adjust', 'stock.transfer',
      'warehouses.create', 'warehouses.view', 'warehouses.edit', 'warehouses.delete', 'warehouses.manage',
      'stock-movements.view', 'stock-movements.create', 'stock-movements.manage',
      'stocktakes.create', 'stocktakes.view', 'stocktakes.edit', 'stocktakes.delete', 'stocktakes.manage',
      'backorders.view', 'backorders.manage', 'backorders.fulfill',
      
      // Communication abilities
      'communication.view', 'communication.manage',
      'sms.send', 'sms.view', 'sms.manage',
      'email.send', 'email.view', 'email.manage',
      'campaigns.create', 'campaigns.view', 'campaigns.edit', 'campaigns.delete', 'campaigns.manage',
      'templates.create', 'templates.view', 'templates.edit', 'templates.delete', 'templates.manage',
      
      // Task abilities
      'tasks.create', 'tasks.view', 'tasks.edit', 'tasks.delete', 'tasks.manage',
      'tasks.assign', 'tasks.complete', 'tasks.comment',
      'task-templates.create', 'task-templates.view', 'task-templates.edit', 'task-templates.delete', 'task-templates.manage',
      'recurring-tasks.create', 'recurring-tasks.view', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.manage',
      
      // Agent abilities
      'agents.view', 'agents.create', 'agents.edit', 'agents.delete', 'agents.manage',
      'commissions.view', 'commissions.create', 'commissions.edit', 'commissions.delete', 'commissions.manage',
      'commissions.approve', 'commissions.pay', 'commissions.calculate',
      
      // Payment abilities
      'payments.create', 'payments.view', 'payments.edit', 'payments.delete', 'payments.manage',
      'payments.receive', 'payments.allocate', 'payments.void',
      'credit-notes.create', 'credit-notes.view', 'credit-notes.edit', 'credit-notes.delete', 'credit-notes.manage',
      'credit-notes.apply', 'credit-notes.void',
      'returns.create', 'returns.view', 'returns.edit', 'returns.delete', 'returns.manage',
      'returns.approve', 'returns.process', 'returns.refund',
      
      // Report abilities
      'reports.view', 'reports.generate', 'reports.export', 'reports.manage',
      'analytics.view', 'analytics.manage',
      'dashboards.view', 'dashboards.create', 'dashboards.manage',
      
      // Settings abilities
      'settings.view', 'settings.manage',
      'users.create', 'users.view', 'users.edit', 'users.delete', 'users.manage',
      'roles.create', 'roles.view', 'roles.edit', 'roles.delete', 'roles.manage',
      'permissions.view', 'permissions.manage',
      'system-settings.view', 'system-settings.manage',
      'business-settings.view', 'business-settings.manage',
      'currency-settings.view', 'currency-settings.manage',
      'notification-settings.view', 'notification-settings.manage',
      'backup-settings.view', 'backup-settings.manage',
      'ai-settings.view', 'ai-settings.manage',
      
      // Notification abilities
      'notifications.view', 'notifications.create', 'notifications.manage',
      'notification-templates.create', 'notification-templates.view', 'notification-templates.edit', 'notification-templates.delete', 'notification-templates.manage',
      
      // AI abilities
      'ai_analyst.view', 'ai_analyst.manage', 'ai_analyst.query',
      
      // Audit abilities
      'audit-logs.view', 'audit-logs.manage',
      'activities.view', 'activities.manage',
      
      // Credit monitoring abilities
      'credit-monitoring.view', 'credit-monitoring.manage',
      'credit-limits.set', 'credit-limits.approve', 'credit-limits.review',
      
      // Google Maps abilities
      'google-maps.view', 'google-maps.manage',
      
      // Lead source abilities
      'lead-sources.create', 'lead-sources.view', 'lead-sources.edit', 'lead-sources.delete', 'lead-sources.manage'
    ];

    for (const abilityName of allAbilities) {
      const [resource, action] = abilityName.split('.');
      await prisma.ability.upsert({
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
    }
    console.log(`✅ Created/updated ${allAbilities.length} comprehensive abilities`);

    // Step 3: Ensure SUPER_ADMIN role and assign ALL abilities
    console.log('\n🔐 Step 3: Setting up SUPER_ADMIN role with ALL abilities...');
    
    let superAdminRole = await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {
        description: 'Full unrestricted access to all features',
        isSystem: true,
        isActive: true,
      },
      create: {
        name: 'SUPER_ADMIN',
        description: 'Full unrestricted access to all features',
        isSystem: true,
        isActive: true,
      }
    });

    // Clear existing assignments and assign ALL abilities
    await prisma.roleAbility.deleteMany({
      where: { roleId: superAdminRole.id }
    });

    for (const abilityName of allAbilities) {
      const ability = await prisma.ability.findUnique({
        where: { name: abilityName }
      });
      
      if (ability) {
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
    console.log(`✅ Assigned ALL ${allAbilities.length} abilities to SUPER_ADMIN role`);

    // Step 4: Ensure user has SUPER_ADMIN role assignment
    console.log('\n🔗 Step 4: Ensuring user role assignment...');
    
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: canonicalUser.id,
          roleId: superAdminRole.id
        }
      },
      update: { isActive: true },
      create: {
        userId: canonicalUser.id,
        roleId: superAdminRole.id,
        isActive: true
      }
    });
    console.log('✅ User role assignment ensured');

    // Step 5: Fix upload directories and create fallback files
    console.log('\n📁 Step 5: Setting up upload directories and fallback files...');
    
    const uploadDirs = [
      '/app/uploads',
      '/app/uploads/branding',
      '/app/uploads/products',
      '/app/uploads/leads',
      '/app/uploads/tasks',
      '/app/uploads/warehouses',
      '/app/uploads/distributor-leads'
    ];

    for (const dir of uploadDirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    }

    // Create fallback favicon
    const fallbackFaviconPath = '/app/uploads/branding/fallback-favicon.png';
    if (!existsSync(fallbackFaviconPath)) {
      const fallbackPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      writeFileSync(fallbackFaviconPath, fallbackPng);
      console.log(`✅ Created fallback favicon: ${fallbackFaviconPath}`);
    }

    // Step 6: Update system settings with red branding and fallback paths
    console.log('\n🎨 Step 6: Setting up branding with red theme...');
    
    const brandingSettings = [
      { key: 'company_name', value: 'AdPools Group', category: 'branding' },
      { key: 'company_logo', value: '/uploads/branding/fallback-favicon.png', category: 'branding' },
      { key: 'favicon', value: '/uploads/branding/fallback-favicon.png', category: 'branding' },
      { key: 'primary_color', value: '#dc2626', category: 'branding' }, // Red
      { key: 'secondary_color', value: '#b91c1c', category: 'branding' }, // Dark red
      { key: 'company_description', value: 'A practical, single-tenant system for sales and distribution management', category: 'branding' }
    ];

    for (const setting of brandingSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category
        }
      });
    }
    console.log(`✅ Updated ${brandingSettings.length} branding settings with red theme`);

    // Step 7: Final verification
    console.log('\n🧪 Step 7: Final verification...');
    
    const verifyUser = await prisma.user.findUnique({
      where: { id: canonicalUserId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                roleAbilities: {
                  include: { ability: true }
                }
              }
            }
          }
        }
      }
    });

    if (!verifyUser) {
      throw new Error('User verification failed - user not found');
    }

    const userAbilities = verifyUser.userRoles.flatMap(ra =>
      ra.role.roleAbilities.map(rA => rA.ability.name)
    );

    console.log(`✅ COMPREHENSIVE VERIFICATION SUCCESSFUL:`);
    console.log(`   User ID: ${verifyUser.id}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Role: ${verifyUser.role}`);
    console.log(`   Total Abilities: ${userAbilities.length}`);
    console.log(`   Can Create Leads: ${userAbilities.includes('leads.create')}`);
    console.log(`   Can Create Distributors: ${userAbilities.includes('distributors.create')}`);
    console.log(`   Can View CRM: ${userAbilities.includes('crm.view')}`);
    console.log(`   Can Manage Users: ${userAbilities.includes('users.manage')}`);

    console.log('\n🎉 COMPREHENSIVE PRODUCTION FIX COMPLETE!');
    console.log('\n📋 Fixed issues:');
    console.log('   ✅ User ID mismatches resolved');
    console.log('   ✅ 180+ abilities created and assigned');
    console.log('   ✅ Upload directories created');
    console.log('   ✅ Fallback files created');
    console.log('   ✅ Red branding theme applied');
    console.log('   ✅ All foreign key constraints resolved');
    console.log('\n🚀 All production issues should now be resolved!');

  } catch (error) {
    console.error('❌ Comprehensive fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAllProductionIssues();
