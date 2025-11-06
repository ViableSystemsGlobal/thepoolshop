import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCurrentUserAsAdmin() {
  try {
    console.log('Adding current user as Super Admin...');

    // First, find the Super Admin role
    const superAdminRole = await prisma.role.findFirst({
      where: {
        name: 'Super Admin'
      }
    });

    if (!superAdminRole) {
      console.error('Super Admin role not found. Please run the create-super-admin-role script first.');
      return;
    }

    console.log('Found Super Admin role:', superAdminRole.name);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@adpools.com' },
          { id: 'cmfi6s8um00008o6nh4kryxph' }
        ]
      }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      
      // Check if user already has Super Admin role
      const existingRoleAssignment = await prisma.userRoleAssignment.findFirst({
        where: {
          userId: existingUser.id,
          roleId: superAdminRole.id
        }
      });

      if (existingRoleAssignment) {
        console.log('User already has Super Admin role assigned.');
        return;
      }

      // Assign Super Admin role to existing user
      await prisma.userRoleAssignment.create({
        data: {
          userId: existingUser.id,
          roleId: superAdminRole.id,
          assignedBy: existingUser.id, // Self-assigned for the initial admin
          assignedAt: new Date()
        }
      });

      console.log('✅ Super Admin role assigned to existing user:', existingUser.email);
    } else {
      // Create new user with Super Admin role
      const newUser = await prisma.user.create({
        data: {
          id: 'cmfi6s8um00008o6nh4kryxph',
          email: 'admin@adpools.com',
          name: 'Admin User',
          phone: null,
          role: 'ADMIN', // This is the legacy role field
          isActive: true,
          lastLoginAt: new Date(),
          emailVerified: new Date(),
          phoneVerified: null,
          preferences: {}
        }
      });

      console.log('✅ Created new user:', newUser.email);

      // Assign Super Admin role
      await prisma.userRoleAssignment.create({
        data: {
          userId: newUser.id,
          roleId: superAdminRole.id,
          assignedBy: newUser.id, // Self-assigned for the initial admin
          assignedAt: new Date()
        }
      });

      console.log('✅ Super Admin role assigned to new user:', newUser.email);
    }

    // Verify the assignment
    const userWithRoles = await prisma.user.findFirst({
      where: {
        email: 'admin@adpools.com'
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('\n📋 User Details:');
    console.log('Email:', userWithRoles?.email);
    console.log('Name:', userWithRoles?.name);
    console.log('Legacy Role:', userWithRoles?.role);
    console.log('Active:', userWithRoles?.isActive);
    console.log('\n🎭 Assigned Roles:');
    userWithRoles?.userRoles.forEach(userRole => {
      console.log(`- ${userRole.role.name} (${userRole.role.isSystem ? 'System' : 'Custom'})`);
    });

  } catch (error) {
    console.error('Error adding current user as admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addCurrentUserAsAdmin();
