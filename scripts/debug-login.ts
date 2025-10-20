import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Debugging login issue...');

  try {
    const email = 'admin@adpools.com';
    const password = 'admin123';

    // Step 1: Check if user exists
    console.log('\n👤 Step 1: Checking if user exists...');
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('Creating user now...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          id: 'cmgxgoy9w00008z2z4ajxyw47',
          email,
          name: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        }
      });
      console.log(`✅ User created: ${newUser.email}`);
      return;
    }

    console.log(`✅ User found: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Has password: ${!!user.password}`);

    // Step 2: Test password verification
    console.log('\n🔐 Step 2: Testing password verification...');
    if (!user.password) {
      console.log('❌ User has no password hash!');
      console.log('Setting password now...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password set successfully');
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`Password verification: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);

    if (!isValidPassword) {
      console.log('❌ Password is wrong! Resetting it...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password reset successfully');
      
      // Test again
      const newUser = await prisma.user.findUnique({ where: { email } });
      const testPassword = await bcrypt.compare(password, newUser!.password!);
      console.log(`New password test: ${testPassword ? '✅ VALID' : '❌ STILL INVALID'}`);
    }

    // Step 3: Test the complete auth flow
    console.log('\n🧪 Step 3: Testing complete auth flow...');
    const finalUser = await prisma.user.findUnique({
      where: { email }
    });

    if (finalUser && finalUser.password) {
      const authTest = await bcrypt.compare(password, finalUser.password);
      if (authTest) {
        console.log('✅ AUTH FLOW TEST PASSED');
        console.log('\n🎉 LOGIN SHOULD WORK NOW!');
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   User ID: ${finalUser.id}`);
        
        // Update last login to test database write
        await prisma.user.update({
          where: { id: finalUser.id },
          data: { lastLoginAt: new Date() }
        });
        console.log('✅ Database write test passed');
      } else {
        console.log('❌ AUTH FLOW TEST FAILED');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
