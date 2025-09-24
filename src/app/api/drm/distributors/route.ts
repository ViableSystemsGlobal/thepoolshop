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
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Fetch distributors with related data
    const distributors = await prisma.distributor.findMany({
      where,
      include: {
        images: true,
        interestedProducts: {
          include: {
            product: true
          }
        },
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        approvedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: distributors
    });

  } catch (error) {
    console.error('Error fetching distributors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
