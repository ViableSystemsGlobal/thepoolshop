import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { distributorIds } = body;

    if (!distributorIds || !Array.isArray(distributorIds) || distributorIds.length === 0) {
      return NextResponse.json({ 
        error: 'Distributor IDs are required' 
      }, { status: 400 });
    }

    // Delete distributors (this will cascade delete related records due to Prisma relations)
    const result = await prisma.distributor.deleteMany({
      where: {
        id: {
          in: distributorIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} distributors`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Error bulk deleting distributors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
