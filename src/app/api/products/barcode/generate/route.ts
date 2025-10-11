import { NextRequest, NextResponse } from 'next/server';
import { generateBarcode, validateBarcode } from '@/lib/barcode-utils';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/products/barcode/generate
 * Generate a new barcode for a product
 */
export async function POST(request: NextRequest) {
  try {
    const { sku, barcodeType = 'EAN13', productId } = await request.json();
    
    if (!sku) {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }
    
    // Generate barcode
    let barcode = generateBarcode(sku, barcodeType as any);
    let attempts = 0;
    const maxAttempts = 10;
    
    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [
            { barcode },
            { additionalBarcodes: { some: { barcode } } }
          ]
        }
      });
      
      if (!existing || (productId && existing.id === productId)) {
        // Barcode is unique or belongs to the same product
        break;
      }
      
      // Generate new one with timestamp
      barcode = generateBarcode(`${sku}-${Date.now()}-${attempts}`, barcodeType as any);
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Could not generate unique barcode after multiple attempts' },
        { status: 500 }
      );
    }
    
    // Validate generated barcode
    if (!validateBarcode(barcode, barcodeType as any)) {
      return NextResponse.json(
        { error: 'Generated barcode failed validation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      barcode,
      barcodeType,
      formatted: barcode,
      isValid: true
    });
    
  } catch (error) {
    console.error('Error generating barcode:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode' },
      { status: 500 }
    );
  }
}

