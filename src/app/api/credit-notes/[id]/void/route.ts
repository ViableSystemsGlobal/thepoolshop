import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    const { reason } = body;

    // Get the credit note
    const creditNote = await prisma.creditNote.findUnique({
      where: { id },
      include: {
        applications: true,
      },
    });

    if (!creditNote) {
      return NextResponse.json(
        { error: 'Credit note not found' },
        { status: 404 }
      );
    }

    if (creditNote.status === 'VOID') {
      return NextResponse.json(
        { error: 'Credit note is already voided' },
        { status: 400 }
      );
    }

    if (creditNote.status === 'FULLY_APPLIED') {
      return NextResponse.json(
        { error: 'Cannot void a fully applied credit note' },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the credit note status to VOID
      const updatedCreditNote = await tx.creditNote.update({
        where: { id },
        data: {
          status: 'VOID',
          voidedDate: new Date(),
          voidedBy: session.user.id,
        },
      });

      // If there are applications, we need to reverse them
      if (creditNote.applications.length > 0) {
        for (const application of creditNote.applications) {
          // Get the invoice to update
          const invoice = await tx.invoice.findUnique({
            where: { id: application.invoiceId },
          });

          if (invoice) {
            // Reverse the application by adding back to amount due and subtracting from amount paid
            const newAmountDue = invoice.amountDue + application.amount;
            const newAmountPaid = Math.max(0, invoice.amountPaid - application.amount);

            // Determine new payment status
            let newPaymentStatus = invoice.paymentStatus;
            if (newAmountPaid <= 0) {
              newPaymentStatus = 'UNPAID';
            } else if (newAmountDue > 0) {
              newPaymentStatus = 'PARTIALLY_PAID';
            }

            await tx.invoice.update({
              where: { id: application.invoiceId },
              data: {
                amountDue: newAmountDue,
                amountPaid: newAmountPaid,
                paymentStatus: newPaymentStatus,
                paidDate: newPaymentStatus === 'PAID' ? invoice.paidDate : null,
              },
            });
          }

          // Delete the application record
          await tx.creditNoteApplication.delete({
            where: { id: application.id },
          });
        }
      }

      // Log the activity
      await tx.activity.create({
        data: {
          entityType: 'CREDIT_NOTE',
          entityId: id,
          action: 'VOIDED',
          userId: session.user.id,
          details: {
            description: `Credit note ${creditNote.number} voided${reason ? `: ${reason}` : ''}`,
            reason: reason || null,
            applicationsReversed: creditNote.applications.length,
          },
        },
      });

      return updatedCreditNote;
    });

    return NextResponse.json({
      success: true,
      creditNote: result,
    });
  } catch (error) {
    console.error('Error voiding credit note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to void credit note' },
      { status: 500 }
    );
  }
}
