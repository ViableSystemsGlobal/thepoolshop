#!/usr/bin/env node

/**
 * Complete Deployment Script
 * 
 * This script automates the entire deployment process based on all
 * challenges encountered during production deployment.
 * 
 * Usage: node scripts/deploy-complete.js
 */

const { execSync } = require('child_process');

async function deploy() {
  console.log('🚀 Starting Complete Deployment Process...\n');
  console.log('📋 This script will:');
  console.log('  1. Pull latest code');
  console.log('  2. Install dependencies');
  console.log('  3. Generate Prisma Client');
  console.log('  4. Run database migrations');
  console.log('  5. Restore roles and abilities');
  console.log('  6. Build application');
  console.log('  7. Verify deployment\n');

  try {
    // Step 1: Pull latest code
    console.log('📥 Step 1/7: Pulling latest code...');
    try {
      execSync('git pull origin main', { stdio: 'inherit' });
      console.log('✅ Code pulled successfully\n');
    } catch (error) {
      console.error('⚠️  Warning: Could not pull code (may not be a git repo)');
      console.log('   Continuing with deployment...\n');
    }

    // Step 2: Install dependencies
    console.log('📦 Step 2/7: Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed\n');
    } catch (error) {
      console.error('❌ Error installing dependencies:', error.message);
      throw error;
    }

    // Step 3: Generate Prisma Client
    console.log('🔧 Step 3/7: Generating Prisma Client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma Client generated\n');
    } catch (error) {
      console.error('❌ Error generating Prisma Client:', error.message);
      console.error('💡 Make sure DATABASE_URL is set correctly');
      throw error;
    }

    // Step 4: Run migrations
    console.log('🗄️  Step 4/7: Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations applied successfully\n');
    } catch (error) {
      console.error('❌ Error running migrations:', error.message);
      console.error('\n💡 If migrations failed, you may need to:');
      console.error('   1. Check migration status: npx prisma migrate status');
      console.error('   2. Resolve failed migrations: npx prisma migrate resolve --applied <migration-name>');
      console.error('   3. Run migrations again: npx prisma migrate deploy');
      throw error;
    }

    // Step 5: Restore roles and abilities
    console.log('🔐 Step 5/7: Restoring roles and abilities...');
    try {
      execSync('node scripts/restore-roles-and-abilities.js', { stdio: 'inherit' });
      console.log('✅ Roles and abilities restored\n');
    } catch (error) {
      console.error('⚠️  Warning: Could not restore roles and abilities:', error.message);
      console.error('   Please run manually: node scripts/restore-roles-and-abilities.js');
      console.log('   Continuing with deployment...\n');
    }

    // Step 6: Build application
    console.log('🏗️  Step 6/7: Building application...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Application built successfully\n');
    } catch (error) {
      console.error('❌ Error building application:', error.message);
      throw error;
    }

    // Step 7: Verification
    console.log('✅ Step 7/7: Deployment completed!\n');
    
    console.log('📋 Next Steps:');
    console.log('  1. Restart your application:');
    console.log('     pm2 restart all');
    console.log('     # Or restart through Easy Panel dashboard');
    console.log('');
    console.log('  2. Test your application:');
    console.log('     - Login with admin@adpools.com / admin123');
    console.log('     - Verify dashboard loads');
    console.log('     - Test quotations creation');
    console.log('     - Test supplier creation');
    console.log('     - Test stock movement creation');
    console.log('     - Verify Super Admin can access all settings');
    console.log('');
    console.log('  3. Check application logs:');
    console.log('     pm2 logs');
    console.log('     # Or check Easy Panel logs');
    console.log('');
    console.log('🎉 Deployment completed successfully!');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check application logs for details');
    console.error('  2. Verify environment variables are set');
    console.error('  3. Check database connection');
    console.error('  4. Review the comprehensive deployment guide:');
    console.error('     docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md');
    console.error('\n📚 For detailed solutions, see:');
    console.error('   docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md');
    process.exit(1);
  }
}

// Run deployment
deploy();

