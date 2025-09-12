import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        category: true,
        stockItem: true,
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      description,
      categoryId,
      price,
      cost,
      uomBase,
      uomSell,
      attributes,
      active,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
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
    if (uomBase !== undefined) updateData.uomBase = uomBase;
    if (uomSell !== undefined) updateData.uomSell = uomSell;
    if (attributes !== undefined) updateData.attributes = attributes;
    if (active !== undefined) updateData.active = active;

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        category: true,
        stockItem: true,
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is used in any orders or quotations
    const usedInOrders = await prisma.salesOrderLine.count({
      where: { productId: parseInt(params.id) },
    });

    const usedInQuotations = await prisma.quotationLine.count({
      where: { productId: parseInt(params.id) },
    });

    if (usedInOrders > 0 || usedInQuotations > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete product that is used in orders or quotations. Consider deactivating instead." 
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: parseInt(params.id) },
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
