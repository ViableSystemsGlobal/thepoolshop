import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TaskNotificationService } from '@/lib/task-notification-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, sendToAll = false } = body;

    if (sendToAll) {
      // Send daily summaries to all users
      await TaskNotificationService.sendDailySummariesToAllUsers();
      return NextResponse.json({ 
        message: 'Daily summaries sent to all users',
        timestamp: new Date().toISOString()
      });
    } else if (userId) {
      // Send daily summary to specific user
      await TaskNotificationService.sendDailyTaskSummary(userId);
      return NextResponse.json({ 
        message: 'Daily summary sent successfully',
        userId,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'userId is required when sendToAll is false' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending daily task summary:', error);
    return NextResponse.json(
      { error: 'Failed to send daily summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
