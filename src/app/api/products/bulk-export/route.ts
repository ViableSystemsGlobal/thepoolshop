import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    // Fetch products with their related data
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        category: true,
        stockItems: {
          include: {
            warehouse: true
          }
        }
      }
    });

    // Transform data for export
    const exportData = products.map(product => ({
      'Product Name': product.name,
      'SKU': product.sku,
      'Description': product.description || '',
      'Category': product.category?.name || 'Uncategorized',
      'Unit Price': product.unitPrice,
      'Cost Price': product.costPrice,
      'Status': product.isActive ? 'Active' : 'Inactive',
      'Total Stock': product.stockItems.reduce((sum, item) => sum + item.quantity, 0),
      'Warehouses': product.stockItems.map(item => `${item.warehouse.name} (${item.quantity})`).join(', '),
      'Created Date': new Date(product.createdAt).toLocaleDateString(),
      'Last Updated': new Date(product.updatedAt).toLocaleDateString()
    }));

    return NextResponse.json({ 
      data: exportData,
      filename: `products_export_${new Date().toISOString().split('T')[0]}.csv`
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk export products error:", error);
    return NextResponse.json({ 
      error: "Failed to export products", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
