# System Abilities Updater

This document explains how to update the system abilities when new features are built.

## Current System Status

- **Total Abilities**: 100 abilities across 22 resource types
- **Resources Covered**: users, roles, products, inventory, stock-movements, warehouses, categories, units, price-lists, leads, accounts, opportunities, quotations, backorders, currencies, files, settings, audit, notifications, dashboard, reports, system
- **Role Definitions**: 6 system roles with appropriate ability assignments

## How to Update Abilities

### 1. Add New Abilities

When adding new features, update the `SYSTEM_ABILITIES` array in `scripts/update-system-abilities.ts`:

```typescript
const SYSTEM_ABILITIES = [
  // Existing abilities...
  
  // New feature abilities
  { name: 'new-feature.create', resource: 'new-feature', action: 'create', description: 'Create new feature items' },
  { name: 'new-feature.read', resource: 'new-feature', action: 'read', description: 'View new feature information' },
  { name: 'new-feature.update', resource: 'new-feature', action: 'update', description: 'Update new feature details' },
  { name: 'new-feature.delete', resource: 'new-feature', action: 'delete', description: 'Delete new feature items' },
];
```

### 2. Update Role Definitions

Add the new abilities to appropriate roles in the `ROLE_DEFINITIONS` object:

```typescript
const ROLE_DEFINITIONS = {
  'Administrator': {
    description: 'Full system access with all permissions',
    abilities: SYSTEM_ABILITIES.map(ability => ability.name) // Automatically includes new abilities
  },
  'Sales Manager': {
    description: 'Manages sales team and processes',
    abilities: [
      // Existing abilities...
      'new-feature.read', // Add relevant abilities
      'new-feature.update',
    ]
  },
  // Update other roles as needed...
};
```

### 3. Run the Update Script

```bash
npx tsx scripts/update-system-abilities.ts
```

This will:
- Add new abilities to the database
- Update existing abilities if they've changed
- Update role assignments based on new definitions
- Report on unused abilities that can be removed

## Ability Naming Convention

Follow this pattern for consistency:
- **Format**: `{resource}.{action}`
- **Resource**: Lowercase, descriptive (e.g., `products`, `stock-movements`, `price-lists`)
- **Action**: Standard actions include:
  - `create` - Create new items
  - `read` - View/list items
  - `update` - Modify existing items
  - `delete` - Remove items
  - `manage` - Full control (create, read, update, delete)
  - `bulk-{action}` - Bulk operations (e.g., `bulk-delete`, `bulk-export`)
  - Specific actions for complex features (e.g., `generate-grn`, `reverse`, `convert`)

## Resource Categories

Current resources are organized by business function:

### Core Business
- `products` - Product catalog management
- `inventory` - Stock levels and overview
- `stock-movements` - Stock transactions
- `warehouses` - Storage locations
- `categories` - Product categorization
- `units` - Measurement units

### Sales & CRM
- `leads` - Lead management
- `accounts` - Customer accounts
- `opportunities` - Sales opportunities
- `quotations` - Price quotations
- `backorders` - Backorder management
- `price-lists` - Pricing management

### System Administration
- `users` - User management
- `roles` - Role and permission management
- `settings` - System configuration
- `audit` - Audit logging
- `notifications` - Notification system
- `system` - System administration

### Support
- `files` - File management
- `currencies` - Currency handling
- `dashboard` - Dashboard access
- `reports` - Reporting system

## Role Hierarchy

### Administrator
- **Abilities**: All 100+ abilities
- **Purpose**: Full system control
- **Users**: System administrators only

### Sales Manager
- **Abilities**: 40 abilities
- **Focus**: Sales team management, CRM, pricing
- **Includes**: Lead/account/opportunity management, team oversight

### Sales Representative
- **Abilities**: 23 abilities
- **Focus**: Customer interactions, basic sales operations
- **Includes**: Lead/account creation, quotation management

### Inventory Manager
- **Abilities**: 44 abilities
- **Focus**: Product and stock management
- **Includes**: Full product/inventory control, warehouse management

### Finance Officer
- **Abilities**: 22 abilities
- **Focus**: Financial operations and reporting
- **Includes**: Quotation approval, financial reports, currency management

### Executive Viewer
- **Abilities**: 20 abilities
- **Focus**: Read-only business intelligence
- **Includes**: All read permissions, comprehensive reporting

## Best Practices

1. **Principle of Least Privilege**: Give users only the abilities they need
2. **Consistent Naming**: Follow the established naming convention
3. **Descriptive Descriptions**: Write clear descriptions for each ability
4. **Role Alignment**: Ensure abilities align with business roles
5. **Regular Review**: Periodically review and clean up unused abilities

## Future Enhancements

When building new features, consider:

1. **API Endpoints**: Each new API endpoint should have corresponding abilities
2. **UI Components**: Protected UI elements should check relevant abilities
3. **Bulk Operations**: Include bulk action abilities for efficiency
4. **File Operations**: Add file upload/download abilities for document management
5. **Reporting**: Create specific report abilities for different data views

## Monitoring and Maintenance

- **Audit Logs**: All ability changes are logged
- **Unused Abilities**: Script reports unused abilities for cleanup
- **Role Usage**: Monitor which roles are actually used
- **Permission Errors**: Track failed permission checks for optimization
