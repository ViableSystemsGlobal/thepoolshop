import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/debug/tasks-direct - Direct database query for tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Get ALL tasks first
    const allTasks = await prisma.task.findMany({
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

    // Test different query variations
    const query1 = await prisma.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lte: tenMinutesFromNow },
        OR: [
          { assignedTo: { not: null } },
          { assignees: { some: {} } }
        ]
      }
    });

    const query2 = await prisma.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lte: tenMinutesFromNow }
      }
    });

    const query3 = await prisma.task.count({
      where: {
        dueDate: { gte: now, lte: tenMinutesFromNow }
      }
    });

    return NextResponse.json({
      currentTime: now.toISOString(),
      tenMinutesFromNow: tenMinutesFromNow.toISOString(),
      totalTasks: allTasks.length,
      allTasks: allTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate?.toISOString(),
        assignedTo: task.assignedTo,
        assigneesCount: task.assignees.length,
        assignees: task.assignees
      })),
      queryResults: {
        withStatusAndAssignment: query1,
        withStatusOnly: query2,
        withDueDateOnly: query3
      }
    });
  } catch (error) {
    console.error('Direct debug error:', error);
    return NextResponse.json(
      { error: "Direct debug failed", details: error.message },
      { status: 500 }
    );
  }
}
