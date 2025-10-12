import jsPDF from 'jspdf';

export interface PriceListItem {
  id: string;
  productId: string;
  unitPrice: number;
  basePrice: number | null;
  product: {
    id: string;
    name: string;
    sku: string;
    uomSell: string;
  };
}

export interface PriceListData {
  id: string;
  name: string;
  channel: string;
  currency: string;
  calculationType: string;
  basePrice: string;
  percentage: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  items: PriceListItem[];
  _count?: {
    items: number;
  };
}

export interface BrandingSettings {
  companyName: string;
  companyLogo: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export async function generatePriceListPDF(
  priceList: PriceListData,
  branding: BrandingSettings,
  currency: string = priceList.currency
): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Header with logo and company info
  yPosition = await addHeader(doc, branding, pageWidth, margin, yPosition);
  
  // Price list title and info
  yPosition = addPriceListInfo(doc, priceList, pageWidth, margin, yPosition);
  
  // Products table
  yPosition = addProductsTable(doc, priceList, currency, pageWidth, margin, yPosition, pageHeight);
  
  // Footer
  addFooter(doc, pageWidth, pageHeight, margin);

  return doc;
}

async function addHeader(
  doc: jsPDF, 
  branding: BrandingSettings, 
  pageWidth: number, 
  margin: number, 
  yPosition: number
): Promise<number> {
  try {
    // Try to add company logo if available
    if (branding.companyLogo && branding.companyLogo !== '/uploads/branding/company_logo_default.svg') {
      try {
        // Convert logo to base64 and add to PDF (like in GRN documents)
        const logoResponse = await fetch(branding.companyLogo);
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo to top left corner
        doc.addImage(logoBase64 as string, 'PNG', margin, margin, 30, 30);
        yPosition = margin + 35; // Adjust position after logo
      } catch (error) {
        console.log('Could not load logo, using company name:', error);
        // Fallback to company name
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(branding.companyName, margin, yPosition);
        yPosition += 20;
      }
    } else {
      // Fallback to company name
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(branding.companyName, margin, yPosition);
      yPosition += 20;
    }
  } catch (error) {
    // Fallback to company name if logo fails
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(branding.companyName, margin, yPosition);
    yPosition += 20;
  }

  // Date generated (moved to top right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Generated on: ${currentDate}`, pageWidth - margin - 50, margin + 10);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  return yPosition;
}

function addPriceListInfo(
  doc: jsPDF,
  priceList: PriceListData,
  pageWidth: number,
  margin: number,
  yPosition: number
): number {
  // Price List Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(priceList.name, margin, yPosition);
  yPosition += 12;

  // Price List Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    `Channel: ${priceList.channel.charAt(0).toUpperCase() + priceList.channel.slice(1)}`,
    `Currency: ${priceList.currency}`,
    `Effective From: ${new Date(priceList.effectiveFrom).toLocaleDateString()}`,
    `Effective To: ${priceList.effectiveTo ? new Date(priceList.effectiveTo).toLocaleDateString() : 'No expiration'}`,
    `Total Products: ${priceList._count?.items || priceList.items.length}`
  ];

  details.forEach(detail => {
    doc.text(detail, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;
  return yPosition;
}

function addProductsTable(
  doc: jsPDF,
  priceList: PriceListData,
  currency: string,
  pageWidth: number,
  margin: number,
  yPosition: number,
  pageHeight: number
): number {
  // Table header
  const tableTop = yPosition;
  const rowHeight = 8;
  const colWidths = [80, 35, 25, 45]; // Product, SKU, UOM, Price (removed Base Price)
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

  // Table headers - Fixed styling
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['Product', 'SKU', 'UOM', 'Price'];
  let xPos = margin;
  
  headers.forEach((header, index) => {
    // Draw light gray background
    doc.setFillColor(200, 200, 200);
    doc.rect(xPos, tableTop, colWidths[index], rowHeight, 'F');
    
    // Set black text and draw
    doc.setTextColor(0, 0, 0);
    doc.text(header, xPos + 3, tableTop + 6);
    xPos += colWidths[index];
  });

  yPosition = tableTop + rowHeight;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0); // Ensure black text for data

  priceList.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition + rowHeight > pageHeight - 30) {
      doc.addPage();
      yPosition = margin + rowHeight;
      // Redraw headers on new page
      doc.setFont('helvetica', 'bold');
      xPos = margin;
      headers.forEach((header, headerIndex) => {
        // Draw light gray background
        doc.setFillColor(200, 200, 200);
        doc.rect(xPos, margin, colWidths[headerIndex], rowHeight, 'F');
        
        // Set black text and draw
        doc.setTextColor(0, 0, 0);
        doc.text(header, xPos + 3, margin + 6);
        xPos += colWidths[headerIndex];
      });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Ensure black text
      yPosition = margin + rowHeight;
    }

    xPos = margin;
    const rowData = [
      item.product.name.length > 25 ? item.product.name.substring(0, 22) + '...' : item.product.name,
      item.product.sku,
      item.product.uomSell || 'pcs',
      formatCurrency(item.unitPrice, currency) // Only show channel price
    ];

    rowData.forEach((data, colIndex) => {
      doc.text(data, xPos + 2, yPosition + 5);
      xPos += colWidths[colIndex];
    });

    yPosition += rowHeight;
  });

  return yPosition + 15;
}

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
  const footerY = pageHeight - 15;
  
  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  // Footer text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by AdPools Group ERP System', margin, footerY);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 20, footerY);
}

function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'GHS': 'GHS',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount.toFixed(2)}`;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
