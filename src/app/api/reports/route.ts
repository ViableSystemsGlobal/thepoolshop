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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let trendDays: number;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        trendDays = 7;
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        trendDays = 7; // Show last 7 days trend
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        trendDays = 14; // Show last 14 days trend
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        trendDays = 30; // Show last 30 days trend
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        trendDays = 7;
    }

    // Generate trend data points for the last N days
    const trendDates = Array.from({ length: trendDays }, (_, i) => {
      const date = new Date(now.getTime() - (trendDays - 1 - i) * 24 * 60 * 60 * 1000);
      return date;
    });

    // Fetch all data in parallel
    const results = await Promise.all([
      // Sales queries
      prisma.invoice.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true }
      }),
      
      prisma.invoice.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate }
        },
        _sum: { total: true }
      }),
      
      prisma.invoice.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate
          }
        },
        _sum: { total: true }
      }),
      
      prisma.invoiceLine.groupBy({
        by: ['productName'],
        where: {
          invoice: {
            paymentStatus: 'PAID',
            createdAt: { gte: startDate }
          }
        },
        _sum: { lineTotal: true },
        _count: { quantity: true },
        orderBy: { _sum: { lineTotal: 'desc' } },
        take: 10
      }),
      
      // Revenue by month (last 12 months) - simplified for now
      Promise.resolve([]),
      
      // Customer queries
      prisma.account.count(),
      
      prisma.account.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      prisma.account.count({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate
          }
        }
      }),
      
      prisma.account.findMany({
        where: {
          invoices: {
            some: {
              paymentStatus: 'PAID',
              createdAt: { gte: startDate }
            }
          }
        },
        include: {
          _count: {
            select: {
              invoices: {
                where: {
                  paymentStatus: 'PAID',
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        },
        take: 10
      }),
      
      // Inventory queries
      prisma.product.count(),
      
      prisma.stockItem.count({
        where: { quantity: { lte: 10 } }
      }),
      
      // Get all stock items with cost and quantity for currency conversion
      prisma.stockItem.findMany({
        select: {
          quantity: true,
          averageCost: true
        }
      }),
      
      // Get total stock units count
      prisma.stockItem.aggregate({
        _sum: {
          quantity: true
        }
      }),
      
      prisma.stockItem.findMany({
        where: {
          quantity: { gt: 0 }
        },
        include: {
          product: true
        },
        orderBy: { quantity: 'desc' },
        take: 10
      }),
      
      // Quotation queries
      prisma.quotation.count(),
      
      prisma.quotation.count({
        where: { status: { in: ['DRAFT', 'SENT'] } }
      }),
      
      prisma.quotation.count({
        where: { status: 'ACCEPTED' }
      }),
      
      prisma.quotation.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Invoice queries
      prisma.invoice.count(),
      
      prisma.invoice.count({
        where: { paymentStatus: 'PAID' }
      }),
      
      prisma.invoice.count({
        where: {
          paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] },
          dueDate: { lt: now }
        }
      }),
      
      prisma.invoice.aggregate({
        where: {
          paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] }
        },
        _sum: { amountDue: true }
      }),
      
      // Total orders (paid invoices count)
      prisma.invoice.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate }
        }
      }),
      
      // Daily revenue data for chart (fetch all paid invoices and group in JS)
      prisma.invoice.findMany({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          total: true
        },
        orderBy: { createdAt: 'asc' }
      }),
      
      // CRM queries
      // Total leads (using Lead model which represents opportunities)
      prisma.lead.count(),
      
      // New leads this period
      prisma.lead.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total opportunities (leads that have quotes)
      prisma.lead.count({
        where: {
          status: { in: ['QUOTE_SENT', 'NEGOTIATION', 'WON', 'LOST'] }
        }
      }),
      
      // Won opportunities
      prisma.lead.count({
        where: {
          status: 'WON'
        }
      }),
      
      // Leads by source
      prisma.lead.groupBy({
        by: ['source'],
        _count: { source: true }
      }),
      
      // DRM queries
      // Total distributors
      prisma.distributor.count(),
      
      // Active distributors (those with status ACTIVE)
      prisma.distributor.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // New distributors this period
      prisma.distributor.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Distributor leads
      prisma.distributorLead.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Top distributors by order count
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          distributor: {
            select: {
              id: true,
              businessName: true,
              region: true
            }
          }
        }
      }),
      
      // Revenue trend - simplified for now
      Promise.resolve([]),
      
      // Customers trend - simplified for now
      Promise.resolve([]),
      
      // Products trend - simplified for now
      Promise.resolve([]),
      
      // Quotations trend - simplified for now
      Promise.resolve([]),
      
      // Agents queries
      prisma.agent.count(),
      
      prisma.agent.count({
        where: { status: 'ACTIVE' }
      }),
      
      prisma.commission.aggregate({
        _sum: { commissionAmount: true }
      }),
      
      prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: { commissionAmount: true }
      }),
      
      prisma.commission.aggregate({
        where: { status: 'PAID' },
        _sum: { commissionAmount: true }
      }),
      
      prisma.agent.findMany({
        include: {
          user: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              commissions: true
            }
          }
        },
        orderBy: {
          commissions: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      prisma.commission.groupBy({
        by: ['status'],
        _sum: { commissionAmount: true },
        _count: true
      }),
      
      // Commissions by month (last 12 months)
      prisma.commission.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // 12 months ago
          }
        },
        select: {
          createdAt: true,
          commissionAmount: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Destructure results
    const [
      // Sales data
      totalRevenue,
      monthlyRevenue,
      lastPeriodRevenue,
      topProducts,
      revenueByMonth,
      
      // Customer data
      totalCustomers,
      newCustomers,
      lastPeriodCustomers,
      topCustomers,
      
      // Inventory data
      totalProducts,
      lowStockItems,
      inventoryValue,
      totalStockUnits,
      topMovingProducts,
      
      // Quotation data
      totalQuotations,
      pendingQuotations,
      acceptedQuotations,
      quotationsByStatus,
      
      // Invoice data
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalOutstanding,
      
      // Additional sales metrics
      totalOrders,
      dailyRevenueData,
      
      // CRM data
      totalLeads,
      newLeads,
      totalOpportunities,
      wonOpportunities,
      leadsBySource,
      
      // DRM data
      totalDistributors,
      activeDistributors,
      newDistributors,
      distributorLeads,
      topDistributors,
      
      // Trend data
      revenueTrend,
      customersTrend,
      productsTrend,
      quotationsTrend,
      
      // Agents data
      totalAgents,
      activeAgents,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      topPerformers,
      commissionsByStatus,
      commissionsByMonth
    ] = results as any;

    // Agents data is now destructured above

    console.log('🔍 Reports API Debug - Results length:', results.length);
    console.log('🔍 Reports API Debug - Results[33]:', results[33]);
    console.log('🔍 Reports API Debug - Results[34]:', results[34]);
    console.log('🔍 Reports API Debug - Results[35]:', results[35]);
    console.log('🔍 Reports API Debug - Results[36]:', results[36]);
    console.log('🔍 Reports API Debug - Results[37]:', results[37]);
    console.log('🔍 Reports API Debug - Results[38]:', results[38]);
    console.log('🔍 Reports API Debug - Agents data:', {
      totalAgents,
      activeAgents,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      topPerformersLength: topPerformers?.length,
      commissionsByStatusLength: commissionsByStatus?.length,
      commissionsByMonthLength: commissionsByMonth?.length
    });

    // Calculate growth percentages
    const revenueGrowth = lastPeriodRevenue._sum.total 
      ? ((monthlyRevenue._sum.total || 0) - lastPeriodRevenue._sum.total) / lastPeriodRevenue._sum.total * 100
      : 0;
    
    const customerGrowth = lastPeriodCustomers 
      ? ((newCustomers - lastPeriodCustomers) / lastPeriodCustomers * 100)
      : 0;

    // Calculate conversion rate
    const conversionRate = totalQuotations > 0 
      ? (acceptedQuotations / totalQuotations) * 100 
      : 0;
    
    // Calculate AOV (Average Order Value)
    const aov = totalOrders > 0 
      ? (monthlyRevenue._sum.total || 0) / totalOrders 
      : 0;
    
    // Process daily revenue data for charts (group by date)
    const revenueByDate = new Map<string, { revenue: number; orders: number }>();
    
    dailyRevenueData.forEach((invoice: any) => {
      const dateKey = new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = revenueByDate.get(dateKey) || { revenue: 0, orders: 0 };
      revenueByDate.set(dateKey, {
        revenue: existing.revenue + (invoice.total || 0),
        orders: existing.orders + 1
      });
    });
    
    // Generate complete date range for the selected period
    const generateDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };
    
    const dateRange = generateDateRange(startDate, now);
    const processedDailyRevenue = dateRange.map(date => {
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const data = revenueByDate.get(dateKey) || { revenue: 0, orders: 0 };
      return {
        date: dateKey,
        revenue: data.revenue,
        orders: data.orders
      };
    });
    
    // Calculate CRM metrics
    const leadConversionRate = totalLeads > 0 
      ? (wonOpportunities / totalLeads) * 100 
      : 0;
    
    const opportunityWinRate = totalOpportunities > 0 
      ? (wonOpportunities / totalOpportunities) * 100 
      : 0;
    
    // Process leads by source
    const processedLeadsBySource = leadsBySource.map((item: any) => ({
      source: item.source || 'Unknown',
      count: item._count.source
    }));
    
    // Calculate DRM metrics
    const distributorConversionRate = distributorLeads > 0 
      ? (activeDistributors / distributorLeads) * 100 
      : 0;
    
    // Process top distributors (aggregate manually from orders)
    const distributorMap = new Map<string, { name: string; region: string; orders: number; revenue: number }>();
    
    topDistributors.forEach((order: any) => {
      if (!order.distributor) return;
      
      const distId = order.distributor.id;
      const existing = distributorMap.get(distId) || {
        name: order.distributor.businessName || 'Unknown',
        region: order.distributor.region || 'Unknown',
        orders: 0,
        revenue: 0
      };
      
      distributorMap.set(distId, {
        ...existing,
        orders: existing.orders + 1,
        revenue: existing.revenue + Number(order.totalAmount || 0)
      });
    });
    
    const processedTopDistributors = Array.from(distributorMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Process agents data
    const processedTopPerformers = topPerformers ? await Promise.all(
      topPerformers.map(async (agent: any) => {
        const agentCommissions = await prisma.commission.aggregate({
          where: { agentId: agent.id },
          _sum: { commissionAmount: true }
        });
        
        return {
          name: agent.user?.name || 'Unknown',
          agentCode: agent.agentCode,
          totalCommissions: Number(((agentCommissions._sum.commissionAmount || 0)).toFixed(2)),
          commissionCount: agent._count.commissions,
          territory: agent.territory || 'Unknown'
        };
      })
    ) : [];
    
    const processedCommissionsByStatus = commissionsByStatus ? commissionsByStatus.map((status: any) => ({
      status: status.status,
      count: status._count,
      amount: Number(((status._sum.commissionAmount || 0)).toFixed(2))
    })) : [];
    
    // Process commissions by month from individual commission records
    const processedCommissionsByMonth = commissionsByMonth ? (() => {
      // Group commissions by month
      const monthlyData = new Map();
      
      (commissionsByMonth as any[]).forEach((commission) => {
        const date = new Date(commission.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthKey,
            amount: 0,
            count: 0
          });
        }
        
        const monthData = monthlyData.get(monthKey);
        monthData.amount += commission.commissionAmount || 0;
        monthData.count += 1;
      });
      
      // Convert to array and format
      return Array.from(monthlyData.values())
        .sort((a, b) => b.month.localeCompare(a.month))
        .map((item) => {
          const [year, month] = item.month.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          
          return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            amount: Number(item.amount.toFixed(2)),
            count: item.count
          };
        });
    })() : [];

    // Create commissions trend data (similar to revenue trend)
    const commissionsTrend = processedCommissionsByMonth.map(item => item.amount);

    // Process top customers data
    const processedTopCustomers = await Promise.all(
      topCustomers.map(async (customer: any) => {
        const customerRevenue = await prisma.invoice.aggregate({
          where: {
            accountId: customer.id,
            paymentStatus: 'PAID',
            createdAt: { gte: startDate }
          },
          _sum: { total: true }
        });
        
        return {
          name: customer.name,
          revenue: customerRevenue._sum.total || 0,
          orders: customer._count.invoices
        };
      })
    );

    // Process top moving products
    const processedTopMovingProducts = topMovingProducts.map((item: any) => ({
      name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      value: (item.quantity || 0) * (item.product?.price || 0)
    }));

    // Process quotations by status
    const processedQuotationsByStatus = quotationsByStatus.map((status: any) => ({
      status: status.status,
      count: status._count.status
    }));

    // Process revenue by month
    const processedRevenueByMonth = (revenueByMonth as any[]).map((item) => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: Number(item.revenue) || 0
    }));

    const reportData = {
      sales: {
        totalRevenue: totalRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        revenueGrowth,
        totalOrders,
        aov,
        topProducts: topProducts.map((product: any) => ({
          name: product.productName || 'Unknown Product',
          revenue: product._sum.lineTotal || 0,
          quantity: product._count.quantity || 0
        })),
        revenueByMonth: processedRevenueByMonth,
        revenueTrend,
        dailyRevenue: processedDailyRevenue
      },
      customers: {
        totalCustomers,
        newCustomers,
        customerGrowth,
        topCustomers: processedTopCustomers.sort((a, b) => b.revenue - a.revenue),
        customersTrend
      },
      inventory: {
        totalProducts,
        lowStockItems,
        totalValue: inventoryValue ? inventoryValue.reduce((sum: number, item: any) => {
          // Convert USD to GHS (assuming cost is in USD)
          const costInUSD = item.averageCost || 0;
          const quantity = item.quantity || 0;
          const usdToGhsRate = 12.5; // USD to GHS conversion rate
          const valueInGHS = (costInUSD * quantity) * usdToGhsRate;
          return sum + valueInGHS;
        }, 0) : 0,
        totalStockUnits: totalStockUnits?._sum.quantity || 0,
        topMovingProducts: processedTopMovingProducts,
        productsTrend
      },
      quotations: {
        totalQuotations,
        pendingQuotations,
        conversionRate,
        quotationsByStatus: processedQuotationsByStatus,
        quotationsTrend
      },
      invoices: {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        totalOutstanding: totalOutstanding._sum.amountDue || 0
      },
      crm: {
        totalLeads,
        newLeads,
        totalOpportunities,
        wonOpportunities,
        leadConversionRate,
        opportunityWinRate,
        leadsBySource: processedLeadsBySource
      },
      drm: {
        totalDistributors,
        activeDistributors,
        newDistributors,
        distributorLeads,
        distributorConversionRate,
        topDistributors: processedTopDistributors
      },
      agents: {
        totalAgents: totalAgents || 0,
        activeAgents: activeAgents || 0,
        totalCommissions: Number((totalCommissions?._sum.commissionAmount || 0).toFixed(2)),
        pendingCommissions: Number((pendingCommissions?._sum.commissionAmount || 0).toFixed(2)),
        paidCommissions: Number((paidCommissions?._sum.commissionAmount || 0).toFixed(2)),
        topPerformers: processedTopPerformers,
        commissionsByStatus: processedCommissionsByStatus,
        commissionsByMonth: processedCommissionsByMonth,
        commissionsTrend
      }
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
