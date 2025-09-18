import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Fetch all price lists that contain this product
    const priceLists = await prisma.priceList.findMany({
      where: {
        items: {
          some: {
            productId: productId,
          },
        },
      },
      include: {
        items: {
          where: {
            productId: productId,
          },
          select: {
            id: true,
            unitPrice: true,
            basePrice: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(priceLists);
  } catch (error) {
    console.error("Error fetching price lists for product:", error);
    return NextResponse.json(
      { error: "Failed to fetch price lists for product" },
      { status: 500 }
    );
  }
}
