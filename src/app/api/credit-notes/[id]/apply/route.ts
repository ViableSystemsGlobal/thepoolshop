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
    const { invoiceId, amount, notes } = body;

    if (!invoiceId || !amount) {
      return NextResponse.json(
        { error: 'Invoice ID and amount are required' },
        { status: 400 }
      );
    }

    const applyAmount = parseFloat(amount);
    if (isNaN(applyAmount) || applyAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Get the credit note
    const creditNote = await prisma.creditNote.findUnique({
      where: { id },
      include: {
        invoice: true,
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
        { error: 'Cannot apply a voided credit note' },
        { status: 400 }
      );
    }

    if (creditNote.status === 'FULLY_APPLIED') {
      return NextResponse.json(
        { error: 'Credit note is already fully applied' },
        { status: 400 }
      );
    }

    // Check if there's enough remaining amount
    if (applyAmount > creditNote.remainingAmount) {
      return NextResponse.json(
        { error: 'Application amount exceeds remaining credit amount' },
        { status: 400 }
      );
    }

    // Get the target invoice
    const targetInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!targetInvoice) {
      return NextResponse.json(
        { error: 'Target invoice not found' },
        { status: 404 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the application record
      const application = await tx.creditNoteApplication.create({
        data: {
          creditNoteId: id,
          invoiceId: invoiceId,
          amount: applyAmount,
          appliedBy: session.user.id,
          notes: notes || null,
        },
      });

      // Update the credit note's applied and remaining amounts
      const newAppliedAmount = creditNote.appliedAmount + applyAmount;
      const newRemainingAmount = creditNote.amount - newAppliedAmount;

      // Determine new status
      let newStatus = creditNote.status;
      if (newRemainingAmount <= 0) {
        newStatus = 'FULLY_APPLIED';
      } else if (newAppliedAmount > 0) {
        newStatus = 'PARTIALLY_APPLIED';
      }

      const updatedCreditNote = await tx.creditNote.update({
        where: { id },
        data: {
          appliedAmount: newAppliedAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          appliedDate: newStatus === 'FULLY_APPLIED' ? new Date() : creditNote.appliedDate,
        },
      });

      // Update the target invoice's amount due
      const newAmountDue = Math.max(0, targetInvoice.amountDue - applyAmount);
      const newAmountPaid = targetInvoice.amountPaid + applyAmount;

      // Determine new payment status
      let newPaymentStatus = targetInvoice.paymentStatus;
      if (newAmountDue <= 0) {
        newPaymentStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        newPaymentStatus = 'PARTIALLY_PAID';
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountDue: newAmountDue,
          amountPaid: newAmountPaid,
          paymentStatus: newPaymentStatus,
          paidDate: newPaymentStatus === 'PAID' ? new Date() : targetInvoice.paidDate,
        },
      });

      // Log the activity
      await tx.activity.create({
        data: {
          entityType: 'CREDIT_NOTE',
          entityId: id,
          action: 'APPLIED',
          description: `Credit note ${creditNote.number} applied ${applyAmount} to invoice ${targetInvoice.number}`,
          performedBy: session.user.id,
          metadata: {
            applicationId: application.id,
            targetInvoiceId: invoiceId,
            amount: applyAmount,
          },
        },
      });

      return {
        application,
        creditNote: updatedCreditNote,
        invoice: updatedInvoice,
      };
    });

    return NextResponse.json({
      success: true,
      application: result.application,
      creditNote: result.creditNote,
      invoice: result.invoice,
    });
  } catch (error) {
    console.error('Error applying credit note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply credit note' },
      { status: 500 }
    );
  }
}