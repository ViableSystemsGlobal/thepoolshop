import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateBarcode, detectBarcodeType } from '@/lib/barcode-utils';

/**
 * POST /api/products/barcode/link
 * Link an additional barcode to an existing product
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, barcode, source, description, isPrimary = false } = await request.json();
    
    if (!productId || !barcode) {
      return NextResponse.json(
        { error: 'Product ID and barcode are required' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if barcode already exists
    const existingBarcode = await prisma.product.findFirst({
      where: {
        OR: [
          { barcode },
          { additionalBarcodes: { some: { barcode } } }
        ]
      }
    });
    
    if (existingBarcode && existingBarcode.id !== productId) {
      return NextResponse.json(
        {
          error: 'Barcode already assigned to another product',
          existingProduct: {
            id: existingBarcode.id,
            sku: existingBarcode.sku,
            name: existingBarcode.name
          }
        },
        { status: 409 }
      );
    }
    
    // Detect barcode type
    const barcodeType = detectBarcodeType(barcode);
    
    // Validate barcode
    if (!validateBarcode(barcode, barcodeType)) {
      return NextResponse.json(
        { error: 'Invalid barcode format' },
        { status: 400 }
      );
    }
    
    // Create additional barcode
    const additionalBarcode = await prisma.productBarcode.create({
      data: {
        productId,
        barcode,
        barcodeType,
        source,
        description,
        isPrimary,
        isActive: true
      }
    });
    
    return NextResponse.json({
      message: 'Barcode linked successfully',
      additionalBarcode
    });
    
  } catch (error) {
    console.error('Error linking barcode:', error);
    return NextResponse.json(
      { error: 'Failed to link barcode' },
      { status: 500 }
    );
  }
}

