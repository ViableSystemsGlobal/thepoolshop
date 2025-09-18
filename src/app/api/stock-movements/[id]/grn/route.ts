import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// GET /api/stock-movements/[id]/grn - Download GRN file for a stock movement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the stock movement
    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      select: { notes: true }
    });

    if (!movement) {
      return NextResponse.json(
        { error: "Stock movement not found" },
        { status: 404 }
      );
    }

    // Extract GRN file path from notes - try multiple patterns
    let grnPath: string | null = null;
    
    // Try different patterns to find GRN file path
    const patterns = [
      /GRN: (uploads\/stock-movements\/[^\n\s]+)/,
      /grn: (uploads\/stock-movements\/[^\n\s]+)/,
      /(uploads\/stock-movements\/[^\n\s]*grn[^\n\s]*)/i
    ];
    
    for (const pattern of patterns) {
      const match = movement.notes?.match(pattern);
      if (match) {
        grnPath = match[1];
        break;
      }
    }
    
    if (!grnPath) {
      return NextResponse.json(
        { error: "No GRN document found for this movement" },
        { status: 404 }
      );
    }
    const fullPath = path.join(process.cwd(), grnPath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: "GRN file not found on server" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(grnPath);

    // Return the file
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading GRN:", error);
    return NextResponse.json(
      { error: "Failed to download GRN file" },
      { status: 500 }
    );
  }
}
