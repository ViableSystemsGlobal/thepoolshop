import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.notification.count({ where })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      userId, 
      type, 
      title, 
      message, 
      channels, 
      data, 
      scheduledAt 
    } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, title, message" },
        { status: 400 }
      );
    }

    // Validate channels
    const validChannels = ['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'];
    const notificationChannels = channels || ['IN_APP'];
    
    if (!notificationChannels.every((channel: string) => validChannels.includes(channel))) {
      return NextResponse.json(
        { error: "Invalid notification channel" },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        channels: JSON.stringify(notificationChannels),
        status: 'PENDING',
        data: data ? JSON.stringify(data) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        status: true,
        channels: true,
        scheduledAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'notification.created',
        resource: 'Notification',
        resourceId: notification.id,
        newData: { type, title, userId }
      }
    });

    return NextResponse.json({ 
      notification,
      message: "Notification created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
