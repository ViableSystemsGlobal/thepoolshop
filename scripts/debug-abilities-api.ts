import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Debugging abilities API locally...');

  try {
    // Step 1: Test database connection
    console.log('\n📊 Step 1: Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }

    // Step 2: Check if users exist
    console.log('\n👤 Step 2: Checking users...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });

    // Step 3: Check roles
    console.log('\n🔐 Step 3: Checking roles...');
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true, isActive: true }
    });
    
    console.log(`Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`- ID: ${role.id}, Name: ${role.name}, Active: ${role.isActive}`);
    });

    // Step 4: Check abilities
    console.log('\n⚡ Step 4: Checking abilities...');
    const abilities = await prisma.ability.findMany({
      select: { id: true, name: true, resource: true, action: true }
    });
    
    console.log(`Found ${abilities.length} abilities:`);
    abilities.slice(0, 10).forEach(ability => {
      console.log(`- ID: ${ability.id}, Name: ${ability.name}, Resource: ${ability.resource}, Action: ${ability.action}`);
    });
    if (abilities.length > 10) {
      console.log(`... and ${abilities.length - 10} more abilities`);
    }

    // Step 5: Check role assignments
    console.log('\n🔗 Step 5: Checking role assignments...');
    const roleAssignments = await prisma.userRoleAssignment.findMany({
      include: {
        user: { select: { email: true, name: true } },
        role: { select: { name: true } }
      }
    });
    
    console.log(`Found ${roleAssignments.length} role assignments:`);
    roleAssignments.forEach(assignment => {
      console.log(`- User: ${assignment.user.email}, Role: ${assignment.role.name}, Active: ${assignment.isActive}`);
    });

    // Step 6: Check role abilities
    console.log('\n🎯 Step 6: Checking role abilities...');
    const roleAbilities = await prisma.roleAbility.findMany({
      include: {
        role: { select: { name: true } },
        ability: { select: { name: true } }
      }
    });
    
    console.log(`Found ${roleAbilities.length} role-ability assignments:`);
    roleAbilities.slice(0, 10).forEach(ra => {
      console.log(`- Role: ${ra.role.name}, Ability: ${ra.ability.name}`);
    });
    if (roleAbilities.length > 10) {
      console.log(`... and ${roleAbilities.length - 10} more assignments`);
    }

    // Step 7: Test the abilities API logic
    console.log('\n🧪 Step 7: Testing abilities API logic...');
    
    // Find a user to test with
    const testUser = users.find(u => u.isActive);
    if (!testUser) {
      console.log('❌ No active users found to test with');
      return;
    }

    console.log(`Testing with user: ${testUser.email} (${testUser.id})`);

    // Simulate the abilities API logic
    const userRoleAssignments = await prisma.userRoleAssignment.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
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
    });

    console.log(`Found ${userRoleAssignments.length} active role assignments for user`);

    // Extract abilities
    const userAbilities: string[] = [];
    userRoleAssignments.forEach(assignment => {
      assignment.role.roleAbilities.forEach(roleAbility => {
        if (!userAbilities.includes(roleAbility.ability.name)) {
          userAbilities.push(roleAbility.ability.name);
        }
      });
    });

    console.log(`User has ${userAbilities.length} abilities:`);
    console.log(`Sample abilities: ${userAbilities.slice(0, 10).join(', ')}`);

    // Step 8: Test session handling
    console.log('\n🔑 Step 8: Testing session handling...');
    try {
      // This might fail in a script context, but let's try
      console.log('Attempting to get server session...');
      // const session = await getServerSession(authOptions);
      // console.log('Session:', session ? 'Found' : 'Not found');
      console.log('⚠️  Session test skipped (requires Next.js context)');
    } catch (error) {
      console.log('⚠️  Session test failed (expected in script context):', error.message);
    }

    console.log('\n🎉 Debug completed!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Abilities: ${abilities.length}`);
    console.log(`- Role assignments: ${roleAssignments.length}`);
    console.log(`- Role-ability mappings: ${roleAbilities.length}`);
    console.log(`- Test user abilities: ${userAbilities.length}`);

    if (userAbilities.length === 0) {
      console.log('\n⚠️  ISSUE FOUND: User has no abilities!');
      console.log('This explains the 500 error in the abilities API.');
      console.log('Run the quick-fix script to resolve this.');
    } else {
      console.log('\n✅ User has abilities - the issue might be elsewhere.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
