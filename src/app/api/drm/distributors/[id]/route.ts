import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;

    // Fetch distributor with all related data
    const distributor = await (prisma as any).distributor.findUnique({
      where: {
        id: distributorId
      },
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
      }
    });

    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: distributor
    });

  } catch (error) {
    console.error('Error fetching distributor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    const body = await request.json();

    // Update distributor
    const updatedDistributor = await (prisma as any).distributor.update({
      where: {
        id: distributorId
      },
      data: {
        ...body,
        updatedAt: new Date()
      },
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
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedDistributor
    });

  } catch (error) {
    console.error('Error updating distributor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;

    // Delete distributor and related data
    await (prisma as any).distributor.delete({
      where: {
        id: distributorId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting distributor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
