import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// GET /api/tasks/[id]/attachments/[attachmentId] - Download an attachment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId, attachmentId } = await params;

    // Verify attachment exists and user has access
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            assignees: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    if (!attachment || attachment.taskId !== taskId) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Check if user has access to this task (creator, assignee, or admin)
    const task = attachment.task;
    const isCreator = task.createdBy === session.user.id;
    const isAssignee = task.assignedTo === session.user.id || task.assignees.length > 0;
    const userRole = session.user.role;
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    if (!isCreator && !isAssignee && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Read file from disk
    const filePath = join(process.cwd(), attachment.filePath);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': attachment.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
        'Content-Length': attachment.fileSize.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading attachment:", error);
    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/attachments/[attachmentId] - Delete an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId, attachmentId } = params;

    // Verify attachment exists and user has access
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            assignees: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    if (!attachment || attachment.taskId !== taskId) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Check if user has access to delete (uploader, task creator, or admin)
    const task = attachment.task;
    const isUploader = attachment.uploadedBy === session.user.id;
    const isCreator = task.createdBy === session.user.id;
    const userRole = session.user.role;
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    if (!isUploader && !isCreator && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete file from disk
    const filePath = join(process.cwd(), attachment.filePath);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (fileError) {
        console.error("Error deleting file from disk:", fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete attachment record from database
    await prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
