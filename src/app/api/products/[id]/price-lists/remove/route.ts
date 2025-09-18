import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const priceListId = searchParams.get('priceListId');

    if (!priceListId) {
      return NextResponse.json(
        { error: "Price List ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the price list item
    const deletedItem = await prisma.priceListItem.deleteMany({
      where: {
        priceListId,
        productId,
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: "Product not found in this price list" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product removed from price list successfully" });
  } catch (error) {
    console.error("Error removing product from price list:", error);
    return NextResponse.json(
      { error: "Failed to remove product from price list" },
      { status: 500 }
    );
  }
}
