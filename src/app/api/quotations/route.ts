import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      ownerId: userId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { account: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true, type: true, email: true },
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        _count: {
          select: { lines: true, proformas: true },
        },
      },
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      validUntil,
      notes,
      accountId,
      lines = [],
    } = body;

    if (!subject || !accountId) {
      return NextResponse.json(
        { error: 'Subject and account are required' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        ownerId: userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      );
    }

    // Generate quotation number
    const count = await prisma.quotation.count();
    const number = `QT-${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    let subtotal = 0;
    const processedLines = lines.map((line: any) => {
      const lineTotal = (line.quantity || 0) * (line.unitPrice || 0) * (1 - (line.discount || 0) / 100);
      subtotal += lineTotal;
      return {
        ...line,
        lineTotal,
      };
    });

    const tax = subtotal * 0.15; // 15% tax rate
    const total = subtotal + tax;

    const quotation = await prisma.quotation.create({
      data: {
        number,
        subject,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        subtotal,
        tax,
        total,
        accountId,
        ownerId: userId,
        lines: {
          create: processedLines.map((line: any) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount || 0,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true, type: true, email: true },
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Quotation',
        entityId: quotation.id,
        action: 'created',
        details: { quotation: { number, subject, total, accountId } },
        userId: userId,
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to create quotation' },
      { status: 500 }
    );
  }
}
