import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

// DELETE /api/products/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // Find the document in the database
    const document = await prisma.productDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete the file from filesystem
    try {
      await unlink(document.filePath);
    } catch (fileError) {
      console.warn('File not found on filesystem:', document.filePath);
    }

    // Delete the database record
    await prisma.productDocument.delete({
      where: { id: documentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
