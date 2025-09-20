import { NextRequest, NextResponse } from "next/server";
import { TaskNotificationScheduler } from "@/lib/task-notification-scheduler";

// POST /api/cron/task-notifications - Cron job endpoint for task notifications
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Cron job: Processing task notifications...');
    
    await TaskNotificationScheduler.processTaskNotifications();
    
    const stats = await TaskNotificationScheduler.getNotificationStats();
    
    return NextResponse.json({ 
      message: "Task notifications processed successfully",
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    console.error('Cron job error processing task notifications:', error);
    return NextResponse.json(
      { error: "Failed to process task notifications" },
      { status: 500 }
    );
  }
}

// GET /api/cron/task-notifications - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const stats = await TaskNotificationScheduler.getNotificationStats();
    
    return NextResponse.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
