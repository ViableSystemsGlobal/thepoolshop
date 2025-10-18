import { PrismaClient } from '@prisma/client';
import { CommissionService } from '../src/lib/commission-service';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Commission System\n');

  // Get commission settings
  console.log('📋 Commission Settings:');
  const settings = await CommissionService.getSettings();
  console.log(`   - Enabled: ${settings.enabled}`);
  console.log(`   - System Rate: ${settings.systemRate}%`);
  console.log(`   - Calculation Type: ${settings.calculationType}`);
  console.log(`   - Min Invoice Amount: GH₵${settings.minInvoiceAmount}`);
  console.log('');

  // Find an agent
  console.log('👤 Finding agents...');
  const agents = await prisma.agent.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: true
    },
    take: 3
  });

  if (agents.length === 0) {
    console.log('❌ No agents found. Please create an agent first.');
    return;
  }

  console.log(`   Found ${agents.length} active agent(s):`);
  agents.forEach(agent => {
    console.log(`   - ${agent.user.name} (${agent.agentCode}) - Commission Rate: ${agent.commissionRate}%`);
  });
  console.log('');

  // Find a paid invoice
  console.log('💰 Finding paid invoices...');
  const paidInvoices = await prisma.invoice.findMany({
    where: { paymentStatus: 'PAID' },
    include: {
      owner: true,
      agentInvoices: {
        include: {
          agent: {
            include: {
              user: true
            }
          }
        }
      },
      commissions: {
        include: {
          agent: {
            include: {
              user: true
            }
          }
        }
      },
      lines: {
        include: {
          product: {
            select: { cost: true }
          }
        }
      }
    },
    take: 5
  });

  if (paidInvoices.length === 0) {
    console.log('❌ No paid invoices found.');
    return;
  }

  console.log(`   Found ${paidInvoices.length} paid invoice(s)\n`);

  // Test commission preview for each invoice
  for (const invoice of paidInvoices) {
    console.log(`\n📊 Invoice: ${invoice.number} (${invoice.total.toFixed(2)} GHS)`);
    console.log(`   Owner: ${invoice.owner.name}`);
    console.log(`   Payment Status: ${invoice.paymentStatus}`);
    
    // Check if owner is an agent
    const ownerAgent = agents.find(a => a.userId === invoice.ownerId);
    if (ownerAgent) {
      console.log(`   ✅ Owner IS an agent: ${ownerAgent.agentCode} (${ownerAgent.commissionRate}%)`);
    } else {
      console.log(`   ℹ️ Owner is NOT an agent`);
    }

    // Show assigned agents
    if (invoice.agentInvoices.length > 0) {
      console.log(`   👥 Assigned Agents (${invoice.agentInvoices.length}):`);
      invoice.agentInvoices.forEach(ai => {
        console.log(`      - ${ai.agent.user.name} (${ai.agent.agentCode}) - Role: ${ai.role}, Split: ${ai.splitPercent || 'Equal'}%`);
      });
    }

    // Show existing commissions
    if (invoice.commissions.length > 0) {
      console.log(`   💵 Existing Commissions (${invoice.commissions.length}):`);
      invoice.commissions.forEach(comm => {
        console.log(`      - ${comm.agent.user.name}: GH₵${comm.commissionAmount.toFixed(2)} (${comm.commissionRate}%) - Status: ${comm.status}`);
      });
    } else {
      console.log(`   ⚠️ No commissions found`);
    }

    // Preview what commissions would be created
    try {
      const preview = await CommissionService.previewCommissions(invoice.id);
      if (preview.length > 0) {
        console.log(`   🔮 Commission Preview (what would be created):`);
        preview.forEach(calc => {
          console.log(`      - ${calc.agentName} (${calc.agentCode})`);
          console.log(`        Base: GH₵${calc.baseAmount.toFixed(2)} × ${calc.commissionRate}% = GH₵${calc.commissionAmount.toFixed(2)}`);
          console.log(`        Role: ${calc.role}`);
        });
      } else {
        console.log(`   ℹ️ No commissions would be created (settings or no agents)`);
      }
    } catch (error) {
      console.error(`   ❌ Error previewing commissions:`, error);
    }
  }

  console.log('\n\n📈 Commission Summary:');
  
  // Overall commission stats
  const allCommissions = await prisma.commission.findMany({
    include: {
      agent: {
        include: {
          user: true
        }
      }
    }
  });

  const commissionByStatus = {
    PENDING: allCommissions.filter(c => c.status === 'PENDING'),
    APPROVED: allCommissions.filter(c => c.status === 'APPROVED'),
    PAID: allCommissions.filter(c => c.status === 'PAID'),
    CANCELLED: allCommissions.filter(c => c.status === 'CANCELLED')
  };

  console.log(`   Total Commissions: ${allCommissions.length}`);
  console.log(`   - PENDING: ${commissionByStatus.PENDING.length} (GH₵${commissionByStatus.PENDING.reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2)})`);
  console.log(`   - APPROVED: ${commissionByStatus.APPROVED.length} (GH₵${commissionByStatus.APPROVED.reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2)})`);
  console.log(`   - PAID: ${commissionByStatus.PAID.length} (GH₵${commissionByStatus.PAID.reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2)})`);
  console.log(`   - CANCELLED: ${commissionByStatus.CANCELLED.length}`);

  console.log('\n\n✅ Commission System Test Complete!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Create a new invoice (or use existing unpaid invoice)');
  console.log('   2. Make sure the invoice owner is an agent');
  console.log('   3. Record a payment to mark invoice as PAID');
  console.log('   4. Commission will be auto-created with PENDING status');
  console.log('   5. Use /api/commissions/[id]/approve to approve it');
  console.log('   6. Use /api/commissions/[id]/mark-paid to mark it as paid');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

