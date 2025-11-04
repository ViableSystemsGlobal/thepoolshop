import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIService, BUSINESS_ANALYST_PROMPT } from '@/lib/ai-service';
import { getCompanyName } from '@/lib/payment-order-notifications';
import { sendEmailViaSMTP } from '@/lib/payment-order-notifications';

// Helper function to get setting value from database
async function getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
      select: { value: true }
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

// Fetch comprehensive business data with date range based on frequency
async function fetchComprehensiveBusinessData(userId: string, frequency: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const now = new Date();
  let startDate: Date;
  let periodDescription: string;

  if (frequency === 'daily') {
    // Daily: Yesterday to today
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    startDate = yesterday;
    periodDescription = 'Yesterday and Today';
  } else if (frequency === 'weekly') {
    // Weekly: Last 7 days
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    startDate = lastWeek;
    periodDescription = 'Last 7 Days';
  } else {
    // Monthly: Last 30 days
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    startDate = lastMonth;
    periodDescription = 'Last 30 Days';
  }

  const [
    invoices,
    quotations,
    leads,
    opportunities,
    products,
    orders,
    returns,
    accounts,
    payments
  ] = await Promise.all([
    // Invoices
    prisma.invoice.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        number: true,
        total: true,
        amountPaid: true,
        amountDue: true,
        paymentStatus: true,
        dueDate: true,
        createdAt: true,
        account: {
          select: {
            name: true
          }
        }
      }
    }),
    // Quotations
    prisma.quotation.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        createdAt: true,
        account: {
          select: {
            name: true
          }
        }
      }
    }),
    // Leads
    prisma.lead.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        status: true,
        source: true,
        dealValue: true,
        createdAt: true
      }
    }),
    // Opportunities (filtered by owner)
    prisma.opportunity.findMany({
      where: {
        ownerId: userId
      },
      select: {
        id: true,
        name: true,
        value: true,
        stage: true,
        probability: true,
        createdAt: true,
        closeDate: true
      }
    }),
    // Products
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        active: true,
        _count: {
          select: {
            orderItems: true,
            invoiceLines: true
          }
        },
        stockItems: {
          select: {
            quantity: true,
            reorderPoint: true
          }
        }
      }
    }),
    // Orders
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    }),
    // Returns
    prisma.return.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        number: true,
        total: true,
        reason: true,
        status: true,
        createdAt: true
      }
    }),
    // Accounts
    prisma.account.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        email: true,
        phone: true,
        _count: {
          select: {
            invoices: true,
            quotations: true,
            payments: true
          }
        }
      }
    }),
    // Payments
    prisma.payment.findMany({
      where: { receivedAt: { gte: startDate } },
      select: {
        id: true,
        amount: true,
        method: true,
        receivedAt: true
      }
    })
  ]);

  // Calculate comprehensive metrics
  const metrics = {
    period: periodDescription,
    sales: {
      totalRevenue: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
      totalOutstanding: invoices.reduce((sum, i) => sum + i.amountDue, 0),
      invoiceCount: invoices.length,
      paidInvoices: invoices.filter(i => i.paymentStatus === 'PAID').length,
      unpaidInvoices: invoices.filter(i => i.paymentStatus === 'UNPAID').length,
      partiallyPaidInvoices: invoices.filter(i => i.paymentStatus === 'PARTIALLY_PAID').length,
      averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, i) => sum + i.total, 0) / invoices.length : 0,
      unpaidInvoiceDetails: invoices
        .filter(i => i.paymentStatus === 'UNPAID' || i.paymentStatus === 'PARTIALLY_PAID')
        .map(i => ({
          number: i.number,
          customer: i.account?.name || 'Unknown',
          amountDue: i.amountDue,
          dueDate: i.dueDate,
          status: i.paymentStatus
        }))
    },
    quotations: {
      total: quotations.length,
      totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
      accepted: quotations.filter(q => q.status === 'ACCEPTED').length,
      sent: quotations.filter(q => q.status === 'SENT').length,
      draft: quotations.filter(q => q.status === 'DRAFT').length,
      rejected: quotations.filter(q => q.status === 'REJECTED').length,
      conversionRate: quotations.length > 0 ? (quotations.filter(q => q.status === 'ACCEPTED').length / quotations.length * 100) : 0
    },
    leads: {
      total: leads.length,
      new: leads.filter(l => l.status === 'NEW').length,
      qualified: leads.filter(l => l.status === 'QUALIFIED').length,
      contacted: leads.filter(l => l.status === 'CONTACTED').length,
      totalValue: leads.reduce((sum, l) => sum + (l.dealValue || 0), 0),
      sources: groupBy(leads, 'source'),
      leadsList: leads.slice(0, 10).map(l => ({
        name: `${l.firstName} ${l.lastName}`,
        company: l.company,
        status: l.status,
        source: l.source,
        dealValue: l.dealValue
      }))
    },
    opportunities: {
      total: opportunities.length,
      totalValue: opportunities.reduce((sum, o) => sum + (o.value || 0), 0),
      weightedValue: opportunities.reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0),
      won: opportunities.filter(o => o.stage === 'WON').length,
      lost: opportunities.filter(o => o.stage === 'LOST').length,
      active: opportunities.filter(o => !['WON', 'LOST'].includes(o.stage)).length,
      winRate: opportunities.length > 0 ? (opportunities.filter(o => o.stage === 'WON').length / opportunities.length * 100) : 0,
      opportunitiesList: opportunities.slice(0, 10).map(o => ({
        name: o.name,
        value: o.value,
        stage: o.stage,
        probability: o.probability
      }))
    },
    products: {
      total: products.length,
      active: products.filter(p => p.active).length,
      lowStockProducts: products.filter(p => {
        const totalQty = p.stockItems.reduce((sum, si) => sum + si.quantity, 0);
        const minReorder = p.stockItems.length > 0 ? Math.min(...p.stockItems.map(si => si.reorderPoint || 0)) : 0;
        return totalQty <= minReorder && totalQty > 0;
      }).map(p => ({
        name: p.name,
        sku: p.sku,
        quantity: p.stockItems.reduce((sum, si) => sum + si.quantity, 0),
        reorderPoint: p.stockItems.length > 0 ? Math.min(...p.stockItems.map(si => si.reorderPoint || 0)) : 0
      })),
      outOfStockProducts: products.filter(p => p.stockItems.reduce((sum, si) => sum + si.quantity, 0) === 0).map(p => ({
        name: p.name,
        sku: p.sku
      })),
      topSellers: products
        .sort((a, b) => (b._count.orderItems + b._count.invoiceLines) - (a._count.orderItems + a._count.invoiceLines))
        .slice(0, 10)
        .map(p => ({
          name: p.name,
          sku: p.sku,
          sales: p._count.orderItems + p._count.invoiceLines,
          stock: p.stockItems.reduce((sum, si) => sum + si.quantity, 0),
          price: p.price
        }))
    },
    orders: {
      total: orders.length,
      totalValue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      processing: orders.filter(o => o.status === 'PROCESSING').length,
      fulfillmentRate: orders.length > 0 ? (orders.filter(o => o.status === 'DELIVERED').length / orders.length * 100) : 0
    },
    returns: {
      total: returns.length,
      totalValue: returns.reduce((sum, r) => sum + r.total, 0),
      reasons: groupBy(returns, 'reason'),
      returnRate: orders.length > 0 ? (returns.length / orders.length * 100) : 0,
      returnsList: returns.slice(0, 10).map(r => ({
        number: r.number,
        reason: r.reason,
        amount: r.total,
        status: r.status
      }))
    },
    customers: {
      total: accounts.length,
      topCustomers: accounts
        .sort((a, b) => (b._count.invoices + b._count.quotations) - (a._count.invoices + a._count.quotations))
        .slice(0, 10).map(a => ({
          name: a.name,
          email: a.email,
          phone: a.phone,
          invoices: a._count.invoices,
          quotes: a._count.quotations,
          payments: a._count.payments,
          totalActivity: a._count.invoices + a._count.quotations + a._count.payments
        }))
    },
    payments: {
      total: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      byMethod: groupBy(payments, 'method')
    }
  };

  return metrics;
}

// Helper function
function groupBy(array: any[], field: string): { [key: string]: number } {
  return array.reduce((acc, item) => {
    const key = item[field] || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// Generate business report using AI
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Business Report API: Request received');
    console.log('📊 Business Report API: Request URL:', request.url);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('❌ Business Report API: Unauthorized - No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    console.log('📊 Business Report API: User ID:', userId);

    // Use the shared business report generator
    const { generateBusinessReport } = await import('@/lib/business-report-generator');
    const result = await generateBusinessReport(userId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate and send business report'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Business report sent successfully',
      recipients: result.recipients
    });
  } catch (error) {
    console.error('❌ Business Report API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate and send business report. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

