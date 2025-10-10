import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Invoice PDF API - Starting request for ID:', id);

    // Get invoice data
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

    // Get customer info
    const customerName = invoice.account?.name || 
                        invoice.distributor?.businessName || 
                        (invoice.lead ? `${invoice.lead.firstName} ${invoice.lead.lastName}`.trim() : '') ||
                        'No customer';
    const customerEmail = invoice.account?.email || invoice.distributor?.email || invoice.lead?.email || '';
    const customerPhone = invoice.account?.phone || invoice.distributor?.phone || invoice.lead?.phone || '';
    
    const hasDiscounts = invoice.lines?.some(line => line.discount > 0) || false;
    
    // Get company logo from settings
    const brandingSettings = await prisma.systemSettings.findFirst({
      where: { key: 'company_logo' },
    });
    const customLogo = brandingSettings?.value || null;

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
          }
          
          .company-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          
          .logo {
            max-height: 60px;
            margin-bottom: 10px;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          
          .document-subtitle {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .info-sub {
            font-size: 14px;
            color: #6b7280;
          }
          
          .info-sub-label {
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
          }
          
          .status-draft {
            background-color: #fef3c7;
            color: #92400e;
          }
          
          .status-sent {
            background-color: #dbeafe;
            color: #1e40af;
          }
          
          .status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
          }
          
          .status-void {
            background-color: #f3f4f6;
            color: #6b7280;
          }
          
          .payment-status-unpaid {
            background-color: #fee2e2;
            color: #991b1b;
          }
          
          .payment-status-partially_paid {
            background-color: #fef3c7;
            color: #92400e;
          }
          
          .payment-status-paid {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          .items-section {
            margin-bottom: 30px;
          }
          
          .items-label {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .table-container {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .table-header {
            display: grid;
            grid-template-columns: 40px 2fr 60px 80px ${hasDiscounts ? '80px' : ''} 80px;
            background-color: #f9fafb;
            font-weight: 600;
            font-size: 12px;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .table-header-cell {
            padding: 12px 8px;
            border-right: 1px solid #e5e7eb;
          }
          
          .table-header-cell:last-child {
            border-right: none;
          }
          
          .table-body {
            background: white;
          }
          
          .table-row {
            display: grid;
            grid-template-columns: 40px 2fr 60px 80px ${hasDiscounts ? '80px' : ''} 80px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 13px;
          }
          
          .table-row:last-child {
            border-bottom: none;
          }
          
          .row-number {
            padding: 12px 8px;
            text-align: center;
            color: #6b7280;
            border-right: 1px solid #f3f4f6;
          }
          
          .row-description {
            padding: 12px 8px;
            border-right: 1px solid #f3f4f6;
          }
          
          .row-sku {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
          }
          
          .row-other {
            padding: 12px 8px;
            text-align: right;
            border-right: 1px solid #f3f4f6;
            color: #374151;
          }
          
          .row-discount {
            padding: 12px 8px;
            text-align: right;
            border-right: 1px solid #f3f4f6;
            color: #059669;
            font-weight: 500;
          }
          
          .row-discount-dash {
            padding: 12px 8px;
            text-align: center;
            border-right: 1px solid #f3f4f6;
            color: #9ca3af;
          }
          
          .row-amount {
            padding: 12px 8px;
            text-align: right;
            font-weight: 600;
            color: #1f2937;
          }
          
          .totals-section {
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            margin-bottom: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 14px;
          }
          
          .total-final {
            font-size: 16px;
            font-weight: bold;
            border-top: 1px solid #d1d5db;
            padding-top: 12px;
            margin-top: 8px;
          }
          
          .total-label {
            color: #6b7280;
          }
          
          .total-value {
            font-weight: 600;
            color: #1f2937;
          }
          
          .total-black {
            color: #000000 !important;
            font-weight: bold;
          }
          
          .payment-info {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .payment-info h3 {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
          }
          
          .payment-info p {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .notes-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          
          .notes-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
          }
          
          .notes-content {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            white-space: pre-wrap;
          }
          
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <!-- Company Header -->
        <div class="company-header">
          ${customLogo ? `<img src="${customLogo}" alt="Company Logo" class="logo" />` : ''}
          <div class="company-name">${invoice.subject || 'Untitled Invoice'}</div>
          <div class="document-subtitle">${invoice.number}</div>
        </div>

        <!-- Document Info Grid -->
        <div class="info-grid">
          <div>
            <div class="info-label">INVOICE</div>
            <div class="info-value">${invoice.number}</div>
            <div class="info-sub">
              <div class="info-sub-label">Due Date</div>
              <div>${new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <div class="info-label">DATE</div>
            <div class="info-value">${new Date(invoice.issueDate).toLocaleDateString()}</div>
            <div class="info-sub">
              <div class="info-sub-label">Status</div>
              <div>
                <span class="status-badge status-${invoice.status.toLowerCase()}">
                  ${invoice.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div class="info-label">Bill To</div>
            <div class="info-value">${customerName}</div>
            <div class="info-sub">
              <div>${customerEmail}</div>
              <div>${customerPhone}</div>
            </div>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="payment-info">
          <h3>Payment Information</h3>
          <p><strong>Payment Status:</strong> <span class="status-badge payment-status-${invoice.paymentStatus.toLowerCase()}">${invoice.paymentStatus.toLowerCase().replace('_', ' ')}</span></p>
          <p><strong>Amount Due:</strong> GH₵${invoice.amountDue.toFixed(2)}</p>
          ${invoice.amountPaid > 0 ? `<p><strong>Amount Paid:</strong> GH₵${invoice.amountPaid.toFixed(2)}</p>` : ''}
          ${invoice.paymentTerms ? `<p><strong>Payment Terms:</strong> ${invoice.paymentTerms}</p>` : ''}
        </div>

        <!-- Items Section -->
        <div class="items-section">
          <div class="items-label">Items</div>
          ${invoice.lines && invoice.lines.length > 0 ? `
            <div class="table-container">
              <div class="table-header">
                <div class="table-header-cell">#</div>
                <div class="table-header-cell">Description</div>
                <div class="table-header-cell">Qty</div>
                <div class="table-header-cell">Unit Price</div>
                ${hasDiscounts ? '<div class="table-header-cell">Discount</div>' : ''}
                <div class="table-header-cell">Amount</div>
              </div>
              <div class="table-body">
                ${invoice.lines.map((line: any, index: number) => `
                  <div class="table-row">
                    <div class="row-number">${index + 1}</div>
                    <div class="row-description">
                      ${line.product?.name || line.productName || `Item ${index + 1}`}
                      ${line.product?.sku || line.sku ? `<div class="row-sku">SKU: ${line.product?.sku || line.sku}</div>` : ''}
                      ${line.description ? `<div class="row-sku">${line.description}</div>` : ''}
                    </div>
                    <div class="row-other">${line.quantity}</div>
                    <div class="row-other">GH₵${line.unitPrice.toFixed(2)}</div>
                    ${hasDiscounts ? `
                      <div class="${line.discount > 0 ? 'row-discount' : 'row-discount-dash'}">
                        ${line.discount > 0 ? `${line.discount}%` : '-'}
                      </div>
                    ` : ''}
                    <div class="row-amount">GH₵${line.lineTotal.toFixed(2)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 16px; color: #9ca3af; font-style: italic;">
              No items added
            </div>
          `}
        </div>

        <!-- Totals Section -->
        <div class="totals-section">
          ${!invoice.taxInclusive ? `
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">GH₵${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span class="total-value">GH₵${invoice.tax.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row total-final">
            <span>${invoice.taxInclusive ? 'Total (Tax Inclusive):' : 'Total:'}</span>
            <span class="total-black">GH₵${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="notes-section">
            <div class="notes-title">Notes</div>
            <div class="notes-content">${invoice.notes}</div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    // Return HTML content that can be converted to PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('❌ Invoice PDF API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
