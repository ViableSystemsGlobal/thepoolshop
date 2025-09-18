import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    // Archive products by setting active to false
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

    return NextResponse.json({
      message: `Successfully archived ${result.count} product(s)`,
      count: result.count
    });

  } catch (error) {
    console.error('Error archiving products:', error);
    return NextResponse.json(
      { error: 'Failed to archive products' },
      { status: 500 }
    );
  }
}
