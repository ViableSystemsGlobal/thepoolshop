import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/task-templates/[id] - Get a specific task template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.taskTemplate.findUnique({
      where: { id },
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

    if (!template) {
      return NextResponse.json(
        { error: "Task template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching task template:', error);
    return NextResponse.json(
      { error: "Failed to fetch task template" },
      { status: 500 }
    );
  }
}

// PUT /api/task-templates/[id] - Update a task template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      priority,
      estimatedDuration,
      categoryId,
      items,
      isActive
    } = body;

    // Check if template exists
    const existingTemplate = await prisma.taskTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Task template not found" },
        { status: 404 }
      );
    }

    // Update template and items in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Update template
      const updatedTemplate = await tx.taskTemplate.update({
        where: { id },
        data: {
          name,
          description,
          priority,
          estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
          categoryId: categoryId || null,
          isActive: isActive !== undefined ? isActive : true
        }
      });

      // Update items (delete all and recreate)
      if (items) {
        await tx.taskTemplateItem.deleteMany({
          where: { templateId: id }
        });

        await tx.taskTemplateItem.createMany({
          data: items.map((item: any, index: number) => ({
            templateId: id,
            title: item.title,
            description: item.description || null,
            order: index,
            isRequired: item.isRequired || false
          }))
        });
      }

      return updatedTemplate;
    });

    // Fetch updated template with relations
    const templateWithRelations = await prisma.taskTemplate.findUnique({
      where: { id },
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

    return NextResponse.json(templateWithRelations);
  } catch (error) {
    console.error('Error updating task template:', error);
    return NextResponse.json(
      { error: "Failed to update task template" },
      { status: 500 }
    );
  }
}

// DELETE /api/task-templates/[id] - Delete a task template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if template exists
    const existingTemplate = await prisma.taskTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Task template not found" },
        { status: 404 }
      );
    }

    // Check if template is being used by any tasks
    const tasksUsingTemplate = await prisma.task.count({
      where: { templateId: id }
    });

    if (tasksUsingTemplate > 0) {
      // Soft delete by setting isActive to false
      await prisma.taskTemplate.update({
        where: { id },
        data: { isActive: false }
      });
    } else {
      // Hard delete if not in use
      await prisma.taskTemplate.delete({
        where: { id }
      });
    }

    return NextResponse.json({ message: "Task template deleted successfully" });
  } catch (error) {
    console.error('Error deleting task template:', error);
    return NextResponse.json(
      { error: "Failed to delete task template" },
      { status: 500 }
    );
  }
}
