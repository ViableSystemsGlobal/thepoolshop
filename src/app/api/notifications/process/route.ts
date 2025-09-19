import { NextRequest, NextResponse } from "next/server";
import { NotificationProcessor } from "@/lib/notification-processor";

// POST /api/notifications/process - Process pending notifications
export async function POST(request: NextRequest) {
  try {
    // You might want to add authentication/authorization here
    // For now, we'll allow any request to process notifications
    
    console.log('Processing pending notifications...');
    
    await NotificationProcessor.processPendingNotifications();
    
    return NextResponse.json({ 
      message: "Notifications processed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}

// GET /api/notifications/process - Get processing status
export async function GET(request: NextRequest) {
  try {
    // Return information about the notification processing system
    return NextResponse.json({
      message: "Notification processing system is running",
      timestamp: new Date().toISOString(),
      endpoints: {
        process: "POST /api/notifications/process - Process pending notifications",
        status: "GET /api/notifications/process - Get processing status"
      }
    });
  } catch (error) {
    console.error('Error getting processing status:', error);
    return NextResponse.json(
      { error: "Failed to get processing status" },
      { status: 500 }
    );
  }
}
