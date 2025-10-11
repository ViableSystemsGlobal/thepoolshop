import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/products/labels/bulk
 * Generate printable labels for multiple products
 */
export async function POST(request: NextRequest) {
  try {
    const { productIds, format = 'avery5160' } = await request.json();
    
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'productIds array is required' },
        { status: 400 }
      );
    }
    
    // Get products with barcodes
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        barcode: { not: null }
      },
      select: {
        id: true,
        sku: true,
        name: true,
        barcode: true,
        barcodeType: true,
        price: true
      }
    });
    
    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products with barcodes found' },
        { status: 404 }
      );
    }
    
    // Return label data for client-side rendering
    const labelData = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      barcodeType: p.barcodeType,
      price: p.price
    }));
    
    return NextResponse.json({
      message: `Generated ${products.length} labels`,
      products: labelData,
      format: format
    });
    
  } catch (error) {
    console.error('Error generating bulk labels:', error);
    return NextResponse.json(
      { error: 'Failed to generate labels' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/products/labels/bulk?category=xxx&withoutBarcodes=true
 * Get products for label printing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const withoutBarcodes = searchParams.get('withoutBarcodes') === 'true';
    
    const where: any = {};
    
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    
    if (withoutBarcodes) {
      where.barcode = null;
    } else {
      where.barcode = { not: null };
    }
    
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        name: true,
        barcode: true,
        barcodeType: true,
        price: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({
      total: products.length,
      products
    });
    
  } catch (error) {
    console.error('Error fetching products for labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

