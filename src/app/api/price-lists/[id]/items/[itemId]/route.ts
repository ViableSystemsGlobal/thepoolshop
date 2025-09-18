import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Update a price list item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { unitPrice, basePrice, exchangeRate } = body;

    // Validate required fields
    if (unitPrice === undefined) {
      return NextResponse.json(
        { error: "Unit price is required" },
        { status: 400 }
      );
    }

    // Check if the item exists and belongs to the price list
    const existingItem = await prisma.priceListItem.findFirst({
      where: {
        id: itemId,
        priceListId: id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Price list item not found" },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.priceListItem.update({
      where: { id: itemId },
      data: {
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating price list item:", error);
    return NextResponse.json(
      { error: "Failed to update price list item" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a price list item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;

    // Check if the item exists and belongs to the price list
    const existingItem = await prisma.priceListItem.findFirst({
      where: {
        id: itemId,
        priceListId: id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Price list item not found" },
        { status: 404 }
      );
    }

    await prisma.priceListItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item removed from price list" });
  } catch (error) {
    console.error("Error deleting price list item:", error);
    return NextResponse.json(
      { error: "Failed to delete price list item" },
      { status: 500 }
    );
  }
}
