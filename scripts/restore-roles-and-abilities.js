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
    
    // All abilities from src/lib/permissions.ts - ABILITIES object
    const allAbilities = [
      // Dashboard
      'dashboard.view',
      
      // Products
      'products.view', 'products.create', 'products.edit', 'products.delete',
      
      // Inventory
      'inventory.view', 'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
      
      // Warehouses
      'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
      
      // Price Lists
      'price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete',
      
      // CRM
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.manage',
      'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
      'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
      'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
      
      // Backorders
      'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
      
      // DRM
      'drm.view', 'distributor-leads.view', 'distributor-leads.create', 'distributor-leads.edit', 'distributor-leads.delete',
      'distributors.view', 'distributors.create', 'distributors.edit', 'distributors.delete',
      'routes-mapping.view', 'routes-mapping.create', 'routes-mapping.edit', 'routes-mapping.delete',
      'engagement.view', 'engagement.create', 'engagement.edit', 'engagement.delete',
      'drm-orders.view',
      
      // Sales
      'sales.view', 'orders.view', 'proformas.view',
      'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
      'payments.view', 'payments.create', 'payments.edit',
      'returns.view',
      'credit-notes.view', 'credit-notes.create', 'credit-notes.edit', 'credit-notes.delete',
      
      // Communication
      'communication.view', 'templates.view', 'communication-logs.view',
      'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
      'email.view', 'email.send', 'email.bulk_send', 'email.history',
      
      // Tasks
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
      'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
      'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
      'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
      
      // Agents
      'agents.view', 'agents.create', 'agents.edit', 'agents.delete',
      'commissions.view', 'commissions.create', 'commissions.edit', 'commissions.delete',
      
      // Reports
      'reports.view',
      
      // AI Analyst
      'ai_analyst.access',
      
      // Settings
      'settings.view',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage',
      'product-settings.view',
      'currency-settings.view',
      'business-settings.view',
      'google-maps.view', 'google-maps.config',
      'credit-monitoring.view', 'credit-monitoring.manage',
      'backup-settings.view', 'backup-settings.manage',
      'system-settings.view',
      'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.config',
      'notification-templates.view', 'notification-templates.create', 'notification-templates.edit', 'notification-templates.delete',
      'lead-sources.view', 'lead-sources.create', 'lead-sources.edit', 'lead-sources.delete',
      'ai-settings.view', 'ai-settings.manage',
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

