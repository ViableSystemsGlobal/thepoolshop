import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReturnStatus } from '@prisma/client';

// Get a single return
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: {
        account: {
          select: { id: true, name: true, email: true, phone: true }
        },
        salesOrder: {
          select: { id: true, number: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, sellingPrice: true }
            }
          }
        }
      }
    });

    if (!returnRecord) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    return NextResponse.json(returnRecord);
  } catch (error) {
    console.error('Error fetching return:', error);
    return NextResponse.json({ error: 'Failed to fetch return' }, { status: 500 });
  }
}

// Update a return
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;
    const body = await request.json();
    const { status, refundAmount, refundMethod, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!Object.values(ReturnStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid return status' }, { status: 400 });
    }

    const updateData: any = {
      status,
      notes: notes || null,
      updatedAt: new Date()
    };

    // If status is APPROVED, set approver
    if (status === 'APPROVED') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    }

    // If status is REFUNDED or COMPLETED, set refund details
    if (status === 'REFUNDED' || status === 'COMPLETED') {
      if (refundAmount) {
        updateData.refundAmount = refundAmount;
      }
      if (refundMethod) {
        updateData.refundMethod = refundMethod;
      }
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: updateData,
      include: {
        account: {
          select: { id: true, name: true }
        },
        salesOrder: {
          select: { id: true, number: true }
        },
        creator: {
          select: { id: true, name: true }
        },
        approver: {
          select: { id: true, name: true }
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Return',
        entityId: updatedReturn.id,
        action: 'updated',
        details: { returnNumber: updatedReturn.number, status: updatedReturn.status },
        userId: userId,
      },
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return:', error);
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 });
  }
}

// Delete a return
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get return details before deleting
    const returnToDelete = await prisma.return.findUnique({
      where: { id },
      select: { number: true, status: true }
    });

    if (!returnToDelete) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    // Only allow deletion of pending or rejected returns
    if (returnToDelete.status !== 'PENDING' && returnToDelete.status !== 'REJECTED') {
      return NextResponse.json({ 
        error: 'Only pending or rejected returns can be deleted',
        details: `Current status: ${returnToDelete.status}`
      }, { status: 400 });
    }

    // Delete the return (lines will be deleted automatically due to cascade)
    await prisma.return.delete({
      where: { id }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Return',
        entityId: id,
        action: 'deleted',
        details: { returnNumber: returnToDelete.number },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Return deleted successfully' });
  } catch (error) {
    console.error('Error deleting return:', error);
    return NextResponse.json({ error: 'Failed to delete return' }, { status: 500 });
  }
}

