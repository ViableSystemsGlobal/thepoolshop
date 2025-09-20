import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export interface Ability {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UserAbilities {
  abilities: string[];
  hasAbility: (resource: string, action: string) => boolean;
  canAccess: (module: string) => boolean;
}

// Define module access mappings
const MODULE_ACCESS = {
  'dashboard': ['dashboard.view'],
  'products': ['products.view', 'products.create', 'products.edit', 'products.delete'],
  'inventory': ['inventory.view', 'stock.view', 'stock.create', 'stock.edit', 'stock.delete'],
  'warehouses': ['warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete'],
  'price-lists': ['price-lists.view', 'price-lists.create', 'price-lists.edit', 'price-lists.delete'],
  'crm': ['leads.read', 'accounts.read', 'opportunities.read'],
  'leads': ['leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update'],
  'accounts': ['accounts.read', 'accounts.create', 'accounts.update', 'accounts.delete', 'accounts.bulk-delete', 'accounts.bulk-export'],
  'opportunities': ['opportunities.read', 'opportunities.create', 'opportunities.update', 'opportunities.delete'],
  'backorders': ['backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete'],
  'settings': ['settings.view', 'users.view', 'roles.view'],
  'users': ['users.view', 'users.create', 'users.edit', 'users.delete'],
  'roles': ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
  // Missing modules
  'drm': ['drm.view'],
  'distributors': ['distributors.view'],
  'agreements': ['agreements.view'],
  'drm-orders': ['drm-orders.view'],
  'sales': ['sales.view'],
  'orders': ['orders.view'],
  'proformas': ['proformas.view'],
  'invoices': ['invoices.view'],
  'payments': ['payments.view'],
  'returns': ['returns.view'],
  'communication': ['communication.view'],
  'sms': ['sms.view', 'sms.send', 'sms.bulk_send'],
  'sms-history': ['sms.view', 'sms.history'],
  'email': ['email.view', 'email.send', 'email.bulk_send'],
  'email-history': ['email.view', 'email.history'],
  'tasks': ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign'],
  'my-tasks': ['tasks.view', 'tasks.edit'],
  'task_templates': ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete'],
  'recurring-tasks': ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign'],
  'templates': ['templates.view'],
  'communication-logs': ['communication-logs.view'],
  'agents': ['agents.view'],
  'commissions': ['commissions.view'],
  'reports': ['reports.view'],
  'quotations': ['quotations.view'],
  'contacts': ['contacts.view'],
  'product-settings': ['product-settings.view'],
  'currency-settings': ['currency-settings.view'],
  'business-settings': ['business-settings.view'],
  'system-settings': ['system-settings.view'],
  'notifications': ['notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.config'],
};

// Role-based ability definitions
const ROLE_ABILITIES: { [key: string]: string[] } = {
  'SUPER_ADMIN': [
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
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
    'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
    'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
    'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
    // Backorders
    'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
    // DRM
    'drm.view', 'distributors.view', 'agreements.view', 'drm-orders.view',
    // Sales
    'sales.view', 'orders.view', 'proformas.view', 'invoices.view', 'payments.view', 'returns.view',
    // Communication
    'communication.view', 'templates.view', 'communication-logs.view',
    'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
    'email.view', 'email.send', 'email.bulk_send', 'email.history',
    // Tasks - Full access
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    // Task Templates - Full access
    'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
    // Task Categories - Full access
    'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
    // Recurring Tasks - Full access
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
    // Agents
    'agents.view', 'commissions.view',
    // Reports
    'reports.view',
    // Settings - Full access
    'settings.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'product-settings.view', 'currency-settings.view', 'business-settings.view', 'system-settings.view',
    'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.config',
  ],
  'ADMIN': [
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
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
    'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
    'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
    'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete',
    // Backorders
    'backorders.view', 'backorders.create', 'backorders.edit', 'backorders.delete',
    // DRM
    'drm.view', 'distributors.view', 'agreements.view', 'drm-orders.view',
    // Sales
    'sales.view', 'orders.view', 'proformas.view', 'invoices.view', 'payments.view', 'returns.view',
    // Communication
    'communication.view', 'templates.view', 'communication-logs.view',
    'sms.view', 'sms.send', 'sms.bulk_send', 'sms.history',
    'email.view', 'email.send', 'email.bulk_send', 'email.history',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    // Task Templates - Full access
    'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
    // Task Categories - Full access
    'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
    // Recurring Tasks - Full access
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
    // Agents
    'agents.view', 'commissions.view',
    // Reports
    'reports.view',
    // Settings
    'settings.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
           'product-settings.view', 'currency-settings.view', 'business-settings.view', 'system-settings.view',
           'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.config',
  ],
  'SALES_MANAGER': [
    'dashboard.view',
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'stock.view',
    'warehouses.view',
    'price-lists.view', 'price-lists.create', 'price-lists.edit',
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.bulk-delete', 'leads.bulk-export', 'leads.bulk-update',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',
    'opportunities.view', 'opportunities.create', 'opportunities.edit', 'opportunities.delete',
    'backorders.view', 'backorders.create', 'backorders.edit',
    // Tasks
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    // Task Templates
    'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
    // Task Categories
    'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
    // Recurring Tasks
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
  ],
  'SALES_REP': [
    'dashboard.view',
    'products.view',
    'inventory.view', 'stock.view',
    'warehouses.view',
    'price-lists.view',
    'leads.view', 'leads.create', 'leads.edit',
    'accounts.view', 'accounts.create', 'accounts.edit',
    'opportunities.view', 'opportunities.create', 'opportunities.edit',
    'backorders.view', 'backorders.create',
    // Tasks
    'tasks.view', 'tasks.create', 'tasks.edit',
    // Task Templates
    'task-templates.view', 'task-templates.create', 'task-templates.edit',
    // Task Categories
    'task-categories.view', 'task-categories.create', 'task-categories.edit',
    // Recurring Tasks
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit',
  ],
  'INVENTORY_MANAGER': [
    'dashboard.view',
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
    'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
    'price-lists.view',
    'backorders.view', 'backorders.create', 'backorders.edit',
    // Tasks
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    // Task Templates
    'task-templates.view', 'task-templates.create', 'task-templates.edit', 'task-templates.delete',
    // Task Categories
    'task-categories.view', 'task-categories.create', 'task-categories.edit', 'task-categories.delete',
    // Recurring Tasks
    'recurring-tasks.view', 'recurring-tasks.create', 'recurring-tasks.edit', 'recurring-tasks.delete', 'recurring-tasks.generate',
  ],
  'FINANCE_OFFICER': [
    'dashboard.view',
    'products.view',
    'inventory.view', 'stock.view',
    'warehouses.view',
    'price-lists.view', 'price-lists.create', 'price-lists.edit',
    'accounts.view', 'accounts.create', 'accounts.edit',
    'opportunities.view',
    // Tasks
    'tasks.view', 'tasks.edit',
    // Task Templates
    'task-templates.view', 'task-templates.edit',
    // Task Categories
    'task-categories.view', 'task-categories.edit',
    // Recurring Tasks
    'recurring-tasks.view', 'recurring-tasks.edit',
  ],
  'EXECUTIVE_VIEWER': [
    'dashboard.view',
    'products.view',
    'inventory.view', 'stock.view',
    'warehouses.view',
    'price-lists.view',
    'leads.view',
    'accounts.view',
    'opportunities.view',
    'backorders.view',
    // Tasks
    'tasks.view',
    // Task Templates
    'task-templates.view',
    // Task Categories
    'task-categories.view',
    // Recurring Tasks
    'recurring-tasks.view',
  ],
};

export function useAbilities(): UserAbilities {
  const { data: session } = useSession();
  const [abilities, setAbilities] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.role) {
      const userRole = session.user.role as string;
      const userAbilities = ROLE_ABILITIES[userRole] || [];
      setAbilities(userAbilities);
    }
  }, [session]);

  const hasAbility = (resource: string, action: string): boolean => {
    const ability = `${resource}.${action}`;
    return abilities.includes(ability);
  };

  const canAccess = (module: string): boolean => {
    const moduleAbilities = MODULE_ACCESS[module as keyof typeof MODULE_ACCESS] || [];
    return moduleAbilities.some(ability => abilities.includes(ability));
  };

  return {
    abilities,
    hasAbility,
    canAccess,
  };
}
