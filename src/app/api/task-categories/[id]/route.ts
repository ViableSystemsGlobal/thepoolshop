import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/task-categories/[id] - Update task category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, color, isActive } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if another category with the same name exists
    const existingCategory = await prisma.taskCategory.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.taskCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#3B82F6",
        isActive: isActive !== undefined ? isActive : undefined,
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

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating task category:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Task category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update task category" },
      { status: 500 }
    );
  }
}

// DELETE /api/task-categories/[id] - Delete task category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if category has associated tasks or templates
    const category = await prisma.taskCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
            templates: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: "Task category not found" },
        { status: 404 }
      );
    }

    if (category._count.tasks > 0 || category._count.templates > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It has ${category._count.tasks} task(s) and ${category._count.templates} template(s) assigned to it.` },
        { status: 409 }
      );
    }

    await prisma.taskCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task category:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Task category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete task category" },
      { status: 500 }
    );
  }
}
