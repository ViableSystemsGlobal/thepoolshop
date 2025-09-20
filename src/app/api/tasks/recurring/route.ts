import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo');
    const isActive = searchParams.get('isActive');

    // Build where clause
    const where: any = {};

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const recurringTasks = await prisma.recurringTask.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recurringTasks });
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      priority = 'MEDIUM',
      pattern,
      interval = 1,
      daysOfWeek,
      dayOfMonth,
      assignedTo,
    } = body;

    if (!title || !assignedTo || !pattern) {
      return NextResponse.json(
        { error: 'Title, assignedTo, and pattern are required' },
        { status: 400 }
      );
    }

    // Calculate next due date based on pattern
    const now = new Date();
    let nextDue: Date;

    switch (pattern) {
      case 'DAILY':
        nextDue = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
        break;
      case 'WEEKLY':
        if (daysOfWeek && Array.isArray(daysOfWeek)) {
          // Find next occurrence of any of the specified days
          const today = now.getDay();
          const nextDay = daysOfWeek.find(day => day > today) || daysOfWeek[0];
          const daysUntilNext = nextDay > today ? nextDay - today : (7 - today) + nextDay;
          nextDue = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
        } else {
          nextDue = new Date(now.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
        }
        break;
      case 'MONTHLY':
        nextDue = new Date(now);
        if (dayOfMonth) {
          nextDue.setDate(dayOfMonth);
          if (nextDue <= now) {
            nextDue.setMonth(nextDue.getMonth() + interval);
          }
        } else {
          nextDue.setMonth(nextDue.getMonth() + interval);
        }
        break;
      default:
        nextDue = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
    }

    const recurringTask = await prisma.recurringTask.create({
      data: {
        title,
        description,
        priority,
        pattern,
        interval,
        daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : null,
        dayOfMonth,
        assignedTo,
        createdBy: session.user.id,
        nextDue,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send assignment notification email
    // await sendRecurringTaskAssignmentNotification(recurringTask);

    return NextResponse.json(recurringTask, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring task:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
