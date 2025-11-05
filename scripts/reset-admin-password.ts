import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');

    const adminEmail = 'admin@adpools.com';
    const newPassword = 'admin123';

    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.email}`);
    console.log(`   Current password hash length: ${adminUser.password?.length || 0}\n`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Generated new password hash');

    // Update the password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Password updated successfully!\n');
    console.log('📋 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}\n`);

    // Verify the password works
    console.log('🧪 Verifying password hash...');
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);

    if (isValid) {
      console.log('✅ Admin password has been reset successfully!');
      console.log('💡 You can now log in with the credentials above.');
    }

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

