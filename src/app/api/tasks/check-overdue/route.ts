import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let updatedCount = 0;
    
    // Find tasks that are due and not completed/cancelled/overdue
    const overdueTasks = await (prisma as any).task.findMany({
      where: {
        dueDate: {
          lt: now, // Less than current time
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED', 'OVERDUE'], // Not already completed, cancelled, or overdue
        },
      },
      include: {
        assignees: true,
      },
    });

    // Update each overdue task
    if (overdueTasks.length > 0) {
      await (prisma as any).task.updateMany({
        where: {
          id: {
            in: overdueTasks.map((task: any) => task.id),
          },
        },
        data: {
          status: 'OVERDUE',
          updatedAt: now,
        },
      });

      // Also update individual assignee statuses for collaborative tasks
      for (const task of overdueTasks) {
        if (task.assignmentType === 'COLLABORATIVE' && task.assignees.length > 0) {
          await (prisma as any).taskAssignee.updateMany({
            where: {
              taskId: task.id,
              status: {
                notIn: ['COMPLETED', 'CANCELLED'],
              },
            },
            data: {
              status: 'OVERDUE',
              updatedAt: now,
            },
          });
        }
        updatedCount++;
      }

      console.log(`Updated ${updatedCount} tasks to OVERDUE status`);
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Updated ${updatedCount} tasks to OVERDUE status`,
    });

  } catch (error) {
    console.error('Error checking overdue tasks:', error);
    return NextResponse.json(
      { error: 'Failed to check overdue tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also allow GET for manual checking
export async function GET(request: NextRequest) {
  return POST(request);
}
