# Permissions System Migration Guide

## Overview

This guide explains the new centralized permissions system and how to migrate from the old system.

## What Changed

### Before (Problems)
- ❌ Permissions defined in multiple places (useAbilities hook, API route, sidebar)
- ❌ Inconsistent ability names (`agents.read` vs `agents.view`)
- ❌ Hard to maintain and prone to errors
- ❌ No validation or consistency checks

### After (Solutions)
- ✅ Single source of truth in `src/lib/permissions.ts`
- ✅ Consistent ability naming across the system
- ✅ Type-safe with TypeScript
- ✅ Built-in validation and consistency checks
- ✅ Easy to maintain and extend

## New File Structure

```
src/lib/permissions.ts          # Centralized permissions configuration
src/hooks/use-abilities-new.ts  # Updated hook using centralized config
src/app/api/user/abilities-new/ # Updated API route using centralized config
scripts/validate-permissions.ts # Validation script
```

## Key Components

### 1. Centralized Configuration (`src/lib/permissions.ts`)

```typescript
// All abilities defined once
export const ABILITIES = {
  'agents.view': 'View agents',
  'agents.create': 'Create agents',
  // ... more abilities
} as const;

// Module access mappings
export const MODULE_ACCESS = {
  'agents': ['agents.view'],
  // ... more modules
} as const;

// Role-based abilities
export const ROLE_ABILITIES = {
  'SUPER_ADMIN': ['agents.view', 'agents.create', ...],
  // ... more roles
} as const;
```

### 2. Type Safety

```typescript
export type Ability = keyof typeof ABILITIES;
export type Module = keyof typeof MODULE_ACCESS;
export type Role = keyof typeof ROLE_ABILITIES;
```

### 3. Utility Functions

```typescript
export function canAccessModule(userAbilities: Ability[], module: Module): boolean
export function hasAbility(userAbilities: Ability[], ability: Ability): boolean
export function getAbilitiesForRole(role: Role): Ability[]
```

## Migration Steps

### Step 1: Update Imports

Replace old imports:
```typescript
// OLD
import { useAbilities } from '@/hooks/use-abilities';

// NEW
import { useAbilities } from '@/hooks/use-abilities-new';
```

### Step 2: Update API Routes

Replace old API route:
```typescript
// OLD
import { ROLE_ABILITIES } from './old-route';

// NEW
import { ROLE_ABILITIES } from '@/lib/permissions';
```

### Step 3: Validate Permissions

Run the validation script:
```bash
npx tsx scripts/validate-permissions.ts
```

## Adding New Permissions

### 1. Add to ABILITIES
```typescript
export const ABILITIES = {
  // ... existing abilities
  'new-feature.view': 'View new feature',
  'new-feature.create': 'Create new feature',
} as const;
```

### 2. Add to MODULE_ACCESS
```typescript
export const MODULE_ACCESS = {
  // ... existing modules
  'new-feature': ['new-feature.view'],
} as const;
```

### 3. Add to ROLE_ABILITIES
```typescript
export const ROLE_ABILITIES = {
  'SUPER_ADMIN': [
    // ... existing abilities
    'new-feature.view',
    'new-feature.create',
  ],
} as const;
```

### 4. Validate
```bash
npx tsx scripts/validate-permissions.ts
```

## Best Practices

### 1. Naming Conventions
- Use consistent naming: `resource.action`
- Examples: `agents.view`, `invoices.create`, `users.delete`

### 2. Module Access
- Keep module access simple - only require the minimum ability needed
- Example: `'agents': ['agents.view']` (not `['agents.view', 'agents.create', 'agents.edit']`)

### 3. Role Abilities
- Be generous with role abilities - include all abilities the role should have
- Example: SUPER_ADMIN gets `['agents.view', 'agents.create', 'agents.edit', 'agents.delete']`

### 4. Validation
- Always run validation after making changes
- Fix any errors before deploying

## Troubleshooting

### Common Issues

1. **Module not showing in sidebar**
   - Check if module is in MODULE_ACCESS
   - Check if user role has required abilities
   - Run validation script

2. **Permission denied errors**
   - Check if ability exists in ABILITIES
   - Check if user role has the ability
   - Check if module access mapping is correct

3. **TypeScript errors**
   - Ensure all abilities are properly typed
   - Use the provided type definitions
   - Run validation script

### Debug Commands

```bash
# Validate permissions
npx tsx scripts/validate-permissions.ts

# Check for unused abilities
npx tsx scripts/validate-permissions.ts | grep "Unused abilities"

# Check for undefined abilities
npx tsx scripts/validate-permissions.ts | grep "Undefined abilities"
```

## Benefits

1. **Consistency**: All permissions defined in one place
2. **Type Safety**: TypeScript prevents typos and errors
3. **Validation**: Built-in checks ensure consistency
4. **Maintainability**: Easy to add/modify permissions
5. **Documentation**: Self-documenting with descriptions
6. **Performance**: No duplicate definitions or lookups

## Future Enhancements

1. **Database Integration**: Store permissions in database
2. **Dynamic Permissions**: Runtime permission changes
3. **Permission Inheritance**: Role hierarchy support
4. **Audit Logging**: Track permission changes
5. **UI Management**: Admin interface for permissions
