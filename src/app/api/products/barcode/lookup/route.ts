import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/barcode/lookup?barcode=xxx
 * Look up product by any barcode (primary or additional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    
    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode parameter is required' },
        { status: 400 }
      );
    }
    
    // Search in both primary and additional barcodes
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { barcode: barcode },
          {
            additionalBarcodes: {
              some: {
                barcode: barcode,
                isActive: true
              }
            }
          }
        ]
      },
      include: {
        category: true,
        stockItems: {
          include: {
            warehouse: true
          }
        },
        additionalBarcodes: {
          where: { isActive: true }
        },
        suppliers: {
          where: { isActive: true }
        }
      }
    });
    
    if (!product) {
      // Try to find similar products (optional)
      const similarProducts = await prisma.product.findMany({
        where: {
          OR: [
            { sku: { contains: barcode.slice(0, 8) } },
            { name: { contains: barcode.slice(0, 8) } }
          ]
        },
        take: 5,
        select: {
          id: true,
          sku: true,
          name: true,
          barcode: true
        }
      });
      
      return NextResponse.json(
        {
          error: 'Product not found',
          scannedBarcode: barcode,
          suggestions: similarProducts
        },
        { status: 404 }
      );
    }
    
    // Determine which barcode was matched
    const matchType = product.barcode === barcode ? 'primary' : 'additional';
    const matchedBarcodeInfo = matchType === 'primary'
      ? { type: 'primary', source: 'Your primary barcode' }
      : product.additionalBarcodes.find(b => b.barcode === barcode);
    
    return NextResponse.json({
      ...product,
      _matchInfo: {
        matchType,
        matchedBarcode: barcode,
        barcodeSource: matchedBarcodeInfo
      }
    });
    
  } catch (error) {
    console.error('Error looking up barcode:', error);
    return NextResponse.json(
      { error: 'Failed to lookup barcode' },
      { status: 500 }
    );
  }
}

