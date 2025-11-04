// Script to fix opportunities marked as WON but with 0 value
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Fixing WON opportunities with zero value...\n');

  // Find all opportunities marked as WON with zero or null value
  const wonOpportunities = await prisma.opportunity.findMany({
    where: {
      stage: 'WON',
      OR: [
        { value: 0 },
        { value: null }
      ]
    },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      quotations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  console.log(`Found ${wonOpportunities.length} WON opportunities with zero/null value\n`);

  let fixed = 0;
  let skipped = 0;

  for (const opportunity of wonOpportunities) {
    let dealValue: number | null = null;

    // Prefer invoice total, fallback to quotation total
    if (opportunity.invoices && opportunity.invoices.length > 0) {
      dealValue = opportunity.invoices[0].total;
    } else if (opportunity.quotations && opportunity.quotations.length > 0) {
      dealValue = opportunity.quotations[0].total;
    }

    if (dealValue && dealValue > 0) {
      await prisma.opportunity.update({
        where: { id: opportunity.id },
        data: {
          value: dealValue,
          probability: 100 // Also set probability to 100% for won deals
        }
      });

      console.log(`✅ Fixed: ${opportunity.name}`);
      console.log(`   Value: ${dealValue}`);
      console.log(`   Source: ${opportunity.invoices && opportunity.invoices.length > 0 ? 'Invoice' : 'Quotation'}\n`);
      fixed++;
    } else {
      console.log(`⏭️  Skipped: ${opportunity.name} (no invoices or quotations found)\n`);
      skipped++;
    }
  }

  console.log(`\n✨ Fix complete!`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${wonOpportunities.length}\n`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

