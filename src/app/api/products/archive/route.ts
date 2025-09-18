import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Archive the product by setting active to false
    const archivedProduct = await prisma.product.update({
      where: { id },
      data: {
        active: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Product archived successfully',
      product: archivedProduct
    });

  } catch (error) {
    console.error('Error archiving product:', error);
    return NextResponse.json(
      { error: 'Failed to archive product' },
      { status: 500 }
    );
  }
}
