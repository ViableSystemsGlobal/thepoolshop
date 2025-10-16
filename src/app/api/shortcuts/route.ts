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

    // Fetch shortcut counts in parallel
    const [
      pendingApprovals,
      overdueInvoices,
      lowStockItems
    ] = await Promise.all([
      // Pending Approvals (draft quotations, pending orders, etc.)
      prisma.quotation.count({
        where: {
          status: 'DRAFT'
        }
      }),

      // Overdue Invoices (unpaid invoices older than 30 days)
      prisma.invoice.count({
        where: {
          status: 'SENT',
          dueDate: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Low Stock Items (stock below reorder point)
      prisma.stockItem.count({
        where: {
          quantity: {
            lte: prisma.stockItem.fields.reorderPoint
          }
        }
      })
    ]);

    return NextResponse.json({
      approvals: pendingApprovals,
      overdueInvoices,
      lowStock: lowStockItems
    });

  } catch (error) {
    console.error('Error fetching shortcuts data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortcuts data' },
      { status: 500 }
    );
  }
}
