import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const priceList = await prisma.priceList.findUnique({
      where: {
        id: id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                uomSell: true,
                price: true,
                cost: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!priceList) {
      return NextResponse.json(
        { error: "Price list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(priceList);
  } catch (error) {
    console.error("Error fetching price list:", error);
    return NextResponse.json(
      { error: "Failed to fetch price list" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      channel,
      currency,
      effectiveFrom,
      effectiveTo,
    } = body;

    // Validate required fields
    if (!name || !channel) {
      return NextResponse.json(
        { error: "Name and channel are required" },
        { status: 400 }
      );
    }

    // Check if price list exists
    const existingPriceList = await prisma.priceList.findUnique({
      where: { id },
    });

    if (!existingPriceList) {
      return NextResponse.json(
        { error: "Price list not found" },
        { status: 404 }
      );
    }

    // Check if name already exists for the same channel (excluding current price list)
    const duplicatePriceList = await prisma.priceList.findFirst({
      where: {
        name,
        channel,
        id: { not: id },
      },
    });

    if (duplicatePriceList) {
      return NextResponse.json(
        { error: "Price list with this name already exists for this channel" },
        { status: 400 }
      );
    }

    const updatedPriceList = await prisma.priceList.update({
      where: { id },
      data: {
        name,
        channel,
        currency,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                uomSell: true,
                price: true,
                cost: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPriceList);
  } catch (error) {
    console.error("Error updating price list:", error);
    return NextResponse.json(
      { error: "Failed to update price list" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Attempting to delete price list:", id);

    // Check if price list exists
    const existingPriceList = await prisma.priceList.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
          }
        }
      }
    });

    if (!existingPriceList) {
      console.log("Price list not found:", id);
      return NextResponse.json(
        { error: "Price list not found" },
        { status: 404 }
      );
    }

    console.log(`Price list found with ${existingPriceList.items.length} items`);

    // Delete the price list items first (if any)
    if (existingPriceList.items.length > 0) {
      console.log("Deleting price list items first...");
      await prisma.priceListItem.deleteMany({
        where: { priceListId: id }
      });
      console.log("Price list items deleted successfully");
    }

    // Delete the price list
    console.log("Deleting price list...");
    await prisma.priceList.delete({
      where: { id },
    });
    console.log("Price list deleted successfully");

    return NextResponse.json({ message: "Price list deleted successfully" });
  } catch (error) {
    console.error("Error deleting price list:", error);
    return NextResponse.json(
      { error: `Failed to delete price list: ${error.message}` },
      { status: 500 }
    );
  }
}
