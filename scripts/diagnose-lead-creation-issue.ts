import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Diagnosing lead creation issue...');

  try {
    const problematicUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    
    // Step 1: Check if the user exists
    console.log('\n📊 Step 1: Checking if user exists...');
    const user = await prisma.user.findUnique({
      where: { id: problematicUserId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (user) {
      console.log(`✅ User found:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Active: ${user.isActive}`);
      console.log(`- Role assignments: ${user.userRoles.length}`);
    } else {
      console.log(`❌ User with ID ${problematicUserId} NOT FOUND`);
      
      // Check what users do exist
      console.log('\n📋 Available users:');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, isActive: true }
      });
      
      allUsers.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Active: ${u.isActive}`);
      });
      
      // Create the missing user
      console.log('\n🔧 Creating missing user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          id: problematicUserId,
          email: 'admin@adpools.com',
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      
      console.log(`✅ Created user: ${newUser.id}`);
    }

    // Step 2: Check the Lead model structure
    console.log('\n📊 Step 2: Checking Lead model...');
    try {
      const leadCount = await prisma.lead.count();
      console.log(`✅ Lead model accessible, current count: ${leadCount}`);
    } catch (error) {
      console.log(`❌ Lead model error:`, error.message);
    }

    // Step 3: Check foreign key constraints
    console.log('\n📊 Step 3: Testing foreign key constraint...');
    try {
      // Try to create a test lead with the problematic user ID
      const testLead = await prisma.lead.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '1234567890',
          source: 'test',
          status: 'NEW',
          ownerId: problematicUserId,
        }
      });
      
      console.log(`✅ Test lead created successfully with ID: ${testLead.id}`);
      
      // Clean up the test lead
      await prisma.lead.delete({
        where: { id: testLead.id }
      });
      console.log(`✅ Test lead cleaned up`);
      
    } catch (error) {
      console.log(`❌ Foreign key constraint test failed:`, error.message);
      
      if (error.code === 'P2003') {
        console.log('🔍 P2003 error means the foreign key constraint is violated');
        console.log('This means the ownerId does not exist in the users table');
        
        // Double-check the user exists
        const userCheck = await prisma.user.findUnique({
          where: { id: problematicUserId }
        });
        
        if (!userCheck) {
          console.log('❌ User still does not exist after creation attempt');
        } else {
          console.log('✅ User exists, but there might be a different issue');
        }
      }
    }

    // Step 4: Check database connection and schema
    console.log('\n📊 Step 4: Database connection test...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection working');
    } catch (error) {
      console.log('❌ Database connection error:', error.message);
    }

    // Step 5: Check if there are any existing leads
    console.log('\n📊 Step 5: Checking existing leads...');
    const existingLeads = await prisma.lead.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        ownerId: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${existingLeads.length} existing leads:`);
    existingLeads.forEach(lead => {
      console.log(`- ID: ${lead.id}, Name: ${lead.firstName} ${lead.lastName}, Owner: ${lead.ownerId}`);
    });

    console.log('\n🎉 Diagnosis completed!');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
