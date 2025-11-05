#!/usr/bin/env node

/**
 * Restore Roles and Abilities Script
 * 
 * This script will:
 * 1. Create all necessary abilities
 * 2. Create SUPER_ADMIN role with all abilities
 * 3. Assign SUPER_ADMIN role to the admin user
 * 
 * Run this after a database reset to restore access control.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restoreRolesAndAbilities() {
  console.log('🔐 Restoring Roles and Abilities...\n');

  try {
    // Step 1: Create all abilities
    console.log('📋 Step 1: Creating all abilities...');
    
    const allAbilities = [
      // Core navigation
      'dashboard.view',
      'crm.view', 'drm.view', 'sales.view', 'inventory.view',
      'communication.view', 'agents.view', 'reports.view', 'settings.view', 'tasks.view',
      'ai_analyst.access', 'ai-analyst.view',
      
      // Products
      'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
      'products.read', 'products.update',
      
      // Leads & CRM
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.manage',
      'leads.read', 'leads.update', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
      'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete', 'accounts.manage',
      'accounts.read', 'accounts.update',
      'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
      'opportunities.read', 'opportunities.update',
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
      'contacts.read', 'contacts.update',
      
      // Sales
      'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete', 'invoices.manage',
      'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
      'payments.read', 'payments.update',
      'orders.view', 'orders.create', 'orders.edit', 'orders.delete', 'orders.manage',
      'proformas.view', 'proformas.create', 'proformas.edit', 'proformas.delete',
      'returns.view', 'returns.create', 'returns.edit', 'returns.delete',
      'credit-notes.view', 'credit-notes.create', 'credit-notes.edit', 'credit-notes.delete',
      
      // Inventory
      'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
      'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
      'stock-movements.view', 'stock-movements.create', 'stock-movements.read',
      'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
      'price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete',
      'inventory.manage', 'inventory.read', 'inventory.update',
      
      // DRM
      'distributor-leads.view', 'distributor-leads.create', 'distributor-leads.edit', 'distributor-leads.delete',
      'distributors.view', 'distributors.create', 'distributors.edit', 'distributors.delete',
      'routes-mapping.view', 'routes-mapping.create', 'routes-mapping.edit', 'routes-mapping.delete',
      'engagement.view', 'engagement.create', 'engagement.edit', 'engagement.delete',
      'drm-orders.view',
      
      // Communication
      'email-campaigns.view', 'email-campaigns.create', 'email-campaigns.edit', 'email-campaigns.delete',
      'sms-campaigns.view', 'sms-campaigns.create', 'sms-campaigns.edit', 'sms-campaigns.delete',
      'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete',
      
      // Agents
      'agents.view', 'agents.create', 'agents.edit', 'agents.delete', 'agents.manage',
      
      // Reports
      'reports.view', 'reports.financial', 'reports.sales', 'reports.inventory',
      
      // Tasks
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.manage',
      
      // Users & Roles
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage',
      'users.read', 'users.update',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'roles.read', 'roles.update',
      
      // Settings
      'settings.view', 'settings.read', 'settings.update',
      'audit.read', 'audit.view',
      
      // Categories
      'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
    ];

    const createdAbilities = [];
    for (const abilityName of allAbilities) {
      const [resource, action] = abilityName.split('.');
      const ability = await prisma.ability.upsert({
        where: { name: abilityName },
        update: {
          resource: resource || 'system',
          action: action || 'access',
          description: `${action || 'access'} ${resource || 'system'}`
        },
        create: {
          name: abilityName,
          resource: resource || 'system',
          action: action || 'access',
          description: `${action || 'access'} ${resource || 'system'}`
        }
      });
      createdAbilities.push(ability);
    }
    console.log(`✅ Created/updated ${createdAbilities.length} abilities\n`);

    // Step 2: Create SUPER_ADMIN role
    console.log('📋 Step 2: Creating SUPER_ADMIN role...');
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
    console.log(`✅ SUPER_ADMIN role created/updated: ${superAdminRole.id}\n`);

    // Step 3: Assign all abilities to SUPER_ADMIN role
    console.log('📋 Step 3: Assigning all abilities to SUPER_ADMIN role...');
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
    console.log(`✅ Assigned ${assignmentsCreated} abilities to SUPER_ADMIN role\n`);

    // Step 4: Find or create admin user
    console.log('📋 Step 4: Setting up admin user...');
    const adminEmail = 'admin@adpools.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Created admin user: ${adminUser.email}\n`);
    } else {
      // Update admin user to ensure correct role
      adminUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ Updated admin user: ${adminUser.email}\n`);
    }

    // Step 5: Assign SUPER_ADMIN role to admin user
    console.log('📋 Step 5: Assigning SUPER_ADMIN role to admin user...');
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
    console.log('✅ SUPER_ADMIN role assigned to admin user\n');

    // Step 6: Verify the setup
    console.log('📋 Step 6: Verifying setup...');
    const verifyUser = await prisma.user.findUnique({
      where: { email: adminEmail },
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

    if (verifyUser && verifyUser.userRoles.length > 0) {
      const role = verifyUser.userRoles[0].role;
      const abilityCount = role.roleAbilities.length;
      console.log(`✅ Verification successful:`);
      console.log(`   User: ${verifyUser.email}`);
      console.log(`   Role: ${role.name}`);
      console.log(`   Abilities: ${abilityCount}`);
    } else {
      console.log('⚠️  Warning: Could not verify role assignment');
    }

    console.log('\n🎉 Roles and abilities restored successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Logout and login again as admin@adpools.com');
    console.log('2. Your SUPER_ADMIN access should now be restored');
    console.log('3. You should be able to access all modules');

  } catch (error) {
    console.error('\n❌ Error restoring roles and abilities:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restore
restoreRolesAndAbilities();

