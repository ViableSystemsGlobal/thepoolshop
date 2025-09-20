import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/[id]/comments - Get all comments for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - No valid session" }, { status: 401 });
    }

    const { id: taskId } = await params;

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to this task (creator, assignee, or admin)
    const isCreator = task.createdBy === session.user.id;
    const isAssignee = task.assignedTo === session.user.id || task.assignees.length > 0;
    const userRole = session.user.role;
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    if (!isCreator && !isAssignee && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching task comments:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch task comments",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/comments - Add a comment to a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to this task (creator, assignee, or admin)
    const isCreator = task.createdBy === session.user.id;
    const isAssignee = task.assignedTo === session.user.id || task.assignees.length > 0;
    const userRole = session.user.role;
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    if (!isCreator && !isAssignee && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: session.user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating task comment:", error);
    return NextResponse.json(
      { 
        error: "Failed to create task comment",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
