import { NextRequest, NextResponse } from "next/server";

// GET /api/products/[id]/documents - Get documents for a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // In a real application, you would fetch from database
    // For now, we'll return mock data
    const documents = [
      {
        id: 'doc_1',
        filename: 'Product Manual.pdf',
        size: 1024000,
        type: 'application/pdf',
        productId,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'doc_2',
        filename: 'Certificate.jpg',
        size: 512000,
        type: 'image/jpeg',
        productId,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 'doc_3',
        filename: 'Specifications.docx',
        size: 256000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        productId,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      }
    ];

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
