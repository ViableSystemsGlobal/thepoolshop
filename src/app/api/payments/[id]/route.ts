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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        account: {
          select: { id: true, name: true, email: true, phone: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        },
        allocations: {
          include: {
            invoice: {
              select: { 
                id: true, 
                number: true, 
                total: true, 
                amountPaid: true,
                amountDue: true,
                paymentStatus: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { reference, notes } = body;

    // Only allow updating reference and notes for now
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        reference: reference || null,
        notes: notes || null,
        updatedAt: new Date()
      },
      include: {
        account: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        },
        allocations: {
          include: {
            invoice: {
              select: { id: true, number: true, total: true }
            }
          }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Payment',
        entityId: payment.id,
        action: 'updated',
        details: { changes: { reference, notes } },
        userId: session.user.id
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;

    // Get payment details before deletion for activity log
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        allocations: {
          select: { invoiceId: true }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Delete payment and update invoice statuses in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete payment (allocations will be deleted due to cascade)
      await tx.payment.delete({
        where: { id }
      });

      // Update invoice payment statuses for all affected invoices
      for (const allocation of payment.allocations) {
        // Recalculate invoice payment status
        const invoice = await tx.invoice.findUnique({
          where: { id: allocation.invoiceId },
          include: {
            payments: {
              select: { amount: true }
            }
          }
        });

        if (invoice) {
          const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
          const amountDue = invoice.total - totalPaid;

          let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
          if (totalPaid === 0) {
            paymentStatus = 'UNPAID';
          } else if (totalPaid >= invoice.total) {
            paymentStatus = 'PAID';
          } else {
            paymentStatus = 'PARTIALLY_PAID';
          }

          await tx.invoice.update({
            where: { id: allocation.invoiceId },
            data: {
              amountPaid: totalPaid,
              amountDue: amountDue,
              paymentStatus: paymentStatus,
              paidDate: paymentStatus === 'PAID' ? new Date() : null
            }
          });
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Payment',
        entityId: id,
        action: 'deleted',
        details: { 
          paymentNumber: payment.number,
          amount: payment.amount 
        },
        userId: userId
      }
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
