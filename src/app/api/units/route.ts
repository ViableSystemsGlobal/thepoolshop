import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/units - Get all units
export async function GET() {
  try {
    // For now, return predefined units since we don't have a units table yet
    const units = [
      { id: "pcs", name: "Pieces", symbol: "pcs", type: "count" },
      { id: "kg", name: "Kilograms", symbol: "kg", type: "weight" },
      { id: "g", name: "Grams", symbol: "g", type: "weight" },
      { id: "lb", name: "Pounds", symbol: "lb", type: "weight" },
      { id: "m", name: "Meters", symbol: "m", type: "length" },
      { id: "cm", name: "Centimeters", symbol: "cm", type: "length" },
      { id: "ft", name: "Feet", symbol: "ft", type: "length" },
      { id: "in", name: "Inches", symbol: "in", type: "length" },
      { id: "l", name: "Liters", symbol: "l", type: "volume" },
      { id: "ml", name: "Milliliters", symbol: "ml", type: "volume" },
      { id: "gal", name: "Gallons", symbol: "gal", type: "volume" },
      { id: "box", name: "Boxes", symbol: "box", type: "count" },
      { id: "pack", name: "Packs", symbol: "pack", type: "count" },
      { id: "set", name: "Sets", symbol: "set", type: "count" },
      { id: "pair", name: "Pairs", symbol: "pair", type: "count" },
    ];

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// POST /api/units - Create a new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, symbol, type } = body;

    if (!name || !symbol || !type) {
      return NextResponse.json(
        { error: "Name, symbol, and type are required" },
        { status: 400 }
      );
    }

    // For now, just return success since we don't have a units table
    // TODO: Implement actual unit creation when we add the units table
    const newUnit = {
      id: symbol.toLowerCase(),
      name,
      symbol,
      type,
    };

    return NextResponse.json(newUnit, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
