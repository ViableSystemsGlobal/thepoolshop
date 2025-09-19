import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/notifications/[id]/mark-read - Mark notification as read
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

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { 
        readAt: new Date(),
        status: 'READ'
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        status: true,
        readAt: true
      }
    });

    return NextResponse.json({ 
      notification: updatedNotification,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
