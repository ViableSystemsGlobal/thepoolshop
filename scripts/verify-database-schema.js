#!/usr/bin/env node

/**
 * Verify Database Schema Script
 * 
 * This script checks if all required columns and tables exist in the database.
 * Use this to verify that migrations have been applied correctly.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySchema() {
  console.log('🔍 Verifying Database Schema...\n');

  const checks = [];
  let hasErrors = false;

  try {
    // Check 1: Verify quotations table has priceListId
    console.log('📋 Checking quotations table...');
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'quotations' 
        AND column_name = 'priceListId'
      `;
      if (result.length > 0) {
        console.log('✅ quotations.priceListId exists');
        checks.push({ name: 'quotations.priceListId', status: '✅' });
      } else {
        console.log('❌ quotations.priceListId MISSING');
        checks.push({ name: 'quotations.priceListId', status: '❌' });
        hasErrors = true;
      }
    } catch (error) {
      console.log('❌ Error checking quotations.priceListId:', error.message);
      checks.push({ name: 'quotations.priceListId', status: '❌' });
      hasErrors = true;
    }

    // Check 2: Verify stock_movements table has supplierId
    console.log('📋 Checking stock_movements table...');
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'stock_movements' 
        AND column_name = 'supplierId'
      `;
      if (result.length > 0) {
        console.log('✅ stock_movements.supplierId exists');
        checks.push({ name: 'stock_movements.supplierId', status: '✅' });
      } else {
        console.log('❌ stock_movements.supplierId MISSING');
        checks.push({ name: 'stock_movements.supplierId', status: '❌' });
        hasErrors = true;
      }
    } catch (error) {
      console.log('❌ Error checking stock_movements.supplierId:', error.message);
      checks.push({ name: 'stock_movements.supplierId', status: '❌' });
      hasErrors = true;
    }

    // Check 3: Verify quotation_lines table has currency fields
    console.log('📋 Checking quotation_lines table...');
    const currencyFields = ['unitPriceCurrency', 'fxRateUsed', 'priceListIdUsed'];
    for (const field of currencyFields) {
      try {
        const result = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'quotation_lines' 
          AND column_name = ${field}
        `;
        if (result.length > 0) {
          console.log(`✅ quotation_lines.${field} exists`);
          checks.push({ name: `quotation_lines.${field}`, status: '✅' });
        } else {
          console.log(`❌ quotation_lines.${field} MISSING`);
          checks.push({ name: `quotation_lines.${field}`, status: '❌' });
          hasErrors = true;
        }
      } catch (error) {
        console.log(`❌ Error checking quotation_lines.${field}:`, error.message);
        checks.push({ name: `quotation_lines.${field}`, status: '❌' });
        hasErrors = true;
      }
    }

    // Check 4: Verify suppliers table exists
    console.log('📋 Checking suppliers table...');
    try {
      const result = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'suppliers'
      `;
      if (result.length > 0) {
        console.log('✅ suppliers table exists');
        checks.push({ name: 'suppliers table', status: '✅' });
      } else {
        console.log('❌ suppliers table MISSING');
        checks.push({ name: 'suppliers table', status: '❌' });
        hasErrors = true;
      }
    } catch (error) {
      console.log('❌ Error checking suppliers table:', error.message);
      checks.push({ name: 'suppliers table', status: '❌' });
      hasErrors = true;
    }

    // Summary
    console.log('\n📊 Verification Summary:');
    console.log('='.repeat(50));
    checks.forEach(check => {
      console.log(`${check.status} ${check.name}`);
    });
    console.log('='.repeat(50));

    if (hasErrors) {
      console.log('\n❌ Some required columns/tables are missing!');
      console.log('\n💡 Solution:');
      console.log('   1. Run migrations: npx prisma migrate deploy');
      console.log('   2. Verify migrations: npx prisma migrate status');
      console.log('   3. If migrations failed, resolve them:');
      console.log('      npx prisma migrate resolve --applied <migration-name>');
      console.log('   4. Run this verification script again');
      process.exit(1);
    } else {
      console.log('\n✅ All required columns and tables exist!');
      console.log('   Database schema is up to date.');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Error verifying schema:', error);
    console.error('\n💡 Make sure:');
    console.error('   1. DATABASE_URL is set correctly');
    console.error('   2. Database connection is working');
    console.error('   3. Prisma Client is generated: npx prisma generate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifySchema();

