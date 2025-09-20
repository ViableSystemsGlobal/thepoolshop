import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/stats-simple - Simple, direct task stats
export async function GET(request: NextRequest) {
  try {
    console.log('=== SIMPLE STATS API CALLED ===');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Get ALL tasks with due dates - no complex filtering
    const allTasks = await prisma.task.findMany({
      where: {
        dueDate: { not: null }
      },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignedTo: true,
        assignees: {
          select: {
            id: true
          }
        }
      }
    });

    console.log('Total tasks with due dates:', allTasks.length);

    let dueSoon = 0;
    let overdue = 0;

    allTasks.forEach(task => {
      // Only count active tasks that are assigned
      const isActive = task.status === 'PENDING' || task.status === 'IN_PROGRESS';
      const isAssigned = task.assignedTo !== null || task.assignees.length > 0;
      
      if (isActive && isAssigned && task.dueDate) {
        const minutesUntilDue = Math.floor((task.dueDate.getTime() - now.getTime()) / (1000 * 60));
        
        console.log(`Task "${task.title}": ${minutesUntilDue} minutes until due, status: ${task.status}, assigned: ${isAssigned}`);
        
        if (minutesUntilDue < 0) {
          overdue++;
        } else if (minutesUntilDue <= 10) {
          dueSoon++;
        }
      }
    });

    const stats = {
      tasksDueSoon: dueSoon,
      overdueTasks: overdue,
      notificationsLastHour: 0,
      notificationsLast24Hours: 0
    };

    console.log('Final stats:', stats);
    console.log('=== SIMPLE STATS API COMPLETE ===');

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Simple stats error:', error);
    return NextResponse.json(
      { error: "Failed to get stats", details: error.message },
      { status: 500 }
    );
  }
}
