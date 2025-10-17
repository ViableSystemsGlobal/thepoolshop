const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOpportunityValues() {
  try {
    console.log('🔍 Finding opportunities with 0 values or incorrect probability...');
    
    // Find opportunities with 0 values or incorrect probability that have associated invoices
    const opportunitiesWithIssues = await prisma.opportunity.findMany({
      where: {
        OR: [
          { value: 0, stage: 'WON' },
          { stage: 'WON', probability: { not: 100 } }
        ]
      },
      include: {
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true
          }
        }
      }
    });

    console.log(`Found ${opportunitiesWithIssues.length} opportunities with issues`);

    for (const opportunity of opportunitiesWithIssues) {
      console.log(`\n🔍 Processing opportunity: ${opportunity.name} (ID: ${opportunity.id})`);
      
      if (opportunity.invoices && opportunity.invoices.length > 0) {
        // Find the highest value invoice (in case there are multiple)
        const highestValueInvoice = opportunity.invoices.reduce((max, invoice) => 
          invoice.total > max.total ? invoice : max
        );
        
        console.log(`📄 Found invoice: ${highestValueInvoice.number} with total: ${highestValueInvoice.total}`);
        
        // Update the opportunity value and probability
        const updateData = {
          value: highestValueInvoice.total
        };
        
        // If the opportunity is WON, set probability to 100%
        if (opportunity.stage === 'WON') {
          updateData.probability = 100;
        }
        
        await prisma.opportunity.update({
          where: { id: opportunity.id },
          data: updateData
        });
        
        console.log(`✅ Updated opportunity value to: ${highestValueInvoice.total}${opportunity.stage === 'WON' ? ' and probability to 100%' : ''}`);
      } else {
        console.log(`⚠️  No invoices found for opportunity: ${opportunity.name}`);
      }
    }

    console.log('\n🎉 Successfully fixed opportunity values!');
    
  } catch (error) {
    console.error('❌ Error fixing opportunity values:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOpportunityValues();
