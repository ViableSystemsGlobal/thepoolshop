import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notifications/[id] - Get specific notification
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

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        status: true,
        channels: true,
        scheduledAt: true,
        sentAt: true,
        readAt: true,
        createdAt: true,
        data: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Check if user owns this notification or is admin
    if (notification.user.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id] - Update notification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, message, title } = body;

    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(message && { message }),
        ...(title && { title })
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        status: true,
        channels: true,
        scheduledAt: true,
        sentAt: true,
        readAt: true,
        createdAt: true,
        data: true
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'notification.updated',
        resource: 'Notification',
        resourceId: id,
        oldData: existingNotification,
        newData: updatedNotification
      }
    });

    return NextResponse.json({ 
      notification: updatedNotification,
      message: "Notification updated successfully"
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'notification.deleted',
        resource: 'Notification',
        resourceId: id,
        oldData: existingNotification
      }
    });

    return NextResponse.json({ 
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
