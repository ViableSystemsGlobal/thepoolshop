import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Hardcoded role abilities as fallback
const ROLE_ABILITIES: { [key: string]: string[] } = {
  'SUPER_ADMIN': [
    'dashboard.view',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'inventory.view', 'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
    'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
    'price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete',
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
    'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
    'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
    'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
    'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
    'drm.view', 'distributor-leads.view', 'distributor-leads.create', 'distributor-leads.edit', 'distributor-leads.delete',
    'distributors.view', 'distributors.create', 'distributors.edit', 'distributors.delete',
    'routes-mapping.view', 'routes-mapping.create', 'routes-mapping.edit', 'routes-mapping.delete',
    'engagement.view', 'engagement.create', 'engagement.edit', 'engagement.delete',
    'drm-orders.view',
    'sales.view', 'orders.view', 'proformas.view', 'invoices.view', 'payments.view', 'returns.view', 'credit-notes.view', 'credit-notes.create', 'credit-notes.edit', 'credit-notes.delete',
    'communication.view', 'templates.view', 'communication-logs.view',
    'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
    'email.view', 'email.send', 'email.bulk_send', 'email.history',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
    'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
    'agents.view', 'commissions.view',
    'reports.view',
    'settings.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'product-settings.view', 'currency-settings.view', 'business-settings.view', 'google-maps.view', 'google-maps.config', 'credit-monitoring.view', 'credit-monitoring.manage', 'system-settings.view',
    'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.config',
    'notification-templates.view', 'notification-templates.create', 'notification-templates.edit', 'notification-templates.delete',
    'lead-sources.view', 'lead-sources.create', 'lead-sources.edit', 'lead-sources.delete',
  ],
  'ADMIN': [
    'dashboard.view',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'inventory.view', 'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
    'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
    'price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete',
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
    'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
    'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
    'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
    'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
    'drm.view', 'distributor-leads.view', 'distributor-leads.create', 'distributor-leads.edit', 'distributor-leads.delete',
    'distributors.view', 'distributors.create', 'distributors.edit', 'distributors.delete',
    'routes-mapping.view', 'routes-mapping.create', 'routes-mapping.edit', 'routes-mapping.delete',
    'engagement.view', 'engagement.create', 'engagement.edit', 'engagement.delete',
    'drm-orders.view',
    'sales.view', 'orders.view', 'proformas.view', 'invoices.view', 'payments.view', 'returns.view', 'credit-notes.view', 'credit-notes.create', 'credit-notes.edit', 'credit-notes.delete',
    'communication.view', 'templates.view', 'communication-logs.view',
    'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
    'email.view', 'email.send', 'email.bulk_send', 'email.history',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
    'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
    'agents.view', 'commissions.view',
    'reports.view',
    'settings.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'product-settings.view', 'currency-settings.view', 'business-settings.view', 'google-maps.view', 'google-maps.config', 'credit-monitoring.view', 'credit-monitoring.manage', 'system-settings.view',
    'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.config',
    'notification-templates.view', 'notification-templates.create', 'notification-templates.edit', 'notification-templates.delete',
    'lead-sources.view', 'lead-sources.create', 'lead-sources.edit', 'lead-sources.delete',
  ]
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role assignments
    const userRoleAssignments = await prisma.userRoleAssignment.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
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
    });

    // Extract all abilities from all assigned roles
    const abilities: string[] = [];
    userRoleAssignments.forEach(assignment => {
      assignment.role.roleAbilities.forEach(roleAbility => {
        if (!abilities.includes(roleAbility.ability.name)) {
          abilities.push(roleAbility.ability.name);
        }
      });
    });

    // If no abilities found from database, fall back to hardcoded role-based abilities
    if (abilities.length === 0) {
      console.log('🔍 No database abilities found, using fallback for role:', session.user.role);
      const userRole = session.user.role as string;
      const fallbackAbilities = ROLE_ABILITIES[userRole] || [];
      console.log('🔍 Fallback abilities count:', fallbackAbilities.length);
      return NextResponse.json({
        success: true,
        abilities: fallbackAbilities,
        source: 'fallback'
      });
    }

    // Map database abilities to navigation abilities
    // Since the database is incomplete, we'll be generous with Super Admin access
    const navigationMapping = {
      'sales.view': ['invoices.view', 'payments.view', 'quotations.view', 'products.view', 'users.manage'],
      'crm.view': ['leads.view', 'accounts.view', 'opportunities.view', 'users.manage'],
      'drm.view': ['accounts.view', 'users.manage'], 
      'inventory.view': ['inventory.view', 'products.view', 'warehouses.view', 'stock-movements.view', 'users.manage'],
      'communication.view': ['users.view', 'users.manage'], 
      'agents.view': ['users.view', 'users.manage'], 
      'reports.view': ['reports.view', 'users.manage'],
      'settings.view': ['settings.manage', 'users.manage', 'roles.manage'],
      'tasks.view': ['users.view', 'users.manage'], 
      'dashboard.view': ['dashboard.view', 'users.manage'],
      'ai_analyst.access': ['users.manage', 'reports.view'], // AI Analyst access
      'ai-analyst.view': ['users.manage', 'reports.view'], // Alternative naming
    };

    // Add navigation abilities based on database abilities
    const enhancedAbilities = [...abilities];
    
    Object.entries(navigationMapping).forEach(([navAbility, requiredAbilities]) => {
      const hasRequiredAbilities = requiredAbilities.some(required => abilities.includes(required));
      if (hasRequiredAbilities && !enhancedAbilities.includes(navAbility)) {
        enhancedAbilities.push(navAbility);
      }
    });

    // Add other expected abilities based on database abilities
    const abilityMappings = {
      // Core CRUD abilities
      'products.create': 'products.create',
      'products.edit': 'products.edit', 
      'products.delete': 'products.delete',
      'invoices.create': 'invoices.create',
      'invoices.edit': 'invoices.edit',
      'invoices.delete': 'invoices.delete',
      'payments.create': 'payments.create',
      'payments.edit': 'payments.edit',
      'leads.create': 'leads.create',
      'leads.update': 'leads.edit',
      'leads.delete': 'leads.delete',
      'leads.read': 'leads.view',
      'leads.bulk-delete': 'leads.manage',
      'leads.bulk-export': 'leads.manage',
      'leads.bulk-update': 'leads.manage',
      'accounts.create': 'accounts.create',
      'accounts.edit': 'accounts.edit',
      'accounts.delete': 'accounts.delete',
      'opportunities.create': 'opportunities.create',
      'opportunities.edit': 'opportunities.edit',
      'opportunities.delete': 'opportunities.delete',
      'quotations.create': 'quotations.create',
      'quotations.edit': 'quotations.edit',
      'quotations.delete': 'quotations.delete',
      'warehouses.create': 'warehouses.create',
      'warehouses.edit': 'warehouses.edit',
      'warehouses.delete': 'warehouses.delete',
      'users.create': 'users.create',
      'users.edit': 'users.edit',
      'users.delete': 'users.delete',
      'users.view': 'users.view',
      
      // Communication abilities (grant if user has users.manage)
      'sms.view': 'users.manage',
      'sms.send': 'users.manage',
      'sms.bulk_send': 'users.manage',
      'sms.history': 'users.manage',
      'email.view': 'users.manage',
      'email.send': 'users.manage',
      'email.bulk_send': 'users.manage',
      'email.history': 'users.manage',
      'templates.view': 'users.manage',
      'communication-logs.view': 'users.manage',
      
      // Tasks abilities
      'tasks.create': 'users.manage',
      'tasks.edit': 'users.manage',
      'tasks.delete': 'users.manage',
      'tasks.assign': 'users.manage',
      
      // Agents and commissions
      'agents.read': 'users.manage',
      'agents.create': 'users.manage',
      'agents.update': 'users.manage',
      'agents.delete': 'users.manage',
      'commissions.read': 'users.manage',
      'commissions.create': 'users.manage',
      'commissions.update': 'users.manage',
      'commissions.delete': 'users.manage',
      'commissions.view': 'users.manage',
      
      // Inventory abilities
      'stock.view': 'inventory.view',
      'stock.create': 'inventory.manage',
      'stock.edit': 'inventory.manage',
      'stock.delete': 'inventory.manage',
      'backorders.view': 'inventory.view',
      'backorders.create': 'inventory.manage',
      'backorders.edit': 'inventory.manage',
      'backorders.delete': 'inventory.manage',
      'price-lists.view': 'products.view',
      'price-lists.create': 'products.manage',
      'price-lists.edit': 'products.manage',
      'price-lists.delete': 'products.manage',
      
      // DRM abilities
      'distributor-leads.view': 'accounts.view',
      'distributor-leads.create': 'accounts.manage',
      'distributor-leads.edit': 'accounts.manage',
      'distributor-leads.delete': 'accounts.manage',
      'distributors.view': 'accounts.view',
      'distributors.create': 'accounts.manage',
      'distributors.edit': 'accounts.manage',
      'distributors.delete': 'accounts.manage',
      'routes-mapping.view': 'users.manage',
      'routes-mapping.create': 'users.manage',
      'routes-mapping.edit': 'users.manage',
      'routes-mapping.delete': 'users.manage',
      'engagement.view': 'users.manage',
      'engagement.create': 'users.manage',
      'engagement.edit': 'users.manage',
      'engagement.delete': 'users.manage',
      'drm-orders.view': 'accounts.view',
      
      // Sales abilities
      'orders.view': 'invoices.view',
      'proformas.view': 'quotations.view',
      'returns.view': 'invoices.view',
      'credit-notes.view': 'invoices.view',
      'credit-notes.create': 'invoices.manage',
      'credit-notes.edit': 'invoices.manage',
      'credit-notes.delete': 'invoices.manage',
      
      // Settings abilities
      'roles.view': 'roles.manage',
      'product-settings.view': 'settings.manage',
      'currency-settings.view': 'settings.manage',
      'business-settings.view': 'settings.manage',
      'google-maps.view': 'settings.manage',
      'google-maps.config': 'settings.manage',
      'credit-monitoring.view': 'settings.manage',
      'credit-monitoring.manage': 'settings.manage',
      'system-settings.view': 'settings.manage',
      'notifications.view': 'settings.manage',
      'notifications.create': 'settings.manage',
      'notifications.edit': 'settings.manage',
      'notifications.delete': 'settings.manage',
      'notifications.config': 'settings.manage',
      'ai-settings.view': 'settings.manage',
      'ai-settings.manage': 'settings.manage',
      
      // Additional settings abilities
      'notification-templates.view': 'settings.manage',
      'notification-templates.create': 'settings.manage',
      'notification-templates.edit': 'settings.manage',
      'notification-templates.delete': 'settings.manage',
      'task-templates.view': 'settings.manage',
      'task-templates.create': 'settings.manage',
      'task-templates.edit': 'settings.manage',
      'task-templates.delete': 'settings.manage',
      'lead-sources.view': 'settings.manage',
      'lead-sources.create': 'settings.manage',
      'lead-sources.edit': 'settings.manage',
      'lead-sources.delete': 'settings.manage',
      
      // Contact abilities
      'contacts.view': 'accounts.view',
      'contacts.create': 'accounts.manage',
      'contacts.edit': 'accounts.manage',
      'contacts.delete': 'accounts.manage'
    };

    Object.entries(abilityMappings).forEach(([expectedAbility, dbAbility]) => {
      if (abilities.includes(dbAbility) && !enhancedAbilities.includes(expectedAbility)) {
        enhancedAbilities.push(expectedAbility);
      }
    });
    
    console.log('🔍 Database abilities found:', abilities.length, 'abilities');
    console.log('🔍 Enhanced abilities count:', enhancedAbilities.length);
    console.log('🔍 Sample enhanced abilities:', enhancedAbilities.slice(0, 10));

    return NextResponse.json({
      success: true,
      abilities: enhancedAbilities,
      source: 'database-enhanced'
    });

  } catch (error) {
    console.error('Error fetching user abilities:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
