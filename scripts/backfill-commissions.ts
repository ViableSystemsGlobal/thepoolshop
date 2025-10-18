import { PrismaClient } from '@prisma/client';
import { CommissionService } from '../src/lib/commission-service';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Backfilling Commissions for Existing Paid Invoices\n');

  // Get all paid invoices without commissions
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      paymentStatus: 'PAID',
      commissions: {
        none: {}
      }
    },
    include: {
      owner: true,
      agentInvoices: true
    },
    orderBy: { paidDate: 'desc' }
  });

  console.log(`Found ${paidInvoices.length} paid invoice(s) without commissions\n`);

  if (paidInvoices.length === 0) {
    console.log('✅ No invoices to process!');
    return;
  }

  let totalCreated = 0;
  let totalAmount = 0;

  for (const invoice of paidInvoices) {
    console.log(`\n📄 Processing Invoice: ${invoice.number} (GH₵${invoice.total.toFixed(2)})`);
    console.log(`   Owner: ${invoice.owner.name}`);

    try {
      const createdCommissions = await CommissionService.createCommissionsForInvoice(
        invoice.id,
        'SYSTEM_BACKFILL' // Special performer ID for backfill
      );

      if (createdCommissions.length > 0) {
        console.log(`   ✅ Created ${createdCommissions.length} commission(s):`);
        createdCommissions.forEach((comm: any) => {
          console.log(`      - ${comm.agent.user.name}: GH₵${comm.commissionAmount.toFixed(2)} (${comm.commissionRate}%)`);
          totalAmount += comm.commissionAmount;
        });
        totalCreated += createdCommissions.length;
      } else {
        console.log(`   ℹ️ No commission created (owner not an agent or disabled)`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n\n✅ Backfill Complete!`);
  console.log(`   Total Commissions Created: ${totalCreated}`);
  console.log(`   Total Commission Amount: GH₵${totalAmount.toFixed(2)}`);
  console.log(`\n💡 All commissions created with PENDING status`);
  console.log(`   Review and approve them in the Commissions page`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

