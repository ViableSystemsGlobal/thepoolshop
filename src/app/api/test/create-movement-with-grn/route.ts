import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// POST /api/test/create-movement-with-grn - Create a test movement with GRN
export async function POST(request: NextRequest) {
  try {
    // Get the first product and warehouse for testing
    const product = await prisma.product.findFirst();
    const warehouse = await prisma.warehouse.findFirst();
    
    if (!product || !warehouse) {
      return NextResponse.json(
        { error: "No products or warehouses found. Please create some first." },
        { status: 400 }
      );
    }

    // Get or create stock item
    let stockItem = await prisma.stockItem.findFirst({
      where: { 
        productId: product.id,
        warehouseId: warehouse.id
      },
    });

    if (!stockItem) {
      stockItem = await prisma.stockItem.create({
        data: {
          productId: product.id,
          quantity: 0,
          reserved: 0,
          available: 0,
          averageCost: 0,
          totalValue: 0,
          warehouseId: warehouse.id,
        },
      });
    }

    // Create a test GRN file
    const testGrnPath = `uploads/stock-movements/test-grn-${Date.now()}.pdf`;
    const fullGrnPath = path.join(process.cwd(), testGrnPath);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(fullGrnPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Create a simple test PDF content (this is just a placeholder)
    const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test GRN Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    await fs.writeFile(fullGrnPath, testPdfContent);

    // Create the stock movement with GRN reference
    const movement = await prisma.stockMovement.create({
      data: {
        productId: product.id,
        stockItemId: stockItem.id,
        type: 'RECEIPT',
        quantity: 10,
        unitCost: 25.50,
        totalCost: 255.00,
        reference: `TEST-GRN-${Date.now()}`,
        reason: 'Test movement with GRN',
        notes: `Test movement for GRN download functionality.\n\nGRN: ${testGrnPath}`,
        warehouseId: warehouse.id,
      },
    });

    // Update stock quantities
    await prisma.stockItem.update({
      where: { id: stockItem.id },
      data: {
        quantity: stockItem.quantity + 10,
        available: stockItem.quantity + 10,
        averageCost: 25.50,
        totalValue: (stockItem.quantity + 10) * 25.50,
      },
    });

    return NextResponse.json({
      message: "Test movement with GRN created successfully",
      movement: {
        id: movement.id,
        reference: movement.reference,
        notes: movement.notes,
        grnPath: testGrnPath
      }
    });
  } catch (error) {
    console.error("Error creating test movement:", error);
    return NextResponse.json(
      { error: "Failed to create test movement" },
      { status: 500 }
    );
  }
}
