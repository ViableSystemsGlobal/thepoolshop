import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// POST /api/test/add-grn-to-movements - Add GRN to movements that don't have one
export async function POST(request: NextRequest) {
  try {
    // Find movements that don't have GRN in their notes
    const movementsWithoutGRN = await prisma.stockMovement.findMany({
      where: {
        OR: [
          { notes: null },
          { notes: { not: { contains: 'GRN:' } } }
        ]
      },
      select: { id: true, notes: true, reference: true }
    });

    if (movementsWithoutGRN.length === 0) {
      return NextResponse.json({
        message: "All movements already have GRN documents",
        count: 0
      });
    }

    // Create a test GRN file
    const testGrnPath = `uploads/stock-movements/bulk-grn-${Date.now()}.pdf`;
    const fullGrnPath = path.join(process.cwd(), testGrnPath);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(fullGrnPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Create a simple test PDF content
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
(Bulk GRN Document) Tj
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

    // Update all movements without GRN
    let updatedCount = 0;
    for (const movement of movementsWithoutGRN) {
      const updatedNotes = movement.notes 
        ? `${movement.notes}\n\nGRN: ${testGrnPath}`
        : `GRN: ${testGrnPath}`;
        
      await prisma.stockMovement.update({
        where: { id: movement.id },
        data: { notes: updatedNotes }
      });
      updatedCount++;
    }

    return NextResponse.json({
      message: "GRN documents added to movements",
      movementsFound: movementsWithoutGRN.length,
      movementsUpdated: updatedCount,
      grnPath: testGrnPath
    });
  } catch (error) {
    console.error("Error adding GRN to movements:", error);
    return NextResponse.json(
      { error: "Failed to add GRN to movements" },
      { status: 500 }
    );
  }
}
