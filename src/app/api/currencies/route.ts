import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/currencies - Get all active currencies
export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}