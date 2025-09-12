import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/currencies - List all currencies
export async function GET(request: NextRequest) {
  try {
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json(currencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}

// POST /api/currencies - Create a new currency
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, symbol } = body;

    // Validate required fields
    if (!code || !name || !symbol) {
      return NextResponse.json(
        { error: "Code, name, and symbol are required" },
        { status: 400 }
      );
    }

    // Check if currency code already exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCurrency) {
      return NextResponse.json(
        { error: "Currency with this code already exists" },
        { status: 400 }
      );
    }

    const currency = await prisma.currency.create({
      data: {
        code: code.toUpperCase(),
        name,
        symbol,
        isActive: true,
      },
    });

    return NextResponse.json(currency, { status: 201 });
  } catch (error) {
    console.error("Error creating currency:", error);
    return NextResponse.json(
      { error: "Failed to create currency" },
      { status: 500 }
    );
  }
}
