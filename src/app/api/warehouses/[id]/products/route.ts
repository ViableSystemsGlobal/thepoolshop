import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/warehouses/[id]/products - Get all products in a specific warehouse
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    // Get all products that have stock items in this warehouse
    const products = await prisma.product.findMany({
      where: {
        stockItems: {
          some: {
            warehouseId: id,
          },
        },
      },
      include: {
        category: true,
        stockItems: {
          where: {
            warehouseId: id,
          },
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching warehouse products:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse products" },
      { status: 500 }
    );
  }
}
