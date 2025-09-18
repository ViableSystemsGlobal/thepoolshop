import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get the original product
    const originalProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!originalProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create a duplicate with modified name and SKU
    const duplicatedProduct = await prisma.product.create({
      data: {
        name: `${originalProduct.name} (Copy)`,
        sku: `${originalProduct.sku}-COPY-${Date.now()}`,
        description: originalProduct.description,
        images: originalProduct.images,
        attributes: originalProduct.attributes,
        uomBase: originalProduct.uomBase,
        uomSell: originalProduct.uomSell,
        price: originalProduct.price,
        cost: originalProduct.cost,
        originalPrice: originalProduct.originalPrice,
        originalCost: originalProduct.originalCost,
        originalPriceCurrency: originalProduct.originalPriceCurrency,
        originalCostCurrency: originalProduct.originalCostCurrency,
        exchangeRateAtImport: originalProduct.exchangeRateAtImport,
        lastExchangeRateUpdate: originalProduct.lastExchangeRateUpdate,
        baseCurrency: originalProduct.baseCurrency,
        active: true, // Start as active
        categoryId: originalProduct.categoryId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(duplicatedProduct);

  } catch (error) {
    console.error('Error duplicating product:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate product' },
      { status: 500 }
    );
  }
}
