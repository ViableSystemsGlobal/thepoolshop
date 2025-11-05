#!/usr/bin/env node

/**
 * Reset Database Script
 * 
 * This script will:
 * 1. Drop all tables in the database
 * 2. Run all migrations from scratch
 * 3. Create the admin user
 * 
 * WARNING: This will delete ALL data in your database!
 * Only use this if you're okay losing all existing data.
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data in your database!');
  console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');
  
  // Wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log('🔄 Starting database reset...\n');
    
    // Step 1: Reset the database (drop all tables)
    console.log('📋 Step 1: Resetting database (dropping all tables)...');
    try {
      execSync('npx prisma migrate reset --force --skip-seed', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Database reset complete\n');
    } catch (error) {
      console.error('❌ Error resetting database:', error.message);
      // Try alternative method
      console.log('🔄 Trying alternative method...');
      try {
        execSync('npx prisma db push --force-reset --accept-data-loss', {
          stdio: 'inherit',
          env: { ...process.env }
        });
        console.log('✅ Database reset using db push\n');
      } catch (error2) {
        console.error('❌ Alternative method also failed:', error2.message);
        throw error2;
      }
    }
    
    // Step 2: Run all migrations
    console.log('📋 Step 2: Running all migrations...');
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ All migrations applied\n');
    } catch (error) {
      console.error('❌ Error running migrations:', error.message);
      throw error;
    }
    
    // Step 3: Generate Prisma Client
    console.log('📋 Step 3: Generating Prisma Client...');
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
    
    // Step 4: Create admin user
    console.log('📋 Step 4: Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@adpools.com' },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      create: {
        email: 'admin@adpools.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    
    console.log('✅ Admin user created/updated:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${adminUser.role}\n`);
    
    console.log('🎉 Database reset complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Login with admin@adpools.com / admin123');
    console.log('3. Start creating your data!');
    
  } catch (error) {
    console.error('\n❌ Database reset failed:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure DATABASE_URL is set correctly');
    console.error('2. Make sure you have database connection permissions');
    console.error('3. Check that your database server is running');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase();

