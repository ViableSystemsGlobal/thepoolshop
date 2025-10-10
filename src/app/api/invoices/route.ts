import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const nextNumber = count + 1;
  return `INV-${nextNumber.toString().padStart(6, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Invoices API: GET request received');
    
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    console.log('🔍 Invoices API: Filters:', { status, customerId, paymentStatus, dateFrom, dateTo });

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    if (customerId) {
      where.OR = [
        { accountId: customerId },
        { distributorId: customerId },
        { leadId: customerId }
      ];
    }
    
    if (dateFrom || dateTo) {
      where.issueDate = {};
      if (dateFrom) {
        where.issueDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.issueDate.lte = new Date(dateTo);
      }
    }

    console.log('🔍 Invoices API: Where clause:', where);

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        number: true,
        subject: true,
        status: true,
        paymentStatus: true,
        total: true,
        amountPaid: true,
        amountDue: true,
        issueDate: true,
        dueDate: true,
        paidDate: true,
        taxInclusive: true,
        notes: true,
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
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        quotation: {
          select: { id: true, number: true, subject: true },
        },
        _count: {
          select: { lines: true },
        },
      } as any,
    });

    console.log('🔍 Invoices API: Found', invoices.length, 'invoices');

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('❌ Invoices API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/invoices - Starting request');
    
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    console.log('🔍 POST /api/invoices - Request body:', body);

    const {
      subject,
      accountId,
      distributorId,
      leadId,
      quotationId,
      customerType,
      dueDate,
      paymentTerms,
      notes,
      taxInclusive = false,
      lines = [],
    } = body;

    // Validation
    if (!subject) {
      console.log('❌ Validation failed: Missing subject');
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!accountId && !distributorId && !leadId) {
      console.log('❌ Validation failed: Missing customer');
      return NextResponse.json(
        { error: 'Customer is required' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      console.log('❌ Validation failed: Missing due date');
      return NextResponse.json(
        { error: 'Due date is required' },
        { status: 400 }
      );
    }

    if (lines.length === 0) {
      console.log('❌ Validation failed: No line items');
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    // Verify customer exists
    if (accountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId },
      });
      if (!account) {
        console.log('❌ Account not found:', accountId);
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }
    }

    if (distributorId) {
      const distributor = await prisma.distributor.findFirst({
        where: { id: distributorId },
      });
      if (!distributor) {
        console.log('❌ Distributor not found:', distributorId);
        return NextResponse.json(
          { error: 'Distributor not found' },
          { status: 404 }
        );
      }
    }

    if (leadId) {
      const lead = await prisma.lead.findFirst({
        where: { id: leadId },
      });
      if (!lead) {
        console.log('❌ Lead not found:', leadId);
        return NextResponse.json(
          { error: 'Lead not found' },
          { status: 404 }
        );
      }
    }

    // Verify quotation exists if provided
    if (quotationId) {
      const quotation = await prisma.quotation.findFirst({
        where: { id: quotationId },
      });
      if (!quotation) {
        console.log('❌ Quotation not found:', quotationId);
        return NextResponse.json(
          { error: 'Quotation not found' },
          { status: 404 }
        );
      }
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    console.log('🔍 Generated invoice number:', invoiceNumber);

    // Calculate totals
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
    const amountDue = total;

    console.log('🔍 Calculated totals:', { subtotal, totalTax, totalDiscount, total, amountDue });

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        subject,
        quotationId: quotationId || null,
        accountId: accountId || null,
        distributorId: distributorId || null,
        leadId: leadId || null,
        status: 'DRAFT',
        paymentStatus: 'UNPAID',
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        subtotal,
        tax: totalTax,
        discount: totalDiscount,
        total,
        amountPaid: 0,
        amountDue,
        taxInclusive,
        paymentTerms: paymentTerms || null,
        customerType: customerType || 'STANDARD',
        notes: notes || null,
        ownerId: 'cmfpufpb500008zi346h5hntw', // TEMPORARY: Hardcoded user ID
        lines: {
          create: lines.map((line: any) => ({
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
        },
      } as any,
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

    console.log('✅ Invoice created successfully:', invoice.id);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/invoices Error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
