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
    const { distributorIds, updates } = body;

    if (!distributorIds || !Array.isArray(distributorIds) || distributorIds.length === 0) {
      return NextResponse.json({ 
        error: 'Distributor IDs are required' 
      }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: 'Updates are required' 
      }, { status: 400 });
    }

    // Validate status if provided
    if (updates.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(updates.status)) {
      return NextResponse.json({ 
        error: 'Invalid status value' 
      }, { status: 400 });
    }

    // Update distributors
    const result = await prisma.distributor.updateMany({
      where: {
        id: {
          in: distributorIds
        }
      },
      data: updates
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} distributors`,
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Error bulk updating distributors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
