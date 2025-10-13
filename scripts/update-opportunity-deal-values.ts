// Script to backfill deal values for existing opportunities
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔄 Updating deal values for existing opportunities...\n');

  // Find all opportunities (leads with opportunity statuses)
  const opportunities = await prisma.lead.findMany({
    where: {
      status: {
        in: ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST']
      }
    },
    include: {
      quotations: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get the latest quotation
      }
    }
  });

  console.log(`Found ${opportunities.length} opportunities to update\n`);

  let updated = 0;
  let skipped = 0;

  for (const opportunity of opportunities) {
    if (opportunity.quotations.length > 0) {
      const latestQuote = opportunity.quotations[0];
      
      // Update the opportunity with the quote's total as deal value
      await prisma.lead.update({
        where: { id: opportunity.id },
        data: {
          dealValue: latestQuote.total,
          probability: opportunity.probability || 25, // Set default if not set
        }
      });

      console.log(`✅ Updated: ${opportunity.firstName} ${opportunity.lastName}`);
      console.log(`   Deal Value: $${latestQuote.total}`);
      console.log(`   Probability: ${opportunity.probability || 25}%\n`);
      updated++;
    } else {
      console.log(`⏭️  Skipped: ${opportunity.firstName} ${opportunity.lastName} (no quotations)`);
      skipped++;
    }
  }

  console.log(`\n✨ Update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${opportunities.length}\n`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

