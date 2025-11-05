#!/usr/bin/env node

/**
 * Fix Missing Supplier ID Column
 * 
 * This script manually adds the supplierId column to stock_movements table
 * if it doesn't exist. Use this when migrations fail.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingSupplierId() {
  console.log('🔧 Fixing missing supplierId column...\n');

  try {
    // Check if column exists
    console.log('📋 Checking if supplierId column exists...');
    const checkResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'stock_movements' 
      AND column_name = 'supplierId'
    `;

    if (checkResult.length > 0) {
      console.log('✅ supplierId column already exists!');
      console.log('   No action needed.');
      return;
    }

    console.log('❌ supplierId column missing. Adding it now...\n');

    // Add the column
    console.log('📋 Step 1: Adding supplierId column...');
    await prisma.$executeRaw`
      ALTER TABLE "stock_movements" 
      ADD COLUMN IF NOT EXISTS "supplierId" TEXT
    `;
    console.log('✅ supplierId column added\n');

    // Check if suppliers table exists before adding foreign key
    console.log('📋 Step 2: Checking if suppliers table exists...');
    const suppliersCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'suppliers'
    `;

    if (suppliersCheck.length > 0) {
      console.log('✅ suppliers table exists. Adding foreign key...');
      
      // Check if foreign key already exists
      const fkCheck = await prisma.$queryRaw`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'stock_movements' 
        AND constraint_name = 'stock_movements_supplierId_fkey'
      `;

      if (fkCheck.length === 0) {
        await prisma.$executeRaw`
          ALTER TABLE "stock_movements" 
          ADD CONSTRAINT "stock_movements_supplierId_fkey" 
          FOREIGN KEY ("supplierId") 
          REFERENCES "suppliers"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE
        `;
        console.log('✅ Foreign key constraint added\n');
      } else {
        console.log('✅ Foreign key constraint already exists\n');
      }
    } else {
      console.log('⚠️  suppliers table does not exist. Skipping foreign key.\n');
    }

    // Verify the column was added
    console.log('📋 Step 3: Verifying column was added...');
    const verifyResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'stock_movements' 
      AND column_name = 'supplierId'
    `;

    if (verifyResult.length > 0) {
      console.log('✅ supplierId column verified successfully!\n');
      console.log('🎉 Fix completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Regenerate Prisma Client: npx prisma generate');
      console.log('   2. Restart your application: pm2 restart all');
      console.log('   3. Try creating a stock movement again');
    } else {
      console.log('❌ Column was not added. Please check database permissions.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error fixing supplierId column:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check database connection');
    console.error('   2. Verify DATABASE_URL is set correctly');
    console.error('   3. Check database user has ALTER TABLE permissions');
    console.error('   4. Try running the migration manually:');
    console.error('      psql $DATABASE_URL -c "ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS supplierId TEXT;"');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingSupplierId();

