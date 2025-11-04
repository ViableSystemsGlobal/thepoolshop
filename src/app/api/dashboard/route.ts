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
    
    const userId = (session.user as any).id;

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    
    // Calculate dates for last 7 days trend data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });
    
    const last8Days = Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (7 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Fetch all metrics in parallel
    const [
      totalProducts,
      totalCustomers,
      pendingQuotations,
      monthlyRevenue,
      lastMonthRevenue,
      revenueYTD,
      recentActivity,
      lowStockItems,
      overdueInvoices,
      pendingApprovals
    ] = await Promise.all([
      // Total Products
      prisma.product.count(),

      // Total Customers (Accounts)
      prisma.account.count(),

      // Pending Quotations
      prisma.quotation.count({
        where: {
          status: {
            in: ['DRAFT', 'SENT']
          }
        }
      }),

      // Monthly Revenue (Paid Invoices)
      prisma.invoice.aggregate({
        where: {
          paymentStatus: 'PAID' as any,
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          total: true
        }
      }),

      // Last Month Revenue for comparison
      prisma.invoice.aggregate({
        where: {
          paymentStatus: 'PAID' as any,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          total: true
        }
      }),

      // Revenue YTD (Year-to-Date: from January 1st to now)
      prisma.invoice.aggregate({
        where: {
          paymentStatus: 'PAID' as any,
          createdAt: {
            gte: startOfYear
          }
        },
        _sum: {
          total: true
        }
      }),

      // Recent Activity (multiple types)
      Promise.all([
        // Recent Quotations
        prisma.quotation.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            account: { select: { name: true } },
            distributor: { select: { businessName: true } },
            lead: { select: { firstName: true, lastName: true, company: true } }
          }
        }),
        // Recent Invoices
        prisma.invoice.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            account: { select: { name: true } },
            distributor: { select: { businessName: true } },
            lead: { select: { firstName: true, lastName: true, company: true } }
          }
        }),
        // Recent Customers (Accounts)
        prisma.account.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' }
        }),
        // Recent Leads
        prisma.lead.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' }
        }),
        // Recent Products
        prisma.product.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' }
        }),
        // Recent Payments
        prisma.payment.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            account: { select: { name: true } },
            allocations: {
              include: {
                invoice: { select: { number: true } }
              }
            }
          }
        })
      ]),

      // Low Stock Items (stock below reorder point)
      prisma.stockItem.count({
        where: {
          quantity: {
            lte: 10 // Default reorder point threshold
          }
        }
      }),

      // Overdue Invoices (unpaid invoices older than 30 days)
      prisma.invoice.count({
        where: {
          status: 'SENT' as any,
          dueDate: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Pending Approvals (draft quotations, pending orders, etc.)
      prisma.quotation.count({
        where: {
          status: 'DRAFT'
        }
      })
    ]);

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue._sum.total 
      ? ((monthlyRevenue._sum.total || 0) - lastMonthRevenue._sum.total) / lastMonthRevenue._sum.total * 100
      : 0;
    
    // Extract revenue YTD value
    const revenueYTDValue = revenueYTD._sum.total || 0;

    // Format recent activity from multiple sources
    const [recentQuotations, recentInvoices, recentCustomers, recentLeads, recentProducts, recentPayments] = recentActivity;
    
    const allActivities = [
      // Format quotations
      ...recentQuotations.map((quote: any) => {
        const customerName = quote.account?.name || 
                           quote.distributor?.businessName || 
                           (quote.lead ? `${quote.lead.firstName} ${quote.lead.lastName}`.trim() : 'Customer');
        return {
          id: quote.id,
          type: 'quotation',
          title: 'New quotation created',
          description: `Quote #${quote.number} for ${customerName}`,
          timestamp: quote.createdAt,
          amount: quote.total
        };
      }),
      // Format invoices
      ...recentInvoices.map((invoice: any) => {
        const customerName = invoice.account?.name || 
                           invoice.distributor?.businessName || 
                           (invoice.lead ? `${invoice.lead.firstName} ${invoice.lead.lastName}`.trim() : 'Customer');
        return {
          id: invoice.id,
          type: 'invoice',
          title: 'New invoice created',
          description: `Invoice #${invoice.number} for ${customerName}`,
          timestamp: invoice.createdAt,
          amount: invoice.total
        };
      }),
      // Format customers
      ...recentCustomers.map((customer: any) => ({
        id: customer.id,
        type: 'customer',
        title: 'New customer added',
        description: `Account: ${customer.name}`,
        timestamp: customer.createdAt,
        amount: 0
      })),
      // Format leads
      ...recentLeads.map((lead: any) => ({
        id: lead.id,
        type: 'lead',
        title: 'New lead captured',
        description: `${lead.firstName} ${lead.lastName}${lead.company ? ` from ${lead.company}` : ''}`,
        timestamp: lead.createdAt,
        amount: lead.dealValue || 0
      })),
      // Format products
      ...recentProducts.map((product: any) => ({
        id: product.id,
        type: 'product',
        title: 'New product added',
        description: `Product: ${product.name}`,
        timestamp: product.createdAt,
        amount: product.price || 0
      })),
      // Format payments
      ...recentPayments.map((payment: any) => {
        const invoiceNumbers = payment.allocations?.map((allocation: any) => allocation.invoice?.number).filter(Boolean);
        const invoiceText = invoiceNumbers?.length > 0 
          ? `for Invoice${invoiceNumbers.length > 1 ? 's' : ''} #${invoiceNumbers.join(', #')}`
          : 'from customer';
        return {
          id: payment.id,
          type: 'payment',
          title: 'Payment received',
          description: `Payment ${invoiceText} (${payment.account?.name || 'Customer'})`,
          timestamp: payment.createdAt,
          amount: payment.amount
        };
      })
    ];
    
    // Sort by timestamp and take the most recent 5 activities
    const formattedActivity = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    // Fetch trend data for last 7 days
    const productsTrend = await Promise.all(
      last7Days.map(async (date, index) => {
        const nextDate = index < last7Days.length - 1 ? last7Days[index + 1] : new Date();
        const count = await prisma.product.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });
        return count;
      })
    );
    
    const customersTrend = await Promise.all(
      last7Days.map(async (date, index) => {
        const nextDate = index < last7Days.length - 1 ? last7Days[index + 1] : new Date();
        const count = await prisma.account.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });
        return count;
      })
    );
    
    const quotationsTrend = await Promise.all(
      last7Days.map(async (date, index) => {
        const nextDate = index < last7Days.length - 1 ? last7Days[index + 1] : new Date();
        const count = await prisma.quotation.count({
          where: {
            status: {
              in: ['DRAFT', 'SENT']
            },
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });
        return count;
      })
    );
    
    const revenueTrend = await Promise.all(
      last7Days.map(async (date, index) => {
        const nextDate = index < last7Days.length - 1 ? last7Days[index + 1] : new Date();
        const result = await prisma.invoice.aggregate({
          where: {
            paymentStatus: 'PAID' as any,
            createdAt: {
              gte: date,
              lt: nextDate
            }
          },
          _sum: {
            total: true
          }
        });
        return result._sum.total || 0;
      })
    );

    return NextResponse.json({
      metrics: {
        totalProducts,
        totalCustomers,
        pendingQuotations,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        revenueChange: Math.round(revenueChange * 100) / 100,
        revenueYTD: revenueYTDValue
      },
      trends: {
        productsTrend,
        customersTrend,
        quotationsTrend,
        revenueTrend
      },
      shortcuts: {
        approvals: pendingApprovals,
        overdueInvoices,
        lowStock: lowStockItems
      },
      recentActivity: formattedActivity
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
