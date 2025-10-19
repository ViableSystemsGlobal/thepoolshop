import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List all credit notes with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoiceId');
    const accountId = searchParams.get('accountId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    // Get total count
    const total = await prisma.creditNote.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get paginated credit notes
    const creditNotes = await prisma.creditNote.findMany({
      where,
      skip,
      take: limit,
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            total: true,
            subject: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        distributor: {
          select: {
            id: true,
            businessName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            invoiceId: true,
            amount: true,
            appliedAt: true,
            notes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate metrics for all credit notes
    const allCreditNotes = await prisma.creditNote.findMany({
      where,
      select: {
        amount: true,
        appliedAmount: true,
        remainingAmount: true,
        status: true,
      },
    });

    return NextResponse.json({
      creditNotes,
      total,
      page,
      limit,
      metrics: {
        totalAmount: allCreditNotes.reduce((sum, cn) => sum + cn.amount, 0),
        appliedAmount: allCreditNotes.reduce((sum, cn) => sum + cn.appliedAmount, 0),
        remainingAmount: allCreditNotes.reduce((sum, cn) => sum + cn.remainingAmount, 0),
        pendingCount: allCreditNotes.filter(cn => cn.status === 'PENDING').length,
        partiallyAppliedCount: allCreditNotes.filter(cn => cn.status === 'PARTIALLY_APPLIED').length,
        fullyAppliedCount: allCreditNotes.filter(cn => cn.status === 'FULLY_APPLIED').length,
        voidCount: allCreditNotes.filter(cn => cn.status === 'VOID').length,
      },
    });
  } catch (error) {
    console.error('Error fetching credit notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit notes' },
      { status: 500 }
    );
  }
}

// POST - Create a new credit note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      invoiceId,
      accountId,
      distributorId,
      leadId,
      amount,
      reason,
      reasonDetails,
      notes,
    } = body;

    // Validate required fields
    if (!invoiceId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Invoice ID, amount, and reason are required' },
        { status: 400 }
      );
    }

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        number: true,
        total: true,
        accountId: true,
        distributorId: true,
        leadId: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate credit note number
    const lastCreditNote = await prisma.creditNote.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { number: true },
    });

    let nextNumber = 1;
    if (lastCreditNote?.number) {
      const match = lastCreditNote.number.match(/CN-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const creditNoteNumber = `CN-${nextNumber.toString().padStart(6, '0')}`;

    // Create credit note
    const creditNote = await prisma.creditNote.create({
      data: {
        number: creditNoteNumber,
        invoiceId,
        accountId: accountId || invoice.accountId,
        distributorId: distributorId || invoice.distributorId,
        leadId: leadId || invoice.leadId,
        amount,
        appliedAmount: 0,
        remainingAmount: amount,
        reason,
        reasonDetails,
        notes,
        status: 'PENDING',
        ownerId: session.user.id,
      },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            total: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(creditNote, { status: 201 });
  } catch (error) {
    console.error('Error creating credit note:', error);
    return NextResponse.json(
      { error: 'Failed to create credit note' },
      { status: 500 }
    );
  }
}

