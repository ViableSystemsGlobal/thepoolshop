import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No lead IDs provided" }, { status: 400 });
    }

    const leads = await prisma.lead.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        owner: true
      }
    });

    const exportData = leads.map(lead => ({
      'First Name': lead.firstName,
      'Last Name': lead.lastName,
      'Email': lead.email || '',
      'Phone': lead.phone || '',
      'Company': lead.company || '',
      'Source': lead.source || '',
      'Status': lead.status,
      'Score': lead.score,
      'Owner': lead.owner?.name || '',
      'Notes': lead.notes || '',
      'Created Date': new Date(lead.createdAt).toLocaleDateString()
    }));

    return NextResponse.json({ 
      data: exportData,
      filename: `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Bulk export leads error:", error);
    return NextResponse.json({ 
      error: "Failed to export leads", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
