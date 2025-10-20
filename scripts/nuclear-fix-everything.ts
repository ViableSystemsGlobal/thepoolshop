import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 NUCLEAR FIX - Starting complete reset...');

  try {
    // Step 1: Delete everything and start fresh
    console.log('\n🗑️  Step 1: Cleaning up existing data...');
    
    // Delete in correct order to avoid foreign key issues
    await prisma.userRoleAssignment.deleteMany({});
    await prisma.roleAbility.deleteMany({});
    await prisma.ability.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ All existing data cleared');

    // Step 2: Create the exact user the frontend expects
    console.log('\n👤 Step 2: Creating admin user...');
    const adminId = 'cmgxgoy9w00008z2z4ajxyw47';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        id: adminId,
        email: 'admin@adpools.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });
    
    console.log(`✅ Admin user created: ${adminUser.email}`);
    console.log(`✅ Password: ${password}`);
    console.log(`✅ User ID: ${adminUser.id}`);

    // Step 3: Create SUPER_ADMIN role
    console.log('\n🔐 Step 3: Creating SUPER_ADMIN role...');
    const superAdminRole = await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator',
        isActive: true,
        isSystem: true
      }
    });
    console.log(`✅ SUPER_ADMIN role created: ${superAdminRole.id}`);

    // Step 4: Create essential abilities only
    console.log('\n⚡ Step 4: Creating essential abilities...');
    const essentialAbilities = [
      'dashboard.view',
      'crm.view',
      'drm.view', 
      'sales.view',
      'inventory.view',
      'communication.view',
      'agents.view',
      'reports.view',
      'settings.view',
      'tasks.view',
      'ai_analyst.access',
      'leads.view',
      'leads.create',
      'leads.edit',
      'leads.delete',
      'accounts.view',
      'accounts.create',
      'products.view',
      'products.create',
      'invoices.view',
      'invoices.create',
      'users.view',
      'users.manage',
      'settings.manage',
      'roles.manage'
    ];

    const abilities = [];
    for (const abilityName of essentialAbilities) {
      const [resource, action] = abilityName.split('.');
      const ability = await prisma.ability.create({
        data: {
          name: abilityName,
          resource: resource,
          action: action,
          description: `${action} ${resource}`
        }
      });
      abilities.push(ability);
    }
    console.log(`✅ Created ${abilities.length} essential abilities`);

    // Step 5: Assign all abilities to SUPER_ADMIN
    console.log('\n🔗 Step 5: Assigning abilities to role...');
    for (const ability of abilities) {
      await prisma.roleAbility.create({
        data: {
          roleId: superAdminRole.id,
          abilityId: ability.id
        }
      });
    }
    console.log(`✅ Assigned ${abilities.length} abilities to SUPER_ADMIN`);

    // Step 6: Assign role to user
    console.log('\n👑 Step 6: Assigning role to user...');
    await prisma.userRoleAssignment.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        isActive: true
      }
    });
    console.log('✅ User assigned SUPER_ADMIN role');

    // Step 7: Verify everything works
    console.log('\n🧪 Step 7: Final verification...');
    const testUser = await prisma.user.findUnique({
      where: { id: adminId },
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

    if (testUser) {
      const userAbilities = testUser.userRoles
        .flatMap(ur => ur.role.roleAbilities)
        .map(ra => ra.ability.name);
      
      console.log('✅ VERIFICATION SUCCESSFUL:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: admin123`);
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Role: ${testUser.role}`);
      console.log(`   Abilities: ${userAbilities.length}`);
      console.log(`   Has CRM: ${userAbilities.includes('crm.view')}`);
      console.log(`   Has DRM: ${userAbilities.includes('drm.view')}`);
      console.log(`   Can create leads: ${userAbilities.includes('leads.create')}`);
    }

    console.log('\n🎉 NUCLEAR FIX COMPLETE!');
    console.log('\n🚀 LOGIN CREDENTIALS:');
    console.log('   Email: admin@adpools.com');
    console.log('   Password: admin123');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Restart your dev server: npm run dev');
    console.log('2. Go to localhost:3002');
    console.log('3. Login with the credentials above');
    console.log('4. Everything should work now!');

  } catch (error) {
    console.error('❌ Nuclear fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
