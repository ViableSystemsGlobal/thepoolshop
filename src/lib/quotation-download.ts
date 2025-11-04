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
      name: string;
      sku?: string;
      images?: string | null;
    };
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

// Version 3.0 - Open window synchronously to avoid popup blocker
export const downloadQuotationAsPDF = async (
  quotation: any, 
  customLogo?: string,
  showError?: (message: string) => void,
  success?: (message: string) => void
) => {
  const VERSION = '3.0.0';
  console.log(`[Quotation PDF Download v${VERSION}] Starting download for quotation ${quotation?.id}`);
  
  const errorHandler = showError || ((message: string) => console.error(message));
  const successHandler = success || ((message: string) => console.log(message));
  
  // Validate quotation object
  if (!quotation || !quotation.id) {
    errorHandler('Invalid quotation data');
    return;
  }
  
  try {
    // Open window SYNCHRONOUSLY (in response to user click) to avoid popup blocker
    const timestamp = Date.now();
    const pdfUrl = `/api/quotations/${quotation.id}/pdf?t=${timestamp}&v=${VERSION}`;
    
    console.log(`[Quotation PDF Download] Opening window synchronously`);
    
    // Open window immediately (synchronously) - this must happen in direct response to user click
    const newWindow = window.open('', '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      console.error('[Quotation PDF Download] Popup blocked');
      errorHandler('Please allow popups to view the PDF');
      return;
    }
    
    // Show loading message in the new window
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loading Quotation PDF...</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>Loading quotation PDF...</p>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
    
    // Now fetch the PDF content asynchronously
    console.log(`[Quotation PDF Download] Fetching PDF from: ${pdfUrl}`);
    
    const response = await fetch(pdfUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Quotation PDF Download] PDF generation failed:', errorText);
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; padding: 20px;">
            <h1>Error</h1>
            <p>Failed to generate PDF. Please try again.</p>
          </body>
        </html>
      `);
      newWindow.document.close();
      errorHandler('Failed to generate PDF. Please try again.');
      return;
    }

    const htmlContent = await response.text();
    
    // Write the PDF content to the already-opened window
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    console.log(`[Quotation PDF Download] PDF opened successfully`);
    successHandler("Quotation PDF opened in new tab. You can print it from there.");
    
  } catch (error) {
    console.error('[Quotation PDF Download] Error:', error);
    errorHandler('Failed to download quotation. Please try again.');
  }
};
