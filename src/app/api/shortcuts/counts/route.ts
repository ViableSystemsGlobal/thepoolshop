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

    const today = new Date();

    // Get overdue tasks count
    const overdueTasks = await prisma.task.count({
      where: {
        status: 'OVERDUE'
      }
    });

    // Get overdue unpaid invoices count
    const overdueInvoices = await prisma.invoice.count({
      where: {
        status: 'OVERDUE',
        paymentStatus: {
          in: ['UNPAID', 'PARTIALLY_PAID']
        }
      }
    });

    // Get low/no stock items count
    const products = await prisma.product.findMany({
      include: {
        stockItems: {
          select: {
            available: true,
            reorderPoint: true
          }
        }
      }
    });

    // Count products that are low stock or out of stock
    const lowStock = products.filter(product => {
      const totalAvailable = product.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
      const maxReorderPoint = product.stockItems?.reduce((max, item) => Math.max(max, item.reorderPoint), 0) || 0;
      
      // Include items that are out of stock (0) or low stock (below reorder point)
      return totalAvailable === 0 || (totalAvailable > 0 && totalAvailable <= maxReorderPoint);
    }).length;

    return NextResponse.json({
      overdueTasks,
      overdueInvoices,
      lowStock
    });

  } catch (error) {
    console.error('Error fetching shortcut counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortcut counts' },
      { status: 500 }
    );
  }
}

