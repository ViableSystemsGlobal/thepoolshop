import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single credit note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const creditNote = await prisma.creditNote.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            subject: true,
            total: true,
            issueDate: true,
            dueDate: true,
            status: true,
            paymentStatus: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        distributor: {
          select: {
            id: true,
            businessName: true,
            email: true,
            phone: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        voider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          include: {
            appliedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });

    if (!creditNote) {
      return NextResponse.json(
        { error: 'Credit note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(creditNote);
  } catch (error) {
    console.error('Error fetching credit note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit note' },
      { status: 500 }
    );
  }
}

// PUT - Update credit note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, reason, reasonDetails, notes } = body;

    // Check if credit note exists
    const existingCreditNote = await prisma.creditNote.findUnique({
      where: { id },
    });

    if (!existingCreditNote) {
      return NextResponse.json(
        { error: 'Credit note not found' },
        { status: 404 }
      );
    }

    // Don't allow updates if credit note is void or fully applied
    if (existingCreditNote.status === 'VOID') {
      return NextResponse.json(
        { error: 'Cannot update a voided credit note' },
        { status: 400 }
      );
    }

    if (existingCreditNote.status === 'FULLY_APPLIED') {
      return NextResponse.json(
        { error: 'Cannot update a fully applied credit note' },
        { status: 400 }
      );
    }

    // Update data object
    const updateData: any = {};

    if (amount !== undefined) {
      updateData.amount = amount;
      // Recalculate remaining amount
      updateData.remainingAmount = amount - existingCreditNote.appliedAmount;
    }

    if (reason !== undefined) {
      updateData.reason = reason;
    }

    if (reasonDetails !== undefined) {
      updateData.reasonDetails = reasonDetails;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update credit note
    const updatedCreditNote = await prisma.creditNote.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedCreditNote);
  } catch (error) {
    console.error('Error updating credit note:', error);
    return NextResponse.json(
      { error: 'Failed to update credit note' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (void) a credit note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if credit note exists
    const existingCreditNote = await prisma.creditNote.findUnique({
      where: { id },
      include: {
        applications: true,
      },
    });

    if (!existingCreditNote) {
      return NextResponse.json(
        { error: 'Credit note not found' },
        { status: 404 }
      );
    }

    // Don't allow voiding if already void
    if (existingCreditNote.status === 'VOID') {
      return NextResponse.json(
        { error: 'Credit note is already voided' },
        { status: 400 }
      );
    }

    // Don't allow voiding if it has been applied
    if (existingCreditNote.applications.length > 0) {
      return NextResponse.json(
        { error: 'Cannot void a credit note that has been applied. Please remove applications first.' },
        { status: 400 }
      );
    }

    // Void the credit note
    const voidedCreditNote = await prisma.creditNote.update({
      where: { id },
      data: {
        status: 'VOID',
        voidedBy: session.user.id,
        voidedDate: new Date(),
      },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
          },
        },
        voider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(voidedCreditNote);
  } catch (error) {
    console.error('Error voiding credit note:', error);
    return NextResponse.json(
      { error: 'Failed to void credit note' },
      { status: 500 }
    );
  }
}

