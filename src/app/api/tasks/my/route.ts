import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('My Tasks API - Route reached');
    
    const session = await getServerSession(authOptions);
    
    console.log('My Tasks API - Session:', session);
    
    if (!session?.user?.id) {
      console.log('My Tasks API - No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('My Tasks API - User ID:', session.user.id);

    // Test Prisma connection
    try {
      const userCount = await (prisma as any).user.count();
      console.log('My Tasks API - Prisma connection test successful, user count:', userCount);
    } catch (prismaError) {
      console.error('My Tasks API - Prisma connection test failed:', prismaError);
      throw new Error('Database connection failed');
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const recurring = searchParams.get('recurring');

    // Build where clause
    const whereClause: any = {
      AND: [
        {
          OR: [
            // Tasks assigned directly to the user (legacy field)
            { assignedTo: session.user.id },
            // Tasks where user is in the assignees array (new multiple assignee system)
            {
              assignees: {
                some: {
                  userId: session.user.id
                }
              }
            }
          ]
        }
      ]
    };

    // Add filters as additional AND conditions
    if (status && status !== 'all') {
      whereClause.AND.push({ status: status });
    }
    if (priority && priority !== 'all') {
      whereClause.AND.push({ priority: priority });
    }
    if (recurring && recurring !== 'all') {
      if (recurring === 'recurring') {
        whereClause.AND.push({ recurringTaskId: { not: null } });
      } else if (recurring === 'non-recurring') {
        whereClause.AND.push({ recurringTaskId: null });
      }
    }

    // Find tasks where the current user is assigned
    let tasks;
    try {
      tasks = await (prisma as any).task.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          dependencies: {
            include: {
              dependsOnTask: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                },
              },
            },
          },
          dependentTasks: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw new Error(`Database query failed: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
    }

    console.log('My Tasks API - Found tasks:', tasks.length);
    console.log('My Tasks API - Where clause:', JSON.stringify(whereClause, null, 2));

    // Calculate stats for the user's tasks
    const stats = tasks.reduce((acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ 
      tasks,
      count: tasks.length,
      stats
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user tasks:', error);
    console.error('Error type:', typeof error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch tasks', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
