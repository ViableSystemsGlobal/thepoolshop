import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/tasks/[id]/dependencies - Get task dependencies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await (prisma as any).task.findUnique({
      where: { id: resolvedParams.id },
      include: {
        dependencies: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
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
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Transform the data for easier frontend consumption
    const dependencies = task.dependencies.map((dep: any) => ({
      id: dep.id,
      task: dep.dependsOnTask,
      type: 'depends_on',
    }));

    const dependents = task.dependentTasks.map((dep: any) => ({
      id: dep.id,
      task: dep.task,
      type: 'dependency_of',
    }));

    return NextResponse.json({
      dependencies,
      dependents,
      totalDependencies: dependencies.length,
      totalDependents: dependents.length,
    });

  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task dependencies' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/dependencies - Add a dependency
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dependentTaskId } = await request.json();

    if (!dependentTaskId) {
      return NextResponse.json(
        { error: 'Dependent task ID is required' },
        { status: 400 }
      );
    }

    // Validate that both tasks exist
    const [task, dependentTask] = await Promise.all([
      (prisma as any).task.findUnique({ where: { id: resolvedParams.id } }),
      (prisma as any).task.findUnique({ where: { id: dependentTaskId } }),
    ]);

    if (!task || !dependentTask) {
      return NextResponse.json(
        { error: 'One or both tasks not found' },
        { status: 404 }
      );
    }

    // Prevent self-dependency
    if (resolvedParams.id === dependentTaskId) {
      return NextResponse.json(
        { error: 'Task cannot depend on itself' },
        { status: 400 }
      );
    }

    // Check for circular dependency
    const circularCheck = await checkCircularDependency(
      resolvedParams.id,
      dependentTaskId
    );

    if (circularCheck.hasCircularDependency) {
      return NextResponse.json(
        { 
          error: 'Circular dependency detected',
          details: circularCheck.path
        },
        { status: 400 }
      );
    }

    // Create the dependency
    const dependency = await (prisma as any).taskDependency.create({
      data: {
        taskId: resolvedParams.id,
        dependsOnTaskId: dependentTaskId,
      },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Dependency added successfully',
      dependency: {
        id: dependency.id,
        task: dependency.dependsOnTask,
        type: 'depends_on',
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding task dependency:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This dependency already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add task dependency' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/dependencies - Remove a dependency
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dependentTaskId = searchParams.get('dependentTaskId');

    if (!dependentTaskId) {
      return NextResponse.json(
        { error: 'Dependent task ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the dependency
    const dependency = await (prisma as any).taskDependency.findFirst({
      where: {
        taskId: resolvedParams.id,
        dependsOnTaskId: dependentTaskId,
      },
    });

    if (!dependency) {
      return NextResponse.json(
        { error: 'Dependency not found' },
        { status: 404 }
      );
    }

    await (prisma as any).taskDependency.delete({
      where: { id: dependency.id },
    });

    return NextResponse.json({
      message: 'Dependency removed successfully',
    });

  } catch (error) {
    console.error('Error removing task dependency:', error);
    return NextResponse.json(
      { error: 'Failed to remove task dependency' },
      { status: 500 }
    );
  }
}

// Helper function to check for circular dependencies
async function checkCircularDependency(
  taskId: string,
  dependentTaskId: string
): Promise<{ hasCircularDependency: boolean; path: string[] }> {
  const visited = new Set<string>();
  const path: string[] = [];
  
  async function dfs(currentTaskId: string): Promise<boolean> {
    if (currentTaskId === taskId) {
      return true; // Circular dependency found
    }
    
    if (visited.has(currentTaskId)) {
      return false; // Already visited this node
    }
    
    visited.add(currentTaskId);
    path.push(currentTaskId);
    
    // Get all tasks that the current task depends on
    const dependencies = await (prisma as any).taskDependency.findMany({
      where: { taskId: currentTaskId },
      select: { dependsOnTaskId: true },
    });
    
    for (const dep of dependencies) {
      if (await dfs(dep.dependsOnTaskId)) {
        return true;
      }
    }
    
    path.pop();
    return false;
  }
  
  const hasCircularDependency = await dfs(dependentTaskId);
  return { hasCircularDependency, path };
}
