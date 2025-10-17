import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
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

      // Recent Activity (last 10 activities)
      prisma.quotation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),

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

    // Format recent activity
    const formattedActivity = recentActivity.map((quote: any) => ({
      id: quote.id,
      type: 'quotation',
      title: `New quotation created`,
      description: `Quote #${quote.number} for Customer`,
      timestamp: quote.createdAt,
      amount: quote.total
    }));
    
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
        revenueChange: Math.round(revenueChange * 100) / 100
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
