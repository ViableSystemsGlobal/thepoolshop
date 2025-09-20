import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RecurringTaskGenerator } from '@/lib/recurring-task-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate recurring tasks
    await RecurringTaskGenerator.generateTasks();
    
    // Mark overdue tasks
    await RecurringTaskGenerator.markOverdueTasks();

    return NextResponse.json({ 
      message: 'Recurring tasks generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating recurring tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate recurring tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
