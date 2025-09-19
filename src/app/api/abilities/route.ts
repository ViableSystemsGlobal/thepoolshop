import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/abilities - Get all abilities
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const abilities = await prisma.ability.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ abilities });
  } catch (error) {
    console.error('Error fetching abilities:', error);
    return NextResponse.json(
      { error: "Failed to fetch abilities" },
      { status: 500 }
    );
  }
}

// POST /api/abilities - Create a new ability
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, resource, action, description } = body;

    // Validate required fields
    if (!name || !resource || !action) {
      return NextResponse.json(
        { error: "Name, resource, and action are required" },
        { status: 400 }
      );
    }

    // Check if ability already exists
    const existingAbility = await prisma.ability.findFirst({
      where: {
        name,
        resource,
        action
      }
    });

    if (existingAbility) {
      return NextResponse.json(
        { error: "Ability with this combination already exists" },
        { status: 400 }
      );
    }

    const ability = await prisma.ability.create({
      data: {
        name,
        resource,
        action,
        description
      }
    });

    return NextResponse.json({ ability }, { status: 201 });
  } catch (error) {
    console.error('Error creating ability:', error);
    return NextResponse.json(
      { error: "Failed to create ability" },
      { status: 500 }
    );
  }
}
