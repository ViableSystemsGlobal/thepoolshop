import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    // Fetch products to export
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found' },
        { status: 404 }
      );
    }

    // Convert to CSV format
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Description',
      'Category',
      'Price',
      'Cost',
      'Stock',
      'Min Stock',
      'Max Stock',
      'Unit',
      'Status',
      'Tags',
      'Created At',
      'Updated At'
    ];

    const csvRows = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        product.sku,
        `"${product.description || ''}"`,
        product.category,
        product.price,
        product.cost,
        product.stock,
        product.minStock,
        product.maxStock,
        product.unit,
        product.status,
        `"${product.tags?.join(';') || ''}"`,
        product.createdAt.toISOString(),
        product.updatedAt.toISOString()
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    );
  }
}
