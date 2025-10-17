#!/usr/bin/env node

/**
 * Script to fix lead-to-opportunity conversion issues
 * 
 * This script:
 * 1. Finds leads with QUOTE_SENT status that don't have opportunities
 * 2. Links them to existing quotations with matching account names
 * 3. Creates opportunities and updates lead status
 * 
 * Usage: node scripts/fix-lead-opportunity-conversion.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLeadOpportunityConversion() {
  try {
    console.log('🔍 Checking for leads that need opportunity conversion...');
    
    // Find leads with QUOTE_SENT status
    const leads = await prisma.lead.findMany({
      where: {
        status: 'QUOTE_SENT'
      }
    });
    
    if (leads.length === 0) {
      console.log('✅ No leads with QUOTE_SENT status found. All good!');
      return;
    }
    
    console.log(`Found ${leads.length} leads with QUOTE_SENT status:`);
    
    for (const lead of leads) {
      console.log(`\n📋 Processing lead: ${lead.firstName} ${lead.lastName} (${lead.company})`);
      
      // Find quotations for accounts with matching names
      const quotations = await prisma.quotation.findMany({
        where: {
          account: {
            name: lead.company || `${lead.firstName} ${lead.lastName}`
          },
          leadId: null // Only quotations not already linked to leads
        },
        include: {
          account: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (quotations.length === 0) {
        console.log(`   ⚠️  No matching quotations found for company: ${lead.company}`);
        continue;
      }
      
      // Use the most recent quotation
      const quotation = quotations[0];
      console.log(`   📄 Found quotation: ${quotation.number} for account: ${quotation.account.name}`);
      
      // Link the quotation to the lead
      await prisma.quotation.update({
        where: { id: quotation.id },
        data: { leadId: lead.id }
      });
      console.log('   ✅ Linked quotation to lead');
      
      // Update lead status to CONVERTED_TO_OPPORTUNITY
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'CONVERTED_TO_OPPORTUNITY',
          dealValue: quotation.total,
          probability: 25
        }
      });
      console.log('   ✅ Updated lead status to CONVERTED_TO_OPPORTUNITY');
      
      // Create an Opportunity
      const opportunityName = lead.company || `${lead.firstName} ${lead.lastName}` || 'Untitled Opportunity';
      
      const opportunity = await prisma.opportunity.create({
        data: {
          name: opportunityName,
          stage: 'QUOTE_SENT',
          value: quotation.total,
          probability: 25,
          accountId: quotation.accountId,
          leadId: lead.id,
          ownerId: quotation.ownerId
        }
      });
      
      console.log(`   ✅ Created opportunity: ${opportunity.id} (${opportunity.name})`);
      
      // Link the quotation to the opportunity
      await prisma.quotation.update({
        where: { id: quotation.id },
        data: { opportunityId: opportunity.id }
      });
      
      console.log('   ✅ Linked quotation to opportunity');
    }
    
    console.log('\n🎉 Lead-to-opportunity conversion completed!');
    
  } catch (error) {
    console.error('❌ Error during conversion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixLeadOpportunityConversion();
