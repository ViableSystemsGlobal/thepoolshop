import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🔧 Fixing local development setup...');

  try {
    // Step 1: Create .env file for local development
    console.log('\n📝 Step 1: Creating .env file...');
    const envContent = `# Local development environment
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="adpools-secret-key-2024-local-dev"
`;
    
    writeFileSync('.env', envContent);
    console.log('✅ Created .env file with SQLite configuration');

    // Step 2: Update Prisma schema for local development
    console.log('\n🗄️  Step 2: Updating Prisma schema for SQLite...');
    const schemaPath = join('prisma', 'schema.prisma');
    let schemaContent = readFileSync(schemaPath, 'utf-8');
    
    // Replace PostgreSQL with SQLite
    schemaContent = schemaContent.replace(
      'provider = "postgresql"',
      'provider = "sqlite"'
    );
    
    writeFileSync(schemaPath, schemaContent);
    console.log('✅ Updated Prisma schema to use SQLite');

    console.log('\n🎉 Local development setup fixed!');
    console.log('\n📋 Next steps:');
    console.log('1. Stop your server (Ctrl+C)');
    console.log('2. Run: npx prisma generate');
    console.log('3. Run: npx prisma db push');
    console.log('4. Run: npx tsx scripts/nuclear-fix-everything.ts');
    console.log('5. Start server: PORT=3002 npm run dev');
    console.log('6. Login with admin@adpools.com / admin123');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

main();
