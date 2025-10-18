import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to generate payment number
async function generatePaymentNumber(): Promise<string> {
  const count = await prisma.payment.count();
  const nextNumber = count + 1;
  return `PAY-${nextNumber.toString().padStart(6, '0')}`;
}

// Helper function to update invoice payment status
async function updateInvoicePaymentStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: {
        select: { amount: true }
      }
    }
  });

  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const amountDue = invoice.total - totalPaid;

  let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  if (totalPaid === 0) {
    paymentStatus = 'UNPAID';
  } else if (totalPaid >= invoice.total) {
    paymentStatus = 'PAID';
  } else {
    paymentStatus = 'PARTIALLY_PAID';
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: totalPaid,
      amountDue: amountDue,
      paymentStatus: paymentStatus,
      paidDate: paymentStatus === 'PAID' ? new Date() : null
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const invoiceId = searchParams.get('invoiceId');
    const method = searchParams.get('method');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {};
    
    if (accountId) {
      where.accountId = accountId;
    }
    
    if (method) {
      where.method = method;
    }
    
    if (dateFrom || dateTo) {
      where.receivedAt = {};
      if (dateFrom) where.receivedAt.gte = new Date(dateFrom);
      if (dateTo) where.receivedAt.lte = new Date(dateTo);
    }

    // If invoiceId is specified, get payments for that specific invoice
    if (invoiceId) {
      where.allocations = {
        some: {
          invoiceId: invoiceId
        }
      };
    }

    // Get total count
    const total = await prisma.payment.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get paginated payments
    const payments = await prisma.payment.findMany({
      where,
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
      },
      orderBy: { receivedAt: 'desc' },
      skip,
      take: limit
    });

    // Get all payments for metrics (without pagination)
    const allPayments = await prisma.payment.findMany({
      where,
      select: {
        id: true,
        amount: true,
        receivedAt: true
      },
      orderBy: { receivedAt: 'desc' }
    });

    return NextResponse.json({ 
      payments, 
      total,
      page,
      limit,
      allPayments 
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    const {
      accountId,
      amount,
      method,
      reference,
      notes,
      invoiceAllocations = [] // Array of { invoiceId, amount }
    } = body;

    // Validation
    if (!accountId || !amount || !method) {
      return NextResponse.json(
        { error: 'Account ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate allocations don't exceed payment amount
    const totalAllocated = invoiceAllocations.reduce((sum: number, alloc: any) => sum + alloc.amount, 0);
    if (totalAllocated > amount) {
      return NextResponse.json(
        { error: 'Total allocated amount cannot exceed payment amount' },
        { status: 400 }
      );
    }

    // Generate payment number
    const paymentNumber = await generatePaymentNumber();

    // Create payment with allocations in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      // Create the payment
      const newPayment = await tx.payment.create({
        data: {
          number: paymentNumber,
          accountId,
          amount,
          method,
          reference: reference || null,
          notes: notes || null,
          receivedBy: userId
        },
        include: {
          account: {
            select: { id: true, name: true, email: true }
          },
          receiver: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Create payment allocations
      if (invoiceAllocations.length > 0) {
        await tx.paymentAllocation.createMany({
          data: invoiceAllocations.map((alloc: any) => ({
            paymentId: newPayment.id,
            invoiceId: alloc.invoiceId,
            amount: alloc.amount,
            notes: alloc.notes || null
          }))
        });

        // Update invoice payment statuses directly in transaction
        for (const alloc of invoiceAllocations) {
          const invoice = await tx.invoice.findUnique({
            where: { id: alloc.invoiceId },
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
              where: { id: alloc.invoiceId },
              data: {
                amountPaid: totalPaid,
                amountDue: amountDue,
                paymentStatus: paymentStatus,
                paidDate: paymentStatus === 'PAID' ? new Date() : null
              }
            });
          }
        }
      }

      return newPayment;
    }, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Payment',
        entityId: payment.id,
        action: 'created',
        details: { 
          paymentNumber: payment.number,
          amount: payment.amount,
          method: payment.method,
          allocations: invoiceAllocations
        },
        userId: userId
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
