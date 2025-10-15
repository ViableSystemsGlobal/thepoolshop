import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReturnReason, ReturnStatus } from '@prisma/client';

// Helper function to generate return number
async function generateReturnNumber(): Promise<string> {
  const count = await prisma.return.count();
  const nextNumber = count + 1;
  return `RET-${nextNumber.toString().padStart(6, '0')}`;
}

// Get returns with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (accountId) {
      where.accountId = accountId;
    }
    if (status) {
      where.status = status;
    }
    if (reason) {
      where.reason = reason;
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { account: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [returns, total] = await prisma.$transaction([
      prisma.return.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: {
            select: { id: true, name: true, email: true, phone: true }
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
      }),
      prisma.return.count({ where })
    ]);

    return NextResponse.json({ returns, total });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

// Create a new return
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      salesOrderId,
      accountId,
      reason,
      notes,
      lines = []
    } = body;

    if (!salesOrderId || !accountId || !reason) {
      return NextResponse.json({ error: 'Sales order, account, and reason are required' }, { status: 400 });
    }

    if (!Object.values(ReturnReason).includes(reason)) {
      return NextResponse.json({ error: 'Invalid return reason' }, { status: 400 });
    }

    if (lines.length === 0) {
      return NextResponse.json({ error: 'At least one return line is required' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = lines.reduce((sum: number, line: any) => sum + line.lineTotal, 0);
    const tax = subtotal * 0.15; // 15% tax (adjust as needed)
    const total = subtotal + tax;

    // Generate return number
    const returnNumber = await generateReturnNumber();

    // Create the return
    const returnRecord = await prisma.return.create({
      data: {
        number: returnNumber,
        salesOrderId,
        accountId,
        reason,
        status: 'PENDING',
        subtotal,
        tax,
        total,
        refundAmount: 0,
        notes: notes || null,
        createdBy: userId,
        lines: {
          create: lines.map((line: any) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            reason: line.reason || null
          }))
        }
      },
      include: {
        account: {
          select: { id: true, name: true, email: true }
        },
        salesOrder: {
          select: { id: true, number: true }
        },
        creator: {
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
        entityId: returnRecord.id,
        action: 'created',
        details: { returnNumber: returnRecord.number, total: returnRecord.total, reason: returnRecord.reason },
        userId: userId,
      },
    });

    return NextResponse.json(returnRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 });
  }
}

