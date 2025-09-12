import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/currency";

// POST /api/currency/convert - Convert currency
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromCurrency, toCurrency, amount, date } = body;

    // Validate required fields
    if (!fromCurrency || !toCurrency || amount === undefined) {
      return NextResponse.json(
        { error: "fromCurrency, toCurrency, and amount are required" },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const conversion = await convertCurrency(
      fromCurrency,
      toCurrency,
      amount,
      date ? new Date(date) : undefined
    );

    if (!conversion) {
      return NextResponse.json(
        { error: `Unable to convert from ${fromCurrency} to ${toCurrency}` },
        { status: 400 }
      );
    }

    return NextResponse.json(conversion);
  } catch (error) {
    console.error("Error converting currency:", error);
    return NextResponse.json(
      { error: "Failed to convert currency" },
      { status: 500 }
    );
  }
}
