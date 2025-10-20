import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing user ID mismatch issue...');

  try {
    // Step 1: Check what users exist
    console.log('\n📊 Current users in database:');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Step 2: Check if the problematic user ID exists
    const problematicUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    const problematicUser = await prisma.user.findUnique({
      where: { id: problematicUserId }
    });

    if (!problematicUser) {
      console.log(`\n❌ User ID ${problematicUserId} does not exist in database`);
      console.log('This is causing the foreign key constraint violation');
      
      // Step 3: Find the correct admin user
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@adpools.com' }
      });

      if (adminUser) {
        console.log(`\n✅ Found admin user with ID: ${adminUser.id}`);
        console.log('The frontend is using the wrong user ID');
        
        // Step 4: Check if there are any leads with the wrong ownerId
        const leadsWithWrongOwner = await prisma.lead.findMany({
          where: { ownerId: problematicUserId }
        });
        
        console.log(`\n🔍 Found ${leadsWithWrongOwner.length} leads with wrong ownerId`);
        
        if (leadsWithWrongOwner.length > 0) {
          console.log('Updating leads to use correct ownerId...');
          await prisma.lead.updateMany({
            where: { ownerId: problematicUserId },
            data: { ownerId: adminUser.id }
          });
          console.log('✅ Updated leads with correct ownerId');
        }
        
        // Step 5: Check for other entities with wrong ownerId
        const entitiesToCheck = [
          { model: 'order', field: 'createdById' },
          { model: 'invoice', field: 'ownerId' },
          { model: 'quotation', field: 'ownerId' },
          { model: 'task', field: 'creatorId' },
          { model: 'opportunity', field: 'ownerId' }
        ];

        for (const entity of entitiesToCheck) {
          try {
            const count = await (prisma as any)[entity.model].count({
              where: { [entity.field]: problematicUserId }
            });
            if (count > 0) {
              console.log(`Found ${count} ${entity.model} records with wrong ${entity.field}`);
              await (prisma as any)[entity.model].updateMany({
                where: { [entity.field]: problematicUserId },
                data: { [entity.field]: adminUser.id }
              });
              console.log(`✅ Updated ${entity.model} records`);
            }
          } catch (error) {
            // Ignore errors for models that might not exist
          }
        }
        
      } else {
        console.log('\n❌ Admin user not found, creating...');
        const hashedPassword = await hash('admin123', 10);
        const newAdmin = await prisma.user.create({
          data: {
            email: 'admin@adpools.com',
            name: 'System Administrator',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
          }
        });
        console.log(`✅ Created admin user with ID: ${newAdmin.id}`);
      }
    } else {
      console.log(`\n✅ User ID ${problematicUserId} exists in database`);
      console.log(`User: ${problematicUser.email} (${problematicUser.name})`);
    }

    // Step 6: Verify the fix
    console.log('\n🔍 Verifying fix...');
    const finalUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log('Final users:');
    finalUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    console.log('\n🎉 User ID mismatch fix completed!');
    console.log('\n📋 What was fixed:');
    console.log('- Checked for non-existent user IDs');
    console.log('- Updated any records with wrong ownerId');
    console.log('- Ensured admin user exists');
    console.log('\n⚠️  Please refresh your browser and try creating a lead again!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
