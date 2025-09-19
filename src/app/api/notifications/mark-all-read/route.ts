import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/notifications/mark-all-read - Mark all user notifications as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all user notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        readAt: null
      },
      data: {
        readAt: new Date(),
        status: 'READ'
      }
    });

    return NextResponse.json({ 
      message: `${result.count} notifications marked as read`,
      count: result.count
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
