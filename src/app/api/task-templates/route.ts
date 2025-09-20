import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/task-templates - Get all task templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.taskTemplate.findMany({
      where: {
        isActive: true
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return NextResponse.json(
      { error: "Failed to fetch task templates" },
      { status: 500 }
    );
  }
}

// POST /api/task-templates - Create a new task template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      priority,
      estimatedDuration,
      categoryId,
      items
    } = body;

    // Validate required fields
    if (!name || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Name and at least one template item are required" },
        { status: 400 }
      );
    }

    // Create template with items
    const template = await prisma.taskTemplate.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        categoryId: categoryId || null,
        createdBy: session.user.id,
        items: {
          create: items.map((item: any, index: number) => ({
            title: item.title,
            description: item.description || null,
            order: index,
            isRequired: item.isRequired || false
          }))
        }
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating task template:', error);
    return NextResponse.json(
      { error: "Failed to create task template" },
      { status: 500 }
    );
  }
}
