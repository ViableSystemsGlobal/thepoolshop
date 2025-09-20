import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { taskNotificationRunner } from "@/lib/task-notification-runner";

// POST /api/tasks/notification-runner - Start the automatic notification runner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'start') {
      taskNotificationRunner.start();
      return NextResponse.json({ 
        message: "Task notification runner started",
        status: "running"
      });
    } else if (action === 'stop') {
      taskNotificationRunner.stop();
      return NextResponse.json({ 
        message: "Task notification runner stopped",
        status: "stopped"
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'start' or 'stop'" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing notification runner:', error);
    return NextResponse.json(
      { error: "Failed to manage notification runner" },
      { status: 500 }
    );
  }
}

// GET /api/tasks/notification-runner - Get runner status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ 
      status: taskNotificationRunner.isActive() ? "running" : "stopped",
      isActive: taskNotificationRunner.isActive()
    });
  } catch (error) {
    console.error('Error getting runner status:', error);
    return NextResponse.json(
      { error: "Failed to get runner status" },
      { status: 500 }
    );
  }
}
