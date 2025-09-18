import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all items in a price list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const items = await prisma.priceListItem.findMany({
      where: {
        priceListId: id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching price list items:", error);
    return NextResponse.json(
      { error: "Failed to fetch price list items" },
      { status: 500 }
    );
  }
}

// POST - Add a new item to a price list
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { productId, unitPrice, basePrice, exchangeRate } = body;

    // Validate required fields
    if (!productId || unitPrice === undefined) {
      return NextResponse.json(
        { error: "Product ID and unit price are required" },
        { status: 400 }
      );
    }

    // Check if product already exists in this price list
    const existingItem = await prisma.priceListItem.findFirst({
      where: {
        priceListId: id,
        productId: productId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already exists in this price list" },
        { status: 400 }
      );
    }

    // Verify the price list exists
    const priceList = await prisma.priceList.findUnique({
      where: { id },
    });

    if (!priceList) {
      return NextResponse.json(
        { error: "Price list not found" },
        { status: 404 }
      );
    }

    // Verify the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const item = await prisma.priceListItem.create({
      data: {
        priceListId: id,
        productId,
        unitPrice: parseFloat(unitPrice),
        basePrice: basePrice ? parseFloat(basePrice) : null,
        exchangeRate: exchangeRate ? parseFloat(exchangeRate) : null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding item to price list:", error);
    return NextResponse.json(
      { error: "Failed to add item to price list" },
      { status: 500 }
    );
  }
}
