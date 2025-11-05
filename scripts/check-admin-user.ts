import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin user...\n');

    // Check by email
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@adpools.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (adminUser) {
      console.log('✅ Admin user found!');
      console.log('📋 User details:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name || 'N/A'}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
      console.log(`   Has Password: ${adminUser.password ? 'Yes (length: ' + adminUser.password.length + ')' : 'No ❌'}`);
      console.log(`   Created: ${adminUser.createdAt}`);
      console.log(`   Updated: ${adminUser.updatedAt}`);
      
      if (!adminUser.password) {
        console.log('\n⚠️  WARNING: Admin user has no password set!');
      } else if (adminUser.password.length < 50) {
        console.log('\n⚠️  WARNING: Password appears to be plain text or incorrectly hashed!');
      }
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('\n📋 Checking for any users in the database...');
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          password: true,
        },
        take: 10,
      });

      if (allUsers.length === 0) {
        console.log('❌ No users found in the database!');
        console.log('\n💡 You may need to run database migrations or seed the database.');
      } else {
        console.log(`\n✅ Found ${allUsers.length} user(s):`);
        allUsers.forEach((user, index) => {
          console.log(`\n   User ${index + 1}:`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Name: ${user.name || 'N/A'}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Active: ${user.isActive}`);
          console.log(`   Has Password: ${user.password ? 'Yes' : 'No ❌'}`);
        });
      }
    }

    // Check total user count
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();

