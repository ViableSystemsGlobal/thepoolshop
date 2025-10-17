import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInvoiceQRData, generateQRCode } from '@/lib/qrcode';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quotationId = params.id;
    const userId = (session.user as any).id;

    console.log('🔄 Converting quotation to invoice:', quotationId);

    // Fetch the quotation with all related data
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        account: true,
        distributor: true,
        lead: true,
        opportunity: true,
        owner: true
      }
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Check if quotation is in a state that can be converted
    if (quotation.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Only accepted quotations can be converted to invoices' },
        { status: 400 }
      );
    }

    // Check if invoice already exists for this quotation
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quotationId: quotationId }
    });

    if (existingInvoice) {
      return NextResponse.json(
        { 
          error: 'Invoice already exists for this quotation',
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.number
        },
        { status: 400 }
      );
    }

    // Generate unique invoice number
    let invoiceNumber: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      const count = await prisma.invoice.count();
      invoiceNumber = `INV-${String(count + 1 + attempts).padStart(6, '0')}`;
      
      // Check if this number already exists
      const existing = await prisma.invoice.findUnique({
        where: { number: invoiceNumber }
      });
      
      if (!existing) break;
      
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      // Fallback to timestamp-based number
      invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    }

    console.log('📄 Generated invoice number:', invoiceNumber);

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        subject: quotation.subject,
        quotationId: quotationId,
        accountId: quotation.accountId,
        distributorId: quotation.distributorId,
        leadId: quotation.leadId,
        opportunityId: quotation.opportunityId,
        ownerId: quotation.ownerId,
        currency: quotation.currency || 'GHS',
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        total: quotation.total,
        amountPaid: 0,
        amountDue: quotation.total,
        taxInclusive: quotation.taxInclusive,
        notes: quotation.notes,
        dueDate: quotation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if no validUntil
        status: 'DRAFT', // Start as draft, can be sent later
        paymentStatus: 'UNPAID',
        creditApproved: false
      }
    });

    console.log('✅ Created invoice:', invoice.id);

    // Generate QR code for the invoice
    try {
      const qrData = generateInvoiceQRData(invoiceNumber, {
        companyName: quotation.account?.name || quotation.distributor?.businessName || 'Company'
      });
      const qrCodeDataUrl = await generateQRCode(qrData);
      
      // Update invoice with QR code
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          qrCodeData: qrCodeDataUrl,
          qrCodeGeneratedAt: new Date()
        }
      });
      
      console.log('✅ Generated QR code for invoice');
    } catch (qrError) {
      console.error('⚠️ Failed to generate QR code:', qrError);
      // Continue without QR code - not critical
    }

    // Create invoice lines from quotation lines
    const invoiceLines = await Promise.all(
      quotation.lines.map(async (line) => {
        return prisma.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            productId: line.productId,
            productName: line.product?.name || '',
            sku: line.product?.sku || '',
            description: line.product?.description || '',
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            lineTotal: line.lineTotal
          }
        });
      })
    );

    console.log('📋 Created invoice lines:', invoiceLines.length);

    // Update quotation status to indicate it's been invoiced
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { 
        status: 'ACCEPTED', // Keep as accepted, but we'll track that it's invoiced
        updatedAt: new Date()
      }
    });

    // Update opportunity status to WON if it exists
    if ((quotation as any).opportunityId) {
      await prisma.opportunity.update({
        where: { id: (quotation as any).opportunityId },
        data: {
          stage: 'WON' as any,
          value: invoice.total, // Update the deal value to match the invoice total
          probability: 100, // Set probability to 100% when won
          wonDate: new Date(),
          updatedAt: new Date()
        } as any
      });

      console.log('🎉 Updated opportunity status to WON with value:', invoice.total, 'and probability: 100%');
    }

    // Keep lead status as is (CONVERTED_TO_OPPORTUNITY) - it's already converted
    // The opportunity now tracks the actual deal progress

    // Fetch the complete invoice with relations for response
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        account: true,
        distributor: true,
        lead: true,
        opportunity: true,
        quotation: true,
        owner: true
      }
    });

    console.log('✅ Quote-to-invoice conversion completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Quotation successfully converted to invoice',
      invoice: completeInvoice
    });

  } catch (error) {
    console.error('❌ Error converting quotation to invoice:', error);
    return NextResponse.json(
      { error: 'Failed to convert quotation to invoice' },
      { status: 500 }
    );
  }
}
