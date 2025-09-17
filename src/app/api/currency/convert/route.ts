import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/currency/convert - Convert currency
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromCurrency, toCurrency, amount } = body;

    if (!fromCurrency || !toCurrency || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: fromCurrency, toCurrency, amount' },
        { status: 400 }
      );
    }

    if (fromCurrency === toCurrency) {
      return NextResponse.json({
        convertedAmount: amount,
        exchangeRate: 1,
        fromCurrency,
        toCurrency
      });
    }

    // Get the exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency,
        toCurrency,
        isActive: true,
        effectiveFrom: {
          lte: new Date()
        },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ]
      },
      orderBy: {
        effectiveFrom: 'desc'
      }
    });

    if (!exchangeRate) {
      return NextResponse.json(
        { error: `Exchange rate not found for ${fromCurrency} to ${toCurrency}` },
        { status: 404 }
      );
    }

    const convertedAmount = amount * exchangeRate.rate;

    return NextResponse.json({
      convertedAmount,
      exchangeRate: exchangeRate.rate,
      fromCurrency,
      toCurrency,
      source: exchangeRate.source,
      effectiveFrom: exchangeRate.effectiveFrom
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}