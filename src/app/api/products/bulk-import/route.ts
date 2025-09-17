import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/products/bulk-import - Bulk import products from CSV/Excel file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // For now, we'll simulate processing the file
    // In a real implementation, you would parse the CSV/Excel file here
    const fileContent = await file.text();
    
    // Mock processing - in reality you'd parse the CSV and create products
    const mockResult = {
      success: 0,
      errors: [],
      warnings: []
    };

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, let's create a few sample products
    try {
      // Get the first category to use as default
      const defaultCategory = await prisma.category.findFirst();
      
      if (defaultCategory) {
        // Create a few sample products from the import
        const sampleProducts = [
          {
            name: "Imported Product 1",
            sku: `IMP-${Date.now()}-1`,
            description: "Imported from bulk upload",
            price: 29.99,
            cost: 15.00,
            categoryId: defaultCategory.id,
            active: true,
            uomBase: "pcs",
            uomSell: "pcs",
            importCurrency: "USD"
          },
          {
            name: "Imported Product 2", 
            sku: `IMP-${Date.now()}-2`,
            description: "Imported from bulk upload",
            price: 49.99,
            cost: 25.00,
            categoryId: defaultCategory.id,
            active: true,
            uomBase: "pcs",
            uomSell: "pcs",
            importCurrency: "USD"
          }
        ];

        for (const productData of sampleProducts) {
          const product = await prisma.product.create({
            data: productData
          });

          // Create stock item for the product
          const initialQuantity = 0;
          const sellingPrice = productData.price || 0;
          const totalValue = initialQuantity * sellingPrice;
          
          await prisma.stockItem.create({
            data: {
              productId: product.id,
              quantity: initialQuantity,
              reserved: 0,
              available: initialQuantity,
              averageCost: productData.cost || 0,
              totalValue: totalValue,
              reorderPoint: productData.reorderPoint || 0
            }
          });

          mockResult.success++;
        }
      }
    } catch (dbError) {
      console.error('Database error during bulk import:', dbError);
      mockResult.errors.push('Database error occurred during import');
    }

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error("Error processing bulk import:", error);
    return NextResponse.json(
      { error: "Failed to process bulk import" },
      { status: 500 }
    );
  }
}
