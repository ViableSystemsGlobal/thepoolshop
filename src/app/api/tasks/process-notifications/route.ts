import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TaskNotificationScheduler } from "@/lib/task-notification-scheduler";

// POST /api/tasks/process-notifications - Process task notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Manual task notification processing triggered by:', session.user.email);
    
    await TaskNotificationScheduler.processTaskNotifications();
    
    const stats = await TaskNotificationScheduler.getNotificationStats();
    
    return NextResponse.json({ 
      message: "Task notifications processed successfully",
      stats
    });
  } catch (error) {
    console.error('Error processing task notifications:', error);
    return NextResponse.json(
      { error: "Failed to process task notifications" },
      { status: 500 }
    );
  }
}

// GET /api/tasks/process-notifications - Get notification statistics
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/tasks/process-notifications - Stats request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('GET /api/tasks/process-notifications - Unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('GET /api/tasks/process-notifications - Getting stats for user:', session.user.email);
    const stats = await TaskNotificationScheduler.getNotificationStats();
    
    console.log('GET /api/tasks/process-notifications - Returning stats:', stats);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return NextResponse.json(
      { error: "Failed to get notification statistics" },
      { status: 500 }
    );
  }
}
