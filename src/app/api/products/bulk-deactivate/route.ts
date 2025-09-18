import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    console.log('Deactivating products:', ids);

    // Update products to make them inactive
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        active: false,
        updatedAt: new Date()
      }
    });

    console.log(`Successfully deactivated ${result.count} products`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deactivated ${result.count} product(s)`,
      count: result.count 
    });
  } catch (error) {
    console.error('Error deactivating products:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate products' },
      { status: 500 }
    );
  }
}
