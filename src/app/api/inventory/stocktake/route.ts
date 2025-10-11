import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/inventory/stocktake - Get all stocktake sessions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const stocktakes = await prisma.stocktakeSession.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        warehouse: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ stocktakes });
  } catch (error) {
    console.error('Error fetching stocktakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocktakes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/stocktake - Create new stocktake session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { warehouseId, name, notes } = await request.json();
    
    if (!warehouseId) {
      return NextResponse.json(
        { error: 'Warehouse is required' },
        { status: 400 }
      );
    }
    
    // Generate session number
    const count = await prisma.stocktakeSession.count();
    const sessionNumber = `ST-${String(count + 1).padStart(6, '0')}`;
    
    const stocktake = await prisma.stocktakeSession.create({
      data: {
        sessionNumber,
        name: name || `Stocktake ${new Date().toLocaleDateString()}`,
        warehouseId,
        status: 'IN_PROGRESS',
        notes,
        createdBy: session.user.id,
        startedAt: new Date()
      },
      include: {
        warehouse: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(stocktake, { status: 201 });
  } catch (error) {
    console.error('Error creating stocktake:', error);
    return NextResponse.json(
      { error: 'Failed to create stocktake session' },
      { status: 500 }
    );
  }
}

