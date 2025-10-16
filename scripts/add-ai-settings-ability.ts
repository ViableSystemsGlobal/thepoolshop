import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adding AI Settings ability...');

  try {
    // 1. Create the ai-settings.view ability if it doesn't exist
    let ability = await prisma.ability.findFirst({
      where: {
        name: 'ai-settings.view'
      }
    });

    if (!ability) {
      ability = await prisma.ability.create({
        data: {
          name: 'ai-settings.view',
          resource: 'ai-settings',
          action: 'view',
          description: 'Access to AI configuration settings'
        }
      });
      console.log('✅ Created ai-settings.view ability');
    } else {
      console.log('ℹ️  ai-settings.view ability already exists');
    }

    // 2. Find Super Admin role
    const superAdminRole = await prisma.role.findFirst({
      where: {
        name: 'Super Admin'
      }
    });

    if (!superAdminRole) {
      console.error('❌ Super Admin role not found!');
      return;
    }

    // 3. Check if the ability is already assigned to Super Admin
    const existingAssignment = await prisma.roleAbility.findFirst({
      where: {
        roleId: superAdminRole.id,
        abilityId: ability.id
      }
    });

    if (!existingAssignment) {
      await prisma.roleAbility.create({
        data: {
          roleId: superAdminRole.id,
          abilityId: ability.id
        }
      });
      console.log('✅ Assigned ai-settings.view to Super Admin role');
    } else {
      console.log('ℹ️  ai-settings.view already assigned to Super Admin');
    }

    // 4. Find Admin role and assign as well
    const adminRole = await prisma.role.findFirst({
      where: {
        name: 'Admin'
      }
    });

    if (adminRole) {
      const adminAssignment = await prisma.roleAbility.findFirst({
        where: {
          roleId: adminRole.id,
          abilityId: ability.id
        }
      });

      if (!adminAssignment) {
        await prisma.roleAbility.create({
          data: {
            roleId: adminRole.id,
            abilityId: ability.id
          }
        });
        console.log('✅ Assigned ai-settings.view to Admin role');
      } else {
        console.log('ℹ️  ai-settings.view already assigned to Admin');
      }
    }

    console.log('🎉 AI Settings ability setup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

