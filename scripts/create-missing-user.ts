import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating missing user to fix foreign key constraint...');

  try {
    // The problematic user ID that the frontend is trying to use
    const problematicUserId = 'cmgxgoy9w00008z2z4ajxyw47';
    
    // Check if this user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: problematicUserId }
    });

    if (existingUser) {
      console.log(`✅ User with ID ${problematicUserId} already exists:`);
      console.log(`- Email: ${existingUser.email}`);
      console.log(`- Name: ${existingUser.name}`);
      console.log(`- Role: ${existingUser.role}`);
      console.log(`- Active: ${existingUser.isActive}`);
    } else {
      console.log(`❌ User with ID ${problematicUserId} does not exist`);
      console.log('Creating user with this exact ID...');
      
      // Create the user with the exact ID that the frontend expects
      const hashedPassword = await hash('admin123', 10);
      const newUser = await prisma.user.create({
        data: {
          id: problematicUserId, // Use the exact ID the frontend expects
          email: 'admin@adpools.com',
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      
      console.log(`✅ Created user with ID: ${newUser.id}`);
      console.log(`- Email: ${newUser.email}`);
      console.log(`- Name: ${newUser.name}`);
      console.log(`- Role: ${newUser.role}`);
    }

    // Ensure this user has SUPER_ADMIN role assignment
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (superAdminRole) {
      const roleAssignment = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: problematicUserId,
            roleId: superAdminRole.id
          }
        }
      });

      if (!roleAssignment) {
        console.log('🔧 Creating SUPER_ADMIN role assignment...');
        await prisma.userRoleAssignment.create({
          data: {
            userId: problematicUserId,
            roleId: superAdminRole.id,
            isActive: true
          }
        });
        console.log('✅ Created SUPER_ADMIN role assignment');
      } else {
        console.log('✅ SUPER_ADMIN role assignment already exists');
      }
    }

    // Verify the user can be found
    const finalUser = await prisma.user.findUnique({
      where: { id: problematicUserId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                roleAbilities: {
                  include: {
                    ability: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (finalUser) {
      console.log('\n✅ Final verification:');
      console.log(`- User ID: ${finalUser.id}`);
      console.log(`- Email: ${finalUser.email}`);
      console.log(`- Role: ${finalUser.role}`);
      console.log(`- Active: ${finalUser.isActive}`);
      console.log(`- Role assignments: ${finalUser.userRoles.filter(ur => ur.isActive).length}`);
      
      const totalAbilities = finalUser.userRoles
        .filter(ur => ur.isActive)
        .reduce((total, ur) => total + ur.role.roleAbilities.length, 0);
      console.log(`- Total abilities: ${totalAbilities}`);
    }

    console.log('\n🎉 Missing user fix completed!');
    console.log('\n📋 What was fixed:');
    console.log('- Created user with the exact ID the frontend expects');
    console.log('- Assigned SUPER_ADMIN role and permissions');
    console.log('- Foreign key constraint should now be resolved');
    console.log('\n⚠️  Try creating a lead again - it should work now!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
