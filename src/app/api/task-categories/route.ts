import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/task-categories - Get all task categories
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.taskCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            tasks: true,
            templates: true
          }
        }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching task categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch task categories" },
      { status: 500 }
    );
  }
}

// POST /api/task-categories - Create new task category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.taskCategory.findUnique({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.taskCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#3B82F6",
      },
      include: {
        _count: {
          select: {
            tasks: true,
            templates: true
          }
        }
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating task category:", error);
    return NextResponse.json(
      { error: "Failed to create task category" },
      { status: 500 }
    );
  }
}
