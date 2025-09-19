import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/abilities/public - Get all abilities without authentication
export async function GET() {
  try {
    const abilities = await prisma.ability.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ abilities });
  } catch (error) {
    console.error('Error fetching public abilities:', error);
    return NextResponse.json(
      { error: "Failed to fetch abilities" },
      { status: 500 }
    );
  }
}
