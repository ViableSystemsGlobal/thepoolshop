import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/lead-sources - Get all lead sources
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get lead sources from system settings
    const sources = await prisma.systemSettings.findMany({
      where: {
        key: {
          startsWith: 'lead_source_'
        },
        isActive: true
      },
      orderBy: {
        value: 'asc'
      }
    });

    // Transform the data to match expected format
    const leadSources = sources.map(source => ({
      id: source.id,
      name: source.value,
      description: source.description,
      isActive: source.isActive,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt
    }));

    return NextResponse.json({ sources: leadSources });
  } catch (error) {
    console.error('Error fetching lead sources:', error);
    return NextResponse.json(
      { error: "Failed to fetch lead sources" },
      { status: 500 }
    );
  }
}

// POST /api/lead-sources - Create a new lead source
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Source name is required" },
        { status: 400 }
      );
    }

    // Check if source already exists
    const existingSource = await prisma.systemSettings.findFirst({
      where: {
        key: {
          startsWith: 'lead_source_'
        },
        value: name.trim()
      }
    });

    if (existingSource) {
      return NextResponse.json(
        { error: "Source with this name already exists" },
        { status: 400 }
      );
    }

    // Create new source
    const newSource = await prisma.systemSettings.create({
      data: {
        key: `lead_source_${Date.now()}`,
        value: name.trim(),
        description: description?.trim() || null,
        type: 'string',
        category: 'lead_sources',
        isActive: true
      }
    });

    return NextResponse.json({
      source: {
        id: newSource.id,
        name: newSource.value,
        description: newSource.description,
        isActive: newSource.isActive,
        createdAt: newSource.createdAt,
        updatedAt: newSource.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead source:', error);
    return NextResponse.json(
      { error: "Failed to create lead source" },
      { status: 500 }
    );
  }
}
