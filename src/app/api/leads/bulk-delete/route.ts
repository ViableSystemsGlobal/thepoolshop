import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No lead IDs provided" }, { status: 400 });
    }

    const result = await prisma.lead.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({ 
      message: `Successfully deleted ${result.count} lead(s)`,
      deletedCount: result.count 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk delete leads error:", error);
    return NextResponse.json({ 
      error: "Failed to delete leads", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
