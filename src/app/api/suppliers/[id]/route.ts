import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(taxId !== undefined ? { taxId } : {}),
        ...(paymentTerms !== undefined ? { paymentTerms } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    const message = (error as any)?.message || 'Failed to update supplier';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}


