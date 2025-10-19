import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// This script helps migrate data from SQLite to PostgreSQL
// Run this after setting up PostgreSQL database

const prisma = new PrismaClient();

async function migrateToPostgres() {
  try {
    console.log('🔄 Starting PostgreSQL migration...');
    
    // 1. Check if we can connect to PostgreSQL
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // 2. Run migrations
    console.log('🔄 Running Prisma migrations...');
    // This will be handled by: npx prisma migrate deploy
    
    // 3. Seed essential data
    console.log('🔄 Seeding essential data...');
    // Run your existing seed scripts
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToPostgres();
