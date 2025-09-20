import { prisma } from '@/lib/prisma';
import { TaskDueNotificationService } from './task-due-notifications';

export class TaskNotificationScheduler {
  /**
   * Check and send notifications for tasks that are due soon or overdue
   * This should be called periodically (e.g., every minute)
   */
  static async processTaskNotifications() {
    try {
      console.log('Starting task notification processing...');
      
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get tasks that are due soon (within next 10 minutes)
      const tasksDueSoon = await (prisma as any).task.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          },
          dueDate: {
            gte: now,
            lte: tenMinutesFromNow
          },
          OR: [
            { assignedTo: { not: null } },
            { assignees: { some: {} } }
          ]
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Get tasks that are overdue
      const overdueTasks = await (prisma as any).task.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          },
          dueDate: {
            lt: now
          },
          OR: [
            { assignedTo: { not: null } },
            { assignees: { some: {} } }
          ]
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log(`📊 Found ${tasksDueSoon.length} tasks due soon and ${overdueTasks.length} overdue tasks`);

      // Process tasks due soon
      for (const task of tasksDueSoon) {
        console.log(`⏰ Processing due soon task: "${task.title}" (ID: ${task.id})`);
        await this.processTaskDueSoon(task);
      }

      // Process overdue tasks
      for (const task of overdueTasks) {
        console.log(`🚨 Processing overdue task: "${task.title}" (ID: ${task.id})`);
        await this.processOverdueTask(task);
      }

      console.log('Task notification processing completed');
    } catch (error) {
      console.error('Error processing task notifications:', error);
    }
  }

  /**
   * Process a task that is due soon
   */
  private static async processTaskDueSoon(task: any) {
    try {
      // Check if we've already sent a "due soon" notification for this task
      const existingNotification = await (prisma as any).notification.findFirst({
        where: {
          type: 'TASK_DUE_SOON',
          userId: task.assignedTo,
          data: {
            path: ['taskId'],
            equals: task.id
          },
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Within last hour
          }
        }
      });

      if (existingNotification) {
        console.log(`Due soon notification already sent for task: ${task.title}`);
        return;
      }

      const notificationData = {
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskPriority: task.priority,
        dueDate: task.dueDate,
        assignedTo: {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          phone: task.assignee.phone
        },
        assignedBy: task.creator ? {
          id: task.creator.id,
          name: task.creator.name,
          email: task.creator.email
        } : undefined
      };

      await TaskDueNotificationService.sendTaskDueSoonNotification(notificationData);
    } catch (error) {
      console.error(`Error processing due soon task ${task.id}:`, error);
    }
  }

  /**
   * Process an overdue task
   */
  private static async processOverdueTask(task: any) {
    try {
      const hoursOverdue = Math.floor((Date.now() - task.dueDate.getTime()) / (1000 * 60 * 60));

      // For newly overdue tasks (0-1 hours overdue)
      if (hoursOverdue < 1) {
        await this.processNewlyOverdueTask(task);
      } else {
        // For tasks that have been overdue for a while (escalation notifications)
        await this.processOverdueEscalationTask(task);
      }
    } catch (error) {
      console.error(`Error processing overdue task ${task.id}:`, error);
    }
  }

  /**
   * Process a newly overdue task (send initial overdue notification)
   */
  private static async processNewlyOverdueTask(task: any) {
    try {
      // Check if we've already sent an overdue notification for this task
      const existingNotification = await (prisma as any).notification.findFirst({
        where: {
          type: 'TASK_OVERDUE',
          userId: task.assignedTo,
          data: {
            path: ['taskId'],
            equals: task.id
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
          }
        }
      });

      if (existingNotification) {
        console.log(`Overdue notification already sent for task: ${task.title}`);
        return;
      }

      const notificationData = {
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskPriority: task.priority,
        dueDate: task.dueDate,
        assignedTo: {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          phone: task.assignee.phone
        },
        assignedBy: task.creator ? {
          id: task.creator.id,
          name: task.creator.name,
          email: task.creator.email
        } : undefined
      };

      await TaskDueNotificationService.sendTaskOverdueNotification(notificationData);
    } catch (error) {
      console.error(`Error processing newly overdue task ${task.id}:`, error);
    }
  }

  /**
   * Process an overdue task for escalation notifications
   */
  private static async processOverdueEscalationTask(task: any) {
    try {
      const notificationData = {
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskPriority: task.priority,
        dueDate: task.dueDate,
        assignedTo: {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          phone: task.assignee.phone
        },
        assignedBy: task.creator ? {
          id: task.creator.id,
          name: task.creator.name,
          email: task.creator.email
        } : undefined
      };

      await TaskDueNotificationService.sendTaskOverdueEscalationNotification(notificationData);
    } catch (error) {
      console.error(`Error processing overdue escalation task ${task.id}:`, error);
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      console.log('Notification Stats - Current time:', now.toISOString());
      console.log('Notification Stats - Ten minutes from now:', tenMinutesFromNow.toISOString());

      // Use the same logic as the working debug API
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
        }
      });

      // Calculate due soon and overdue using the same logic as debug
      const taskAnalysis = allTasksWithDueDates.map(task => {
        const dueDate = task.dueDate!;
        const minutesUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60));
        const isDueSoon = minutesUntilDue >= 0 && minutesUntilDue <= 10;
        const isOverdue = minutesUntilDue < 0;
        
        return {
          isDueSoon,
          isOverdue,
          hasAssignee: task.assignedTo !== null || task.assignees.length > 0
        };
      });

      const tasksDueSoon = taskAnalysis.filter(t => t.isDueSoon && t.hasAssignee).length;
      const overdueTasks = taskAnalysis.filter(t => t.isOverdue && t.hasAssignee).length;

      const notificationsLastHour = await (prisma as any).notification.count({
        where: {
          type: { in: ['TASK_DUE_SOON', 'TASK_OVERDUE', 'TASK_OVERDUE_ESCALATION'] },
          createdAt: { gte: oneHourAgo }
        }
      });

      const notificationsLast24Hours = await (prisma as any).notification.count({
        where: {
          type: { in: ['TASK_DUE_SOON', 'TASK_OVERDUE', 'TASK_OVERDUE_ESCALATION'] },
          createdAt: { gte: twentyFourHoursAgo }
        }
      });

      console.log('Notification Stats Results:', {
        tasksDueSoon,
        overdueTasks,
        notificationsLastHour,
        notificationsLast24Hours,
        totalTasksAnalyzed: allTasksWithDueDates.length
      });

      return {
        tasksDueSoon,
        overdueTasks,
        notificationsLastHour,
        notificationsLast24Hours
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        tasksDueSoon: 0,
        overdueTasks: 0,
        notificationsLastHour: 0,
        notificationsLast24Hours: 0
      };
    }
  }
}
