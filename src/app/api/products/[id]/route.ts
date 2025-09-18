import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stockItems: {
          include: {
            warehouse: true
          }
        },
        priceListItems: {
          include: {
            priceList: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      sku,
      name,
      description,
      categoryId,
      price,
      cost,
      costCurrency,
      sellingCurrency,
      exchangeRateMode,
      customExchangeRate,
      originalPrice,
      originalCost,
      originalPriceCurrency,
      originalCostCurrency,
      exchangeRateAtImport,
      baseCurrency,
      uomBase,
      uomSell,
      attributes,
      images,
      active,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if SKU is being changed and if it already exists
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (sku !== undefined) updateData.sku = sku;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (originalPrice !== undefined) updateData.originalPrice = parseFloat(originalPrice);
    if (originalCost !== undefined) updateData.originalCost = parseFloat(originalCost);
    if (originalPriceCurrency !== undefined) updateData.originalPriceCurrency = originalPriceCurrency;
    if (originalCostCurrency !== undefined) updateData.originalCostCurrency = originalCostCurrency;
    if (exchangeRateAtImport !== undefined) updateData.exchangeRateAtImport = parseFloat(exchangeRateAtImport);
    if (baseCurrency !== undefined) updateData.baseCurrency = baseCurrency;
    if (uomBase !== undefined) updateData.uomBase = uomBase;
    if (uomSell !== undefined) updateData.uomSell = uomSell;
    if (attributes !== undefined) updateData.attributes = attributes;
    if (images !== undefined) updateData.images = images;
    if (active !== undefined) updateData.active = active;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        stockItems: {
          include: {
            warehouse: true
          }
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete related records first due to foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete stock movements
      await tx.stockMovement.deleteMany({
        where: { productId: id },
      });

      // Delete stock item
      await tx.stockItem.deleteMany({
        where: { productId: id },
      });

      // Delete price list items
      await tx.priceListItem.deleteMany({
        where: { productId: id },
      });

      // Delete quotation lines
      await tx.quotationLine.deleteMany({
        where: { productId: id },
      });

      // Delete proforma lines
      await tx.proformaLine.deleteMany({
        where: { productId: id },
      });

      // Finally delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
