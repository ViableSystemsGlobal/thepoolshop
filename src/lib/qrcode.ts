import QRCode from 'qrcode';

/**
 * Generate QR code data URL for a given text/URL
 * @param data - The data to encode in the QR code
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code SVG string for a given text/URL
 * @param data - The data to encode in the QR code
 * @returns Promise<string> - SVG string of the QR code
 */
export async function generateQRCodeSVG(data: string): Promise<string> {
  try {
    const qrCodeSvg = await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });
    return qrCodeSvg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Generate QR code data for invoice/quote
 * Can include: invoice number, payment link, verification code, etc.
 */
export function generateInvoiceQRData(invoiceNumber: string, options?: {
  paymentLink?: string;
  verificationCode?: string;
  companyName?: string;
}): string {
  const data = {
    type: 'INVOICE',
    number: invoiceNumber,
    timestamp: new Date().toISOString(),
    ...options
  };
  return JSON.stringify(data);
}

export function generateQuoteQRData(quoteNumber: string, options?: {
  viewLink?: string;
  verificationCode?: string;
  companyName?: string;
}): string {
  const data = {
    type: 'QUOTATION',
    number: quoteNumber,
    timestamp: new Date().toISOString(),
    ...options
  };
  return JSON.stringify(data);
}

