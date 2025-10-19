import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Fetch all data from main tables
    const [
      users,
      accounts,
      contacts,
      leads,
      opportunities,
      products,
      invoices,
      quotations,
      orders,
      payments,
      distributors,
      agents,
      warehouses,
      tasks
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.account.findMany(),
      prisma.contact.findMany(),
      prisma.lead.findMany(),
      prisma.opportunity.findMany(),
      prisma.product.findMany(),
      prisma.invoice.findMany(),
      prisma.quotation.findMany(),
      prisma.order.findMany(),
      prisma.payment.findMany(),
      prisma.distributor.findMany(),
      prisma.agent.findMany(),
      prisma.warehouse.findMany(),
      prisma.task.findMany()
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      system: 'AdPools Group ERP/CRM',
      version: '1.0',
      data: {
        users,
        accounts,
        contacts,
        leads,
        opportunities,
        products,
        invoices,
        quotations,
        orders,
        payments,
        distributors,
        agents,
        warehouses,
        tasks
      },
      summary: {
        totalUsers: users.length,
        totalAccounts: accounts.length,
        totalContacts: contacts.length,
        totalLeads: leads.length,
        totalOpportunities: opportunities.length,
        totalProducts: products.length,
        totalInvoices: invoices.length,
        totalQuotations: quotations.length,
        totalOrders: orders.length,
        totalPayments: payments.length,
        totalDistributors: distributors.length,
        totalAgents: agents.length,
        totalWarehouses: warehouses.length,
        totalTasks: tasks.length
      }
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `adpools-export-${timestamp}.${format}`;

    if (format === 'json') {
      const jsonData = JSON.stringify(exportData, null, 2);
      
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': Buffer.byteLength(jsonData).toString()
        }
      });
    } else if (format === 'csv') {
      // Create CSV with summary data
      let csvContent = 'AdPools Group Data Export\n';
      csvContent += `Export Date: ${exportData.exportDate}\n`;
      csvContent += `\n`;
      csvContent += 'Summary\n';
      csvContent += 'Category,Count\n';
      csvContent += `Users,${exportData.summary.totalUsers}\n`;
      csvContent += `Accounts,${exportData.summary.totalAccounts}\n`;
      csvContent += `Contacts,${exportData.summary.totalContacts}\n`;
      csvContent += `Leads,${exportData.summary.totalLeads}\n`;
      csvContent += `Opportunities,${exportData.summary.totalOpportunities}\n`;
      csvContent += `Products,${exportData.summary.totalProducts}\n`;
      csvContent += `Invoices,${exportData.summary.totalInvoices}\n`;
      csvContent += `Quotations,${exportData.summary.totalQuotations}\n`;
      csvContent += `Orders,${exportData.summary.totalOrders}\n`;
      csvContent += `Payments,${exportData.summary.totalPayments}\n`;
      csvContent += `Distributors,${exportData.summary.totalDistributors}\n`;
      csvContent += `Agents,${exportData.summary.totalAgents}\n`;
      csvContent += `Warehouses,${exportData.summary.totalWarehouses}\n`;
      csvContent += `Tasks,${exportData.summary.totalTasks}\n`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': Buffer.byteLength(csvContent).toString()
        }
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

