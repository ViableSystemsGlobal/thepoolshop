import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET /api/tasks/[id]/attachments - Get all attachments for a task
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

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    console.error("Error fetching task attachments:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch task attachments",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/attachments - Upload an attachment to a task
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'tasks', taskId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop() || '';
    const fileName = `${timestamp}-${originalName}`;
    const filePath = join(uploadsDir, fileName);
    const relativePath = `uploads/tasks/${taskId}/${fileName}`;

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save attachment record to database
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        fileName,
        originalName,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error("Error uploading task attachment:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload attachment",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
