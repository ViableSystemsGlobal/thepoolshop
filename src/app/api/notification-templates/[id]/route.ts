import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notification-templates/[id] - Get specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.notificationTemplate.findUnique({
      where: { id },
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

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching notification template:', error);
    return NextResponse.json(
      { error: "Failed to fetch notification template" },
      { status: 500 }
    );
  }
}

// PUT /api/notification-templates/[id] - Update template
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
    const { 
      name, 
      type, 
      channels, 
      subject, 
      body: templateBody, 
      variables, 
      isActive 
    } = body;

    // Check if template exists
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Validate channels if provided
    if (channels) {
      const validChannels = ['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'];
      if (!channels.every((channel: string) => validChannels.includes(channel))) {
        return NextResponse.json(
          { error: "Invalid notification channel" },
          { status: 400 }
        );
      }
    }

    // Check if new name conflicts with existing template
    if (name && name !== existingTemplate.name) {
      const nameConflict = await prisma.notificationTemplate.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Template with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update template
    const updatedTemplate = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(channels && { channels: JSON.stringify(channels) }),
        ...(subject !== undefined && { subject }),
        ...(templateBody !== undefined && { body: templateBody }),
        ...(variables !== undefined && { variables: JSON.stringify(variables) }),
        ...(isActive !== undefined && { isActive })
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
        createdAt: true,
        updatedAt: true
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'notification_template.updated',
        resource: 'NotificationTemplate',
        resourceId: id,
        oldData: existingTemplate,
        newData: updatedTemplate
      }
    });

    return NextResponse.json({ 
      template: updatedTemplate,
      message: "Notification template updated successfully"
    });
  } catch (error) {
    console.error('Error updating notification template:', error);
    return NextResponse.json(
      { error: "Failed to update notification template" },
      { status: 500 }
    );
  }
}

// DELETE /api/notification-templates/[id] - Delete template
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

    // Check if template exists
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Delete template
    await prisma.notificationTemplate.delete({
      where: { id }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'notification_template.deleted',
        resource: 'NotificationTemplate',
        resourceId: id,
        oldData: existingTemplate
      }
    });

    return NextResponse.json({ 
      message: "Notification template deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting notification template:', error);
    return NextResponse.json(
      { error: "Failed to delete notification template" },
      { status: 500 }
    );
  }
}
