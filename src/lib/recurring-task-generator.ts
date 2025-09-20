import { prisma } from './prisma';

export class RecurringTaskGenerator {
  /**
   * Generate tasks from active recurring tasks
   */
  static async generateTasks(): Promise<void> {
    try {
      const now = new Date();
      
      // Find all active recurring tasks that are due
      const recurringTasks = await prisma.recurringTask.findMany({
        where: {
          isActive: true,
          OR: [
            { nextDue: { lte: now } },
            { nextDue: null },
          ],
        },
        include: {
          assignee: true,
          creator: true,
        },
      });

      console.log(`Found ${recurringTasks.length} recurring tasks to process`);

      for (const recurringTask of recurringTasks) {
        await this.generateTaskFromRecurring(recurringTask);
      }
    } catch (error) {
      console.error('Error generating recurring tasks:', error);
    }
  }

  /**
   * Generate a single task from a recurring task
   */
  private static async generateTaskFromRecurring(recurringTask: any): Promise<void> {
    try {
      const now = new Date();
      
      // Create the task
      const task = await prisma.task.create({
        data: {
          title: recurringTask.title,
          description: recurringTask.description,
          priority: recurringTask.priority,
          assignedTo: recurringTask.assignedTo,
          createdBy: recurringTask.createdBy,
          recurringTaskId: recurringTask.id,
          dueDate: this.calculateDueDate(recurringTask),
        },
      });

      // Update the recurring task's lastGenerated and nextDue
      await prisma.recurringTask.update({
        where: { id: recurringTask.id },
        data: {
          lastGenerated: now,
          nextDue: this.calculateNextDue(recurringTask),
        },
      });

      console.log(`Generated task: ${task.title} for user: ${recurringTask.assignee.name}`);

      // TODO: Send assignment notification email
      // await sendTaskAssignmentNotification(task);
    } catch (error) {
      console.error(`Error generating task from recurring task ${recurringTask.id}:`, error);
    }
  }

  /**
   * Calculate due date for a new task
   */
  private static calculateDueDate(recurringTask: any): Date {
    const now = new Date();
    
    switch (recurringTask.pattern) {
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      
      case 'WEEKLY':
        if (recurringTask.daysOfWeek) {
          const daysOfWeek = JSON.parse(recurringTask.daysOfWeek);
          const today = now.getDay();
          const nextDay = daysOfWeek.find((day: number) => day > today) || daysOfWeek[0];
          const daysUntilNext = nextDay > today ? nextDay - today : (7 - today) + nextDay;
          return new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
        }
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
      
      case 'MONTHLY':
        const dueDate = new Date(now);
        if (recurringTask.dayOfMonth) {
          dueDate.setDate(recurringTask.dayOfMonth);
          if (dueDate <= now) {
            dueDate.setMonth(dueDate.getMonth() + 1);
          }
        } else {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        return dueDate;
      
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
    }
  }

  /**
   * Calculate next due date for recurring task
   */
  private static calculateNextDue(recurringTask: any): Date {
    const now = new Date();
    
    switch (recurringTask.pattern) {
      case 'DAILY':
        return new Date(now.getTime() + recurringTask.interval * 24 * 60 * 60 * 1000);
      
      case 'WEEKLY':
        return new Date(now.getTime() + recurringTask.interval * 7 * 24 * 60 * 60 * 1000);
      
      case 'MONTHLY':
        const nextDue = new Date(now);
        nextDue.setMonth(nextDue.getMonth() + recurringTask.interval);
        return nextDue;
      
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Mark overdue tasks
   */
  static async markOverdueTasks(): Promise<void> {
    try {
      const now = new Date();
      
      // Find tasks that are overdue (due date passed and status is not completed/cancelled)
      const overdueTasks = await prisma.task.updateMany({
        where: {
          dueDate: { lt: now },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
        data: {
          status: 'OVERDUE',
        },
      });

      console.log(`Marked ${overdueTasks.count} tasks as overdue`);
    } catch (error) {
      console.error('Error marking overdue tasks:', error);
    }
  }
}
