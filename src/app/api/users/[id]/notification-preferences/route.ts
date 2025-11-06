import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/users/[id]/notification-preferences - Get user's notification preferences
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

    // Users can only access their own preferences unless they're admin
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Default notification preferences
    const defaultPreferences = {
      notifications: {
        enabled: true,
        channels: {
          email: true,
          sms: false,
          whatsapp: false,
          inApp: true
        },
        types: {
          stockLow: true,
          stockOut: true,
          orderStatus: true,
          paymentReceived: true,
          userInvited: true,
          passwordReset: true,
          securityAlert: true,
          systemAlert: true,
          custom: true
        },
        frequency: {
          immediate: true,
          daily: false,
          weekly: false
        },
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
          timezone: "UTC"
        }
      }
    };

    // Merge with user's saved preferences
    const userPreferences = user.preferences as any || {};
    const notificationPreferences = {
      ...defaultPreferences.notifications,
      ...userPreferences.notifications
    };

    return NextResponse.json({
      userId: user.id,
      preferences: notificationPreferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/notification-preferences - Update user's notification preferences
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

    // Users can only update their own preferences unless they're admin
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences data is required" },
        { status: 400 }
      );
    }

    // Validate preferences structure
    const validChannels = ['email', 'sms', 'whatsapp', 'inApp'];
    const validTypes = ['stockLow', 'stockOut', 'orderStatus', 'paymentReceived', 'userInvited', 'passwordReset', 'securityAlert', 'systemAlert', 'custom'];
    const validFrequencies = ['immediate', 'daily', 'weekly'];

    // Validate channels
    if (preferences.channels) {
      for (const channel of Object.keys(preferences.channels)) {
        if (!validChannels.includes(channel)) {
          return NextResponse.json(
            { error: `Invalid notification channel: ${channel}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate types
    if (preferences.types) {
      for (const type of Object.keys(preferences.types)) {
        if (!validTypes.includes(type)) {
          return NextResponse.json(
            { error: `Invalid notification type: ${type}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate frequency
    if (preferences.frequency) {
      for (const freq of Object.keys(preferences.frequency)) {
        if (!validFrequencies.includes(freq)) {
          return NextResponse.json(
            { error: `Invalid notification frequency: ${freq}` },
            { status: 400 }
          );
        }
      }
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id },
      select: { preferences: true }
    });

    const currentPreferences = (user?.preferences as any) || {};
    
    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...currentPreferences,
      notifications: {
        ...currentPreferences.notifications,
        ...preferences
      }
    };

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        preferences: updatedPreferences
      },
      select: {
        id: true,
        email: true,
        name: true,
        preferences: true
      }
    });

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      userId: updatedUser.id,
      preferences: updatedPreferences.notifications
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/notification-preferences/test - Send test notification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Only admins can send test notifications
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { channel, type } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create test notification
    const testNotification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: type || 'CUSTOM',
        title: 'Test Notification',
        message: `This is a test notification sent via ${channel || 'IN_APP'} to verify your notification preferences.`,
        channels: JSON.stringify([channel || 'IN_APP']),
        status: 'PENDING',
        data: JSON.stringify({
          isTest: true,
          sentBy: session.user.id,
          channel: channel || 'IN_APP'
        })
      }
    });

    return NextResponse.json({
      message: "Test notification sent successfully",
      notificationId: testNotification.id
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
