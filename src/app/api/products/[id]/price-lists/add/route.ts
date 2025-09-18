import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { priceListId, unitPrice, basePrice } = body;

    if (!priceListId || !unitPrice) {
      return NextResponse.json(
        { error: "Price List ID and Unit Price are required" },
        { status: 400 }
      );
    }

    // Check if the product already exists in this price list
    const existingItem = await prisma.priceListItem.findFirst({
      where: {
        priceListId,
        productId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already exists in this price list" },
        { status: 409 }
      );
    }

    const priceListItem = await prisma.priceListItem.create({
      data: {
        priceListId,
        productId,
        unitPrice: parseFloat(unitPrice),
        basePrice: basePrice ? parseFloat(basePrice) : null,
      },
    });

    return NextResponse.json(priceListItem, { status: 201 });
  } catch (error) {
    console.error("Error adding product to price list:", error);
    return NextResponse.json(
      { error: "Failed to add product to price list" },
      { status: 500 }
    );
  }
}
