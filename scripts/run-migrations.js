#!/usr/bin/env node

/**
 * Run Migrations Script
 * 
 * This script will:
 * 1. Generate Prisma Client
 * 2. Run pending migrations
 * 
 * This is safer than reset - it only applies missing migrations
 * without deleting existing data.
 */

const { execSync } = require('child_process');

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');
  
  try {
    // Step 1: Generate Prisma Client
    console.log('📋 Step 1: Generating Prisma Client...');
    try {
      execSync('npx prisma generate', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Prisma Client generated\n');
    } catch (error) {
      console.error('❌ Error generating Prisma Client:', error.message);
      throw error;
    }
    
    // Step 2: Run migrations
    console.log('📋 Step 2: Running pending migrations...');
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ All migrations applied\n');
    } catch (error) {
      console.error('❌ Error running migrations:', error.message);
      console.error('\n💡 If migrations fail, you might need to reset the database.');
      console.error('   Run: node scripts/reset-database.js');
      throw error;
    }
    
    console.log('🎉 Migrations complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Test your application');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();

