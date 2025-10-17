// This function doesn't use hooks directly - it accepts the necessary parameters

interface Quotation {
  id: string;
  number: string;
  status: string;
  subject: string;
  validUntil: string;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  taxInclusive?: boolean;
  accountId?: string;
  distributorId?: string;
  leadId?: string;
  customerType: string;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  distributor?: {
    id: string;
    businessName: string;
    email: string;
    phone: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  lines: Array<{
    id: string;
    productId?: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
    product?: {
      id: string;
      name: string;
      sku: string;
      price: number;
      images?: string | null;
    };
    sku?: string;
    images?: string | null;
  }>;
}

// Helper function to parse product images
const parseProductImages = (images: string | null | undefined): string[] => {
  if (!images) return [];
  if (typeof images === 'string') {
    try {
      return JSON.parse(images);
    } catch (e) {
      return [];
    }
  }
  if (Array.isArray(images)) {
    return images;
  }
  return [];
};

export const downloadQuotationAsPDF = async (
  quotation: any, 
  customLogo?: string,
  showError?: (message: string) => void,
  success?: (message: string) => void
) => {
  const defaultShowError = (message: string) => console.error(message);
  const defaultSuccess = (message: string) => console.log(message);
  
  const errorHandler = showError || defaultShowError;
  const successHandler = success || defaultSuccess;
  
  try {
    // Create a new window with the quotation content formatted for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      errorHandler("Unable to open print window. Please check your popup blocker.");
      return;
    }

    // Get quotation details
    const customerName = quotation.account?.name || 
                        quotation.distributor?.businessName || 
                        (quotation.lead ? `${quotation.lead.firstName} ${quotation.lead.lastName}`.trim() : '') ||
                        'No customer';
    const customerEmail = quotation.account?.email || quotation.distributor?.email || quotation.lead?.email || '';
    const customerPhone = quotation.account?.phone || quotation.distributor?.phone || quotation.lead?.phone || '';
    
    // Calculate if discount column should be shown
    const hasDiscounts = quotation.lines?.some((line: any) => line.discount > 0) || false;
    
    // Create the HTML content matching the preview layout exactly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation ${quotation.number}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .company-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            height: 64px;
            width: auto;
            margin: 0 auto 16px;
            display: block;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #111;
            margin-bottom: 4px;
          }
          .document-subtitle {
            font-size: 14px;
            color: #6b7280;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .info-label {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            margin-bottom: 4px;
          }
          .info-value {
            font-weight: 600;
            color: #111;
          }
          .info-sub {
            font-size: 14px;
            color: #6b7280;
            margin-top: 8px;
          }
          .info-sub-label {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            margin-bottom: 4px;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-draft { background-color: #f3f4f6; color: #374151; }
          .status-sent { background-color: #dbeafe; color: #1e40af; }
          .status-accepted { background-color: #d1fae5; color: #065f46; }
          .status-rejected { background-color: #fee2e2; color: #991b1b; }
          .status-expired { background-color: #fed7aa; color: #9a3412; }
          
          .items-section {
            margin-bottom: 32px;
          }
          .items-label {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          .table-container {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .table-header {
            background-color: #f9fafb;
            display: grid;
            grid-template-columns: ${hasDiscounts ? '1fr 4fr 1fr 2fr 2fr 2fr' : '1fr 4fr 1fr 2fr 2fr'};
            gap: 8px;
            padding: 8px 12px;
          }
          .table-header-cell {
            font-size: 12px;
            font-weight: 500;
            color: #374151;
            text-transform: uppercase;
          }
          .table-body {
            max-height: none;
            overflow: visible;
          }
          .table-row {
            display: grid;
            grid-template-columns: ${hasDiscounts ? '1fr 4fr 1fr 2fr 2fr 2fr' : '1fr 4fr 1fr 2fr 2fr'};
            gap: 8px;
            padding: 8px 12px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
          }
          .table-row:last-child {
            border-bottom: none;
          }
          .table-row:nth-child(even) {
            background-color: #f9fafb;
          }
          .table-row:nth-child(odd) {
            background-color: white;
          }
          .row-number { color: #6b7280; }
          .row-description {
            font-weight: 500;
            color: #111;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .product-image {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            object-fit: cover;
            background-color: #e5e7eb;
            flex-shrink: 0;
          }
          .product-details {
            flex: 1;
          }
          .row-sku {
            font-size: 12px;
            color: #6b7280;
            margin-top: 2px;
          }
          .row-amount {
            font-weight: 500;
            color: #111;
          }
          .row-discount {
            font-weight: 500;
            color: #059669;
          }
          .row-discount-dash {
            color: #9ca3af;
          }
          .row-other { color: #6b7280; }
          
          .totals-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
          }
          .total-final {
            font-weight: bold;
            font-size: 18px;
            border-top: 1px solid #e5e7eb;
            margin-top: 8px;
            padding-top: 16px;
          }
          .total-label { color: #6b7280; }
          .total-value { font-weight: 500; }
          .total-discount { color: #059669; }
          .total-black { color: #111; }
          
          .notes-section {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }
          .notes-title {
            font-weight: 500;
            color: #111;
            margin-bottom: 8px;
          }
          .notes-content {
            font-size: 14px;
            color: #6b7280;
            white-space: pre-wrap;
          }
          
          @media print {
            body { margin: 0; padding: 15px; }
            .company-header { page-break-after: avoid; }
            .table-container { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <!-- Company Header -->
        <div class="company-header">
          ${customLogo ? `<img src="${customLogo}" alt="Company Logo" class="logo" />` : ''}
          <div class="company-name">${quotation.subject || 'Untitled Quotation'}</div>
          <div class="document-subtitle">${quotation.number}</div>
        </div>

        <!-- Document Info Grid -->
        <div class="info-grid">
          <div>
            <div class="info-label">QUOTATION</div>
            <div class="info-value">${quotation.number}</div>
            <div class="info-sub">
              <div class="info-sub-label">Valid Until</div>
              <div>${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'No expiry'}</div>
            </div>
          </div>
          <div>
            <div class="info-label">DATE</div>
            <div class="info-value">${new Date(quotation.createdAt).toLocaleDateString()}</div>
            <div class="info-sub">
              <div class="info-sub-label">Status</div>
              <div>
                <span class="status-badge status-${quotation.status.toLowerCase()}">
                  ${quotation.status.toLowerCase()}
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

        <!-- Items Section -->
        <div class="items-section">
          <div class="items-label">Items</div>
          ${quotation.lines && quotation.lines.length > 0 ? `
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
                ${quotation.lines.map((line: any, index: number) => `
                  <div class="table-row">
                    <div class="row-number">${index + 1}</div>
                    <div class="row-description">
                      ${(() => {
                        const images = parseProductImages(line.product?.images || line.images);
                        const imageUrl = images.length > 0 ? images[0] : '';
                        return imageUrl 
                          ? `<img src="${imageUrl}" alt="Product" class="product-image" onerror="this.style.display='none'" />` 
                          : '';
                      })()}
                      <div class="product-details">
                        ${line.product?.name || line.productName || `Item ${index + 1}`}
                        ${line.product?.sku || line.sku ? `<div class="row-sku">SKU: ${line.product?.sku || line.sku}</div>` : ''}
                        ${line.description ? `<div class="row-sku">${line.description}</div>` : ''}
                      </div>
                    </div>
                    <div class="row-other">${line.quantity}</div>
                    <div class="row-other">GHS ${line.unitPrice.toFixed(2)}</div>
                    ${hasDiscounts ? `
                      <div class="${line.discount > 0 ? 'row-discount' : 'row-discount-dash'}">
                        ${line.discount > 0 ? `${line.discount}%` : '-'}
                      </div>
                    ` : ''}
                    <div class="row-amount">GHS ${line.lineTotal.toFixed(2)}</div>
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
          ${!quotation.taxInclusive ? `
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">GHS ${quotation.subtotal.toFixed(2)}</span>
            </div>
            ${(() => {
              const totalDiscount = quotation.lines.reduce((sum: number, line: any) => {
                const discountAmount = (line.unitPrice * line.quantity * line.discount) / 100;
                return sum + discountAmount;
              }, 0);
              return totalDiscount > 0 ? `
                <div class="total-row">
                  <span class="total-label">Discount:</span>
                  <span class="total-value total-discount">-GHS ${totalDiscount.toFixed(2)}</span>
                </div>
              ` : '';
            })()}
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span class="total-value">GHS ${quotation.tax.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row total-final">
            <span>${quotation.taxInclusive ? 'Total (Tax Inclusive):' : 'Total:'}</span>
            <span class="total-black">GHS ${quotation.total.toFixed(2)}</span>
          </div>
        </div>

        ${quotation.notes ? `
          <div class="notes-section">
            <div class="notes-title">Notes</div>
            <div class="notes-content">${quotation.notes}</div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      // Small delay to ensure content is fully rendered
      setTimeout(() => {
        try {
          if (printWindow && !printWindow.closed) {
            printWindow.print();
            // Don't close immediately - let user interact with print dialog
            setTimeout(() => {
              if (printWindow && !printWindow.closed) {
                printWindow.close();
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Error printing:', error);
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }
      }, 100);
    };
    
    successHandler("Quotation ready for download/printing");
  } catch (error) {
    console.error('Error downloading quotation:', error);
    errorHandler("Failed to download quotation");
  }
};
