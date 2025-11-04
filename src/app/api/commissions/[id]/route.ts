import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const commission = await prisma.commission.findUnique({
      where: { id: params.id },
      include: {
        agent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        invoice: {
          select: {
            id: true,
            number: true,
            total: true,
            account: {
              select: { id: true, name: true }
            }
          }
        },
        quotation: {
          select: {
            id: true,
            number: true,
            total: true,
            account: {
              select: { id: true, name: true }
            }
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            distributor: {
              select: { id: true, businessName: true }
            }
          }
        },
        opportunity: {
          select: {
            id: true,
            name: true,
            value: true,
            account: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!commission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Error fetching commission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const {
      status,
      paidDate,
      paymentMethod,
      paymentReference,
      notes
    } = body;

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id: params.id }
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Update commission
    const commission = await prisma.commission.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(paidDate !== undefined && { 
          paidDate: paidDate ? new Date(paidDate) : null 
        }),
        ...(paymentMethod !== undefined && { paymentMethod: paymentMethod || null }),
        ...(paymentReference !== undefined && { paymentReference: paymentReference || null }),
        ...(notes !== undefined && { notes: notes || null })
      },
      include: {
        agent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Commission updated: ${commission.id}`);

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json(
      { error: 'Failed to update commission' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if commission exists
    const commission = await prisma.commission.findUnique({
      where: { id: params.id }
    });

    if (!commission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Check if commission is already paid
    if (commission.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid commission. Cancel it instead.' },
        { status: 400 }
      );
    }

    // Delete commission
    await prisma.commission.delete({
      where: { id: params.id }
    });

    console.log(`✅ Commission deleted: ${commission.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting commission:', error);
    return NextResponse.json(
      { error: 'Failed to delete commission' },
      { status: 500 }
    );
  }
}

