import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// This script prepares your application for PostgreSQL migration
// Run this before deploying to Hostinger

async function preparePostgresMigration() {
  try {
    console.log('🔄 Preparing PostgreSQL migration...');
    
    // 1. Update Prisma schema for PostgreSQL
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    let schema = readFileSync(schemaPath, 'utf8');
    
    // Change provider from sqlite to postgresql
    schema = schema.replace(
      'provider = "sqlite"',
      'provider = "postgresql"'
    );
    
    writeFileSync(schemaPath, schema);
    console.log('✅ Updated Prisma schema for PostgreSQL');
    
    // 2. Generate new Prisma client
    console.log('🔄 Generating Prisma client...');
    // This will be run manually: npx prisma generate
    
    // 3. Create migration
    console.log('🔄 Creating migration...');
    // This will be run manually: npx prisma migrate dev --name init
    
    console.log('✅ PostgreSQL migration preparation completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Set up PostgreSQL database on Hostinger');
    console.log('2. Update DATABASE_URL in environment variables');
    console.log('3. Run: npx prisma generate');
    console.log('4. Run: npx prisma migrate deploy');
    console.log('5. Run: npx prisma db seed');
    
  } catch (error) {
    console.error('❌ Migration preparation failed:', error);
  }
}

preparePostgresMigration();
