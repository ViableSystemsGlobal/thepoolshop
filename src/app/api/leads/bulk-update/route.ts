import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const { ids, status }: { ids: string[]; status: string } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No lead IDs provided" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const result = await prisma.lead.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
      }
    });

    return NextResponse.json({ 
      message: `Successfully updated ${result.count} lead(s) to ${status.toLowerCase()}`,
      updatedCount: result.count 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk update leads error:", error);
    return NextResponse.json({ 
      error: "Failed to update leads", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
