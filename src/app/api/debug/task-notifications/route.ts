import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/debug/task-notifications - Debug task notification queries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    console.log('Debug: Current time:', now.toISOString());
    console.log('Debug: Ten minutes from now:', tenMinutesFromNow.toISOString());

    // Get all tasks with due dates for debugging
    const allTasksWithDueDates = await prisma.task.findMany({
      where: {
        dueDate: { not: null },
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignedTo: true,
        assignees: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    console.log('Debug: All tasks with due dates:', allTasksWithDueDates.length);

    // Check tasks due soon with different query variations
    const tasksDueSoon1 = await prisma.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lte: tenMinutesFromNow },
        assignedTo: { not: null }
      }
    });

    const tasksDueSoon2 = await prisma.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lte: tenMinutesFromNow },
        assignees: { some: {} }
      }
    });

    const tasksDueSoon3 = await prisma.task.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lte: tenMinutesFromNow }
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        assignedTo: true,
        assignees: true
      }
    });

    console.log('Debug: Tasks due soon (assignedTo):', tasksDueSoon1);
    console.log('Debug: Tasks due soon (assignees):', tasksDueSoon2);
    console.log('Debug: Tasks due soon (all):', tasksDueSoon3.length);

    // Detailed analysis of the task that should be due soon
    const taskAnalysis = allTasksWithDueDates.map(task => {
      const dueDate = task.dueDate!;
      const minutesUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60));
      const isDueSoon = minutesUntilDue >= 0 && minutesUntilDue <= 10;
      const isOverdue = minutesUntilDue < 0;
      
      return {
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: dueDate.toISOString(),
        assignedTo: task.assignedTo,
        assigneesCount: task.assignees.length,
        assignees: task.assignees,
        minutesUntilDue,
        isDueSoon,
        isOverdue,
        withinTimeWindow: dueDate >= now && dueDate <= tenMinutesFromNow
      };
    });

    return NextResponse.json({
      currentTime: now.toISOString(),
      tenMinutesFromNow: tenMinutesFromNow.toISOString(),
      analysis: {
        totalTasksWithDueDates: allTasksWithDueDates.length,
        tasksDueSoon: taskAnalysis.filter(t => t.isDueSoon).length,
        overdueTasks: taskAnalysis.filter(t => t.isOverdue).length
      },
      taskDetails: taskAnalysis,
      queryResults: {
        usingAssignedTo: tasksDueSoon1,
        usingAssignees: tasksDueSoon2,
        allFound: tasksDueSoon3.length
      },
      tasksDueSoonDetails: tasksDueSoon3.map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate?.toISOString(),
        assignedTo: task.assignedTo,
        assignees: task.assignees
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
