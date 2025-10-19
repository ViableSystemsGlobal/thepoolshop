#!/usr/bin/env tsx

/**
 * Permission Validation Script
 * 
 * This script validates that all permissions are consistent across the system.
 * Run this script whenever you make changes to permissions to ensure everything is in sync.
 */

import { validatePermissions, ABILITIES, MODULE_ACCESS, ROLE_ABILITIES } from '../src/lib/permissions';

console.log('🔍 Validating permissions system...\n');

// Validate permissions consistency
const validation = validatePermissions();

if (validation.isValid) {
  console.log('✅ All permissions are valid!');
} else {
  console.log('❌ Permission validation failed:');
  validation.errors.forEach(error => {
    console.log(`  - ${error}`);
  });
  process.exit(1);
}

// Additional checks
console.log('\n📊 Permission Statistics:');
console.log(`  - Total abilities defined: ${Object.keys(ABILITIES).length}`);
console.log(`  - Total modules defined: ${Object.keys(MODULE_ACCESS).length}`);
console.log(`  - Total roles defined: ${Object.keys(ROLE_ABILITIES).length}`);

// Check for unused abilities
const allUsedAbilities = new Set<string>();
Object.values(MODULE_ACCESS).forEach(abilities => {
  abilities.forEach(ability => allUsedAbilities.add(ability));
});
Object.values(ROLE_ABILITIES).forEach(abilities => {
  abilities.forEach(ability => allUsedAbilities.add(ability));
});

const allDefinedAbilities = new Set(Object.keys(ABILITIES));
const unusedAbilities = [...allDefinedAbilities].filter(ability => !allUsedAbilities.has(ability));

if (unusedAbilities.length > 0) {
  console.log(`\n⚠️  Unused abilities (${unusedAbilities.length}):`);
  unusedAbilities.forEach(ability => {
    console.log(`  - ${ability}: ${ABILITIES[ability as keyof typeof ABILITIES]}`);
  });
} else {
  console.log('\n✅ All abilities are being used');
}

// Check for undefined abilities
const undefinedAbilities = [...allUsedAbilities].filter(ability => !allDefinedAbilities.has(ability));
if (undefinedAbilities.length > 0) {
  console.log(`\n❌ Undefined abilities being used (${undefinedAbilities.length}):`);
  undefinedAbilities.forEach(ability => {
    console.log(`  - ${ability}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ All used abilities are properly defined');
}

console.log('\n🎉 Permission system validation completed successfully!');
