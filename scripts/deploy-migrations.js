#!/usr/bin/env node

/**
 * Deployment script to run Prisma migrations
 * Run with: node scripts/deploy-migrations.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting deployment migrations...\n');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Step 1/3: Generating Prisma Client...');
  execSync('node ./node_modules/prisma/build/index.js generate', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Prisma Client generated successfully!\n');

  // Step 2: Deploy migrations
  console.log('🔄 Step 2/3: Deploying database migrations...');
  execSync('node ./node_modules/prisma/build/index.js migrate deploy', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Migrations deployed successfully!\n');

  // Step 3: Complete setup (includes seeding + permissions)
  console.log('🌱 Step 3/3: Running complete database setup...');
  execSync('node ./node_modules/tsx/dist/cli.mjs scripts/complete-setup.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Complete database setup finished!\n');

  console.log('🎉 Deployment completed successfully!');
  console.log('\nYou can now login with:');
  console.log('  Email: admin@adpools.com');
  console.log('  Password: admin123');
  console.log('\n⚠️  Remember to change the admin password after first login!\n');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

