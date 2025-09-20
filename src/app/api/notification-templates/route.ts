import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notification-templates - Get all notification templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const templates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        channels: true,
        subject: true,
        body: true,
        variables: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      { error: "Failed to fetch notification templates" },
      { status: 500 }
    );
  }
}

// POST /api/notification-templates - Create new notification template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      type, 
      channels, 
      subject, 
      body: templateBody, 
      variables, 
      isActive = true 
    } = body;

    if (!name || !type || !channels || !templateBody) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, channels, body" },
        { status: 400 }
      );
    }

    // Validate channels
    const validChannels = ['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'];
    if (!channels.every((channel: string) => validChannels.includes(channel))) {
      return NextResponse.json(
        { error: "Invalid notification channel" },
        { status: 400 }
      );
    }

    // Check if template name already exists
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { name }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 400 }
      );
    }

    // Create template
    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        type,
        channels: JSON.stringify(channels),
        subject,
        body: templateBody,
        variables: variables ? JSON.stringify(variables) : null,
        isActive
      },
      select: {
        id: true,
        name: true,
        type: true,
        channels: true,
        subject: true,
        body: true,
        variables: true,
        isActive: true,
        createdAt: true
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'notification_template.created',
        resource: 'NotificationTemplate',
        resourceId: template.id,
        newData: { name, type }
      }
    });

    return NextResponse.json({ 
      template,
      message: "Notification template created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json(
      { error: "Failed to create notification template" },
      { status: 500 }
    );
  }
}
