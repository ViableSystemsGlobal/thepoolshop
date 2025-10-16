import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adding AI Analyst ability...');

  try {
    // 1. Create the ai-analyst.view ability if it doesn't exist
    let ability = await prisma.ability.findFirst({
      where: {
        name: 'ai-analyst.view'
      }
    });

    if (!ability) {
      ability = await prisma.ability.create({
        data: {
          name: 'ai-analyst.view',
          resource: 'ai-analyst',
          action: 'view',
          description: 'Access to AI Business Analyst chatbot'
        }
      });
      console.log('✅ Created ai-analyst.view ability');
    } else {
      console.log('ℹ️  ai-analyst.view ability already exists');
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
      console.log('✅ Assigned ai-analyst.view to Super Admin role');
    } else {
      console.log('ℹ️  ai-analyst.view already assigned to Super Admin');
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
        console.log('✅ Assigned ai-analyst.view to Admin role');
      } else {
        console.log('ℹ️  ai-analyst.view already assigned to Admin');
      }
    }

    console.log('🎉 AI Analyst ability setup complete!');
    console.log('📝 Users with Super Admin or Admin roles can now access the AI Analyst page.');

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

