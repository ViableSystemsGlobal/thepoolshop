import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/currency";

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency, amount, date } = await request.json();

    if (!fromCurrency || !toCurrency || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters: fromCurrency, toCurrency, amount" },
        { status: 400 }
      );
    }

    const conversion = await convertCurrency(fromCurrency, toCurrency, amount, date ? new Date(date) : undefined);

    if (!conversion) {
      return NextResponse.json(
        { error: `Unable to convert ${fromCurrency} to ${toCurrency}` },
        { status: 400 }
      );
    }

    return NextResponse.json(conversion);
  } catch (error) {
    console.error("Error in currency conversion API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}