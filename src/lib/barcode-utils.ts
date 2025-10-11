/**
 * Barcode generation and validation utilities
 */

export type BarcodeType = 'EAN13' | 'EAN8' | 'UPCA' | 'UPCE' | 'CODE128' | 'CODE39' | 'ITF14' | 'QR' | 'DATAMATRIX' | 'CUSTOM';

/**
 * Generate a barcode based on input string and type
 */
export function generateBarcode(input: string, type: BarcodeType = 'EAN13'): string {
  switch (type) {
    case 'EAN13':
      return generateEAN13(input);
    case 'EAN8':
      return generateEAN8(input);
    case 'UPCA':
      return generateUPCA(input);
    case 'CODE128':
      return generateCODE128(input);
    case 'ITF14':
      return generateITF14(input);
    default:
      return generateEAN13(input);
  }
}

/**
 * Generate EAN-13 barcode (most common)
 * Format: Country code (2-3) + Manufacturer (4-5) + Product (3-4) + Check digit (1)
 */
function generateEAN13(input: string): string {
  // Use 200-299 range for internal/store use (not regulated)
  const prefix = '200';
  
  // Convert input to numeric, hash if needed
  const numericInput = input.replace(/\D/g, '') || hashString(input);
  
  // Pad to 9 digits
  const productCode = numericInput.padStart(9, '0').slice(0, 9);
  
  // Combine prefix and product code
  const baseNumber = prefix + productCode;
  
  // Calculate check digit
  const checkDigit = calculateEAN13CheckDigit(baseNumber);
  
  return baseNumber + checkDigit;
}

/**
 * Calculate EAN-13 check digit
 */
function calculateEAN13CheckDigit(barcode: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i]);
    // Odd positions (1st, 3rd, 5th...) multiply by 1
    // Even positions (2nd, 4th, 6th...) multiply by 3
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Generate EAN-8 barcode (shorter format)
 */
function generateEAN8(input: string): string {
  const prefix = '20';
  const numericInput = input.replace(/\D/g, '') || hashString(input);
  const productCode = numericInput.padStart(5, '0').slice(0, 5);
  const baseNumber = prefix + productCode;
  
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(baseNumber[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return baseNumber + checkDigit;
}

/**
 * Generate UPC-A barcode (US standard)
 */
function generateUPCA(input: string): string {
  const numericInput = input.replace(/\D/g, '') || hashString(input);
  const productCode = numericInput.padStart(10, '0').slice(0, 10);
  const baseNumber = '0' + productCode; // System digit
  
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(baseNumber[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return baseNumber + checkDigit;
}

/**
 * Generate CODE128 barcode (alphanumeric)
 */
function generateCODE128(input: string): string {
  // CODE128 can handle alphanumeric directly
  return `PRD${input.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
}

/**
 * Generate ITF-14 barcode (for cases/pallets)
 */
function generateITF14(input: string): string {
  const numericInput = input.replace(/\D/g, '') || hashString(input);
  const baseNumber = '1' + numericInput.padStart(12, '0').slice(0, 12); // Packaging indicator 1
  
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(baseNumber[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return baseNumber + checkDigit;
}

/**
 * Hash a string to numeric value (for non-numeric inputs)
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

/**
 * Validate barcode format and check digit
 */
export function validateBarcode(barcode: string, type: BarcodeType): boolean {
  switch (type) {
    case 'EAN13':
      return /^\d{13}$/.test(barcode) && validateEAN13CheckDigit(barcode);
    case 'EAN8':
      return /^\d{8}$/.test(barcode) && validateEAN8CheckDigit(barcode);
    case 'UPCA':
      return /^\d{12}$/.test(barcode) && validateUPCACheckDigit(barcode);
    case 'ITF14':
      return /^\d{14}$/.test(barcode) && validateITF14CheckDigit(barcode);
    case 'CODE128':
      return barcode.length > 0 && barcode.length <= 80;
    case 'QR':
    case 'DATAMATRIX':
      return barcode.length > 0;
    default:
      return true;
  }
}

function validateEAN13CheckDigit(barcode: string): boolean {
  const checkDigit = parseInt(barcode[12]);
  const calculated = calculateEAN13CheckDigit(barcode.slice(0, 12));
  return checkDigit === calculated;
}

function validateEAN8CheckDigit(barcode: string): boolean {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(barcode[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const calculated = (10 - (sum % 10)) % 10;
  return parseInt(barcode[7]) === calculated;
}

function validateUPCACheckDigit(barcode: string): boolean {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const calculated = (10 - (sum % 10)) % 10;
  return parseInt(barcode[11]) === calculated;
}

function validateITF14CheckDigit(barcode: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(barcode[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const calculated = (10 - (sum % 10)) % 10;
  return parseInt(barcode[13]) === calculated;
}

/**
 * Detect barcode type from barcode string
 */
export function detectBarcodeType(barcode: string): BarcodeType {
  const cleaned = barcode.trim();
  
  if (/^\d{13}$/.test(cleaned)) {
    return 'EAN13';
  } else if (/^\d{8}$/.test(cleaned)) {
    return 'EAN8';
  } else if (/^\d{12}$/.test(cleaned)) {
    return 'UPCA';
  } else if (/^\d{14}$/.test(cleaned)) {
    return 'ITF14';
  } else if (/^[A-Z0-9\-]+$/i.test(cleaned) && cleaned.length <= 80) {
    return 'CODE128';
  } else {
    return 'CUSTOM';
  }
}

/**
 * Format barcode for display (with spacing)
 */
export function formatBarcodeDisplay(barcode: string, type: BarcodeType): string {
  switch (type) {
    case 'EAN13':
      // Format: 1 234567 890123
      return `${barcode[0]} ${barcode.slice(1, 7)} ${barcode.slice(7)}`;
    case 'UPCA':
      // Format: 1 23456 78901 2
      return `${barcode[0]} ${barcode.slice(1, 6)} ${barcode.slice(6, 11)} ${barcode[11]}`;
    case 'EAN8':
      // Format: 1234 5678
      return `${barcode.slice(0, 4)} ${barcode.slice(4)}`;
    default:
      return barcode;
  }
}

