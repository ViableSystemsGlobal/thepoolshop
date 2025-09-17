import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No account IDs provided" }, { status: 400 });
    }

    const accounts = await prisma.account.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    const exportData = accounts.map(account => ({
      'Name': account.name,
      'Type': account.type,
      'Email': account.email || '',
      'Phone': account.phone || '',
      'Address': account.address || '',
      'City': account.city || '',
      'State': account.state || '',
      'Country': account.country || '',
      'Website': account.website || '',
      'Notes': account.notes || '',
      'Created Date': new Date(account.createdAt).toLocaleDateString()
    }));

    return NextResponse.json({ 
      data: exportData,
      filename: `accounts_export_${new Date().toISOString().split('T')[0]}.csv`
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk export accounts error:", error);
    return NextResponse.json({ 
      error: "Failed to export accounts", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
