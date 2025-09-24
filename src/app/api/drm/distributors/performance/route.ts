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
    const timeRange = searchParams.get('timeRange') || '30d';
    const distributorId = searchParams.get('distributorId');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    if (distributorId) {
      whereClause.distributorId = distributorId;
    }

    // Get orders data
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        },
        distributor: true
      }
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers (distributors who placed orders)
    const uniqueCustomers = new Set(orders.map(order => order.distributorId)).size;

    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousOrders = await prisma.order.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const previousOrderCount = previousOrders.length;
    
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const orderGrowth = previousOrderCount > 0 
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    // Get top products
    const productStats = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId;
        const productName = item.product.name;
        const quantity = item.quantity;
        const revenue = item.quantity * (item.unitPrice || 0);

        if (productStats.has(productId)) {
          const existing = productStats.get(productId);
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productStats.set(productId, {
            name: productName,
            quantity,
            revenue
          });
        }
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // Get monthly trend
    const monthlyData = new Map();
    orders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (monthlyData.has(month)) {
        const existing = monthlyData.get(month);
        existing.revenue += order.totalAmount || 0;
        existing.orders += 1;
      } else {
        monthlyData.set(month, {
          month: order.createdAt.toLocaleDateString('en-US', { month: 'short' }),
          revenue: order.totalAmount || 0,
          orders: 1
        });
      }
    });

    const monthlyTrend = Array.from(monthlyData.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-4); // Last 4 months

    const performanceData = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      activeCustomers: uniqueCustomers,
      revenueGrowth,
      orderGrowth,
      topProducts,
      monthlyTrend
    };

    return NextResponse.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
