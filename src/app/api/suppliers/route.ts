import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      taxId,
      paymentTerms,
      status,
      notes,
    } = body || {};

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        country: country || 'Ghana',
        taxId: taxId || null,
        paymentTerms: paymentTerms || null,
        status: (status as any) || 'ACTIVE',
        notes: notes || null,
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    console.error("Error details:", error?.message);
    console.error("Error code:", error?.code);
    console.error("Error stack:", error?.stack);
    const message = error?.message || 'Failed to create supplier';
    return NextResponse.json({ error: message, details: error?.code }, { status: 500 });
  }
}


