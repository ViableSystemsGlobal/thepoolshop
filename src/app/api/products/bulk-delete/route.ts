import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    // Delete products in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First delete related stock items
      await tx.stockItem.deleteMany({
        where: {
          productId: {
            in: ids
          }
        }
      });

      // Then delete stock movements
      await tx.stockMovement.deleteMany({
        where: {
          productId: {
            in: ids
          }
        }
      });

      // Finally delete the products
      const deletedProducts = await tx.product.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });

      return deletedProducts;
    });

    return NextResponse.json({ 
      message: `Successfully deleted ${result.count} product(s)`,
      deletedCount: result.count 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk delete products error:", error);
    return NextResponse.json({ 
      error: "Failed to delete products", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
