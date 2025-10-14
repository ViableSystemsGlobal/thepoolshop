import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 GET invoice API - Starting request for ID:', id);

    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        number: true,
        subject: true,
        status: true,
        paymentStatus: true,
        total: true,
        subtotal: true,
        tax: true,
        discount: true,
        amountPaid: true,
        amountDue: true,
        taxInclusive: true,
        notes: true,
        paymentTerms: true,
        customerType: true,
        qrCodeData: true,
        qrCodeGeneratedAt: true,
        issueDate: true,
        dueDate: true,
        paidDate: true,
        createdAt: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true, email: true, phone: true },
        },
        distributor: {
          select: { id: true, businessName: true, email: true, phone: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true },
        },
        quotation: {
          select: { id: true, number: true, subject: true },
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, price: true }
            }
          }
        },
      } as any,
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    console.log('✅ Invoice found:', invoice.number);

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('❌ GET invoice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 PUT invoice API - Starting request for ID:', id);

    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    console.log('🔍 PUT invoice API - Request body:', body);

    const {
      subject,
      accountId,
      distributorId,
      leadId,
      customerType,
      dueDate,
      paymentTerms,
      notes,
      taxInclusive,
      status,
      paymentStatus,
      lines,
    } = body;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id },
    });

    if (!existingInvoice) {
      console.log('❌ Invoice not found:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Calculate totals if lines are provided
    let updateData: any = {
      subject,
      accountId: accountId || null,
      distributorId: distributorId || null,
      leadId: leadId || null,
      customerType: customerType || 'STANDARD',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentTerms,
      notes,
      taxInclusive,
      status,
      paymentStatus,
    };

    if (lines && Array.isArray(lines)) {
      let subtotal = 0;
      let totalTax = 0;
      let totalDiscount = 0;

      for (const line of lines) {
        const baseAmount = line.quantity * line.unitPrice;
        const discountAmount = baseAmount * (line.discount / 100);
        const afterDiscount = baseAmount - discountAmount;
        
        subtotal += afterDiscount;
        totalDiscount += discountAmount;

        // Calculate taxes for this line
        if (line.taxes && Array.isArray(line.taxes)) {
          for (const tax of line.taxes) {
            totalTax += tax.amount || 0;
          }
        }
      }

      const total = taxInclusive ? subtotal : subtotal + totalTax;
      const amountDue = total - (existingInvoice.amountPaid || 0);

      updateData.subtotal = subtotal;
      updateData.tax = totalTax;
      updateData.discount = totalDiscount;
      updateData.total = total;
      updateData.amountDue = amountDue;
    }

    // Update invoice
    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        account: true,
        distributor: true,
        lead: true,
        quotation: true,
        owner: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update lines if provided
    if (lines && Array.isArray(lines)) {
      // Delete existing lines
      await prisma.invoiceLine.deleteMany({
        where: { invoiceId: id },
      });

      // Create new lines
      await prisma.invoiceLine.createMany({
        data: lines.map((line: any) => ({
          invoiceId: id,
          productId: line.productId,
          productName: line.productName,
          sku: line.sku,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
          taxes: line.taxes ? JSON.stringify(line.taxes) : null,
          lineTotal: line.lineTotal,
        })),
      });
    }

    console.log('✅ Invoice updated successfully:', invoice.number);

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('❌ PUT invoice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 DELETE invoice API - Starting request for ID:', id);

    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id },
    });

    if (!existingInvoice) {
      console.log('❌ Invoice not found:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Delete invoice (cascade will handle lines)
    await prisma.invoice.delete({
      where: { id },
    });

    console.log('✅ Invoice deleted successfully:', existingInvoice.number);

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE invoice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
