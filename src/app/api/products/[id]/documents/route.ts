import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id]/documents - Get documents for a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Fetch documents from database
    const documents = await prisma.productDocument.findMany({
      where: {
        productId: productId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      documents
    });

  } catch (error) {
    console.error('Error fetching product documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product documents' },
      { status: 500 }
    );
  }
}
