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

    console.log('Activating products:', ids);

    // Update products to make them active
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        active: true,
        updatedAt: new Date()
      }
    });

    console.log(`Successfully activated ${result.count} products`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully activated ${result.count} product(s)`,
      count: result.count 
    });
  } catch (error) {
    console.error('Error activating products:', error);
    return NextResponse.json(
      { error: 'Failed to activate products' },
      { status: 500 }
    );
  }
}
