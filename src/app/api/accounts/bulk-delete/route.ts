import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No account IDs provided" }, { status: 400 });
    }

    const result = await prisma.account.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({ 
      message: `Successfully deleted ${result.count} account(s)`,
      deletedCount: result.count 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk delete accounts error:", error);
    return NextResponse.json({ 
      error: "Failed to delete accounts", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
