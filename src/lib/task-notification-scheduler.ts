import { prisma } from '@/lib/prisma';
import { TaskDueNotificationService } from './task-due-notifications';
import nodemailer from 'nodemailer';

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

      // Run credit monitoring every 5 minutes (check if it's time)
      const currentTime = new Date();
      const lastCreditCheck = await this.getLastCreditCheckTime();
      const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
      
      if (!lastCreditCheck || lastCreditCheck < fiveMinutesAgo) {
        console.log('🔄 Running credit monitoring check...');
        await this.runCreditMonitoring();
        await this.updateLastCreditCheckTime();
      }
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

  /**
   * Helper function to get setting value from database
   */
  private static async getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { key },
        select: { value: true }
      });
      return setting?.value || defaultValue;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get the last credit check time
   */
  private static async getLastCreditCheckTime(): Promise<Date | null> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { key: 'LAST_CREDIT_CHECK_TIME' }
      });
      return setting ? new Date(setting.value) : null;
    } catch (error) {
      console.error('Error getting last credit check time:', error);
      return null;
    }
  }

  /**
   * Update the last credit check time
   */
  private static async updateLastCreditCheckTime(): Promise<void> {
    try {
      await prisma.systemSettings.upsert({
        where: { key: 'LAST_CREDIT_CHECK_TIME' },
        update: { value: new Date().toISOString() },
        create: { 
          key: 'LAST_CREDIT_CHECK_TIME',
          value: new Date().toISOString(),
          category: 'credit',
          type: 'string',
          description: 'Last time credit monitoring was run'
        }
      });
    } catch (error) {
      console.error('Error updating last credit check time:', error);
    }
  }

  /**
   * SMS sending function using the same infrastructure as communications
   */
  private static async sendSmsViaDeywuro(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string; cost?: number }> {
    try {
      const username = await this.getSettingValue('SMS_USERNAME', '');
      const password = await this.getSettingValue('SMS_PASSWORD', '');
      const senderId = await this.getSettingValue('SMS_SENDER_ID', 'AdPools');

      if (!username || !password) {
        throw new Error('SMS configuration not found. Please configure SMS settings.');
      }

      const response = await fetch('https://deywuro.com/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
          destination: phoneNumber,
          source: senderId,
          message: message
        })
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        return {
          success: false,
          error: `SMS provider returned non-JSON response: ${response.status} - ${responseText.substring(0, 100)}...`
        };
      }

      if (result.code === 0) {
        return {
          success: true,
          messageId: result.id || `deywuro_${Date.now()}`,
          cost: 0.05
        };
      } else {
        return {
          success: false,
          error: `Deywuro SMS failed: ${result.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Error sending credit alert SMS via Deywuro:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Email sending function using the same infrastructure as communications
   */
  private static async sendEmailViaSMTP(
    recipient: string, 
    subject: string, 
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const smtpHost = await this.getSettingValue('SMTP_HOST', '');
      const smtpPort = await this.getSettingValue('SMTP_PORT', '587');
      const smtpUsername = await this.getSettingValue('SMTP_USERNAME', '');
      const smtpPassword = await this.getSettingValue('SMTP_PASSWORD', '');
      const smtpFromAddress = await this.getSettingValue('SMTP_FROM_ADDRESS', '');
      const smtpFromName = await this.getSettingValue('SMTP_FROM_NAME', 'AdPools Group');
      const smtpEncryption = await this.getSettingValue('SMTP_ENCRYPTION', 'tls');

      if (!smtpHost || !smtpUsername || !smtpPassword || !smtpFromAddress) {
        throw new Error('SMTP configuration not found. Please configure email settings.');
      }

      const transporter = nodemailer.createTransporter({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpEncryption === 'ssl',
        auth: {
          user: smtpUsername,
          pass: smtpPassword,
        },
      });

      const result = await transporter.sendMail({
        from: `"${smtpFromName}" <${smtpFromAddress}>`,
        to: recipient,
        subject: subject,
        text: message,
        html: message.replace(/\n/g, '<br>'),
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending credit alert email via SMTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Run credit monitoring check
   */
  private static async runCreditMonitoring(): Promise<void> {
    try {
      console.log('🔍 Starting credit monitoring check...');

      // Get credit monitoring settings
      const monitoringEnabled = await this.getSettingValue('CREDIT_MONITORING_ENABLED', 'true');
      if (monitoringEnabled !== 'true') {
        console.log('📴 Credit monitoring is disabled');
        return;
      }

      const alertThreshold = parseFloat(await this.getSettingValue('CREDIT_ALERT_THRESHOLD', '80'));

      // Get all active distributors with credit limits
      const distributors = await prisma.distributor.findMany({
        where: {
          status: 'ACTIVE',
          creditLimit: { not: null },
          currentCreditUsed: { not: null }
        }
      });

      console.log(`📊 Checking ${distributors.length} distributors for credit alerts`);

      let alertsSent = 0;

      for (const distributor of distributors) {
        const creditLimit = parseFloat(distributor.creditLimit?.toString() || '0');
        const creditUsed = parseFloat(distributor.currentCreditUsed?.toString() || '0');
        const utilization = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

        // Check for high utilization alert
        if (utilization >= alertThreshold) {
          const alertType = utilization >= 100 ? 'CREDIT_LIMIT_EXCEEDED' : 'HIGH_CREDIT_UTILIZATION';
          
          console.log(`🚨 Credit alert for ${distributor.businessName}: ${utilization.toFixed(1)}% utilization`);

          // Send SMS alert
          const smsMessage = `CREDIT ALERT: ${distributor.businessName} has ${utilization.toFixed(1)}% credit utilization (GHS ${creditUsed.toLocaleString()} of GHS ${creditLimit.toLocaleString()}). ${utilization >= 100 ? 'Credit limit exceeded!' : 'Please review.'}`;
          
          const smsResult = await this.sendSmsViaDeywuro(distributor.phone, smsMessage);
          
          // Send email alert
          const emailSubject = `Credit Alert: ${distributor.businessName} - ${utilization >= 100 ? 'Credit Limit Exceeded' : 'High Credit Utilization'}`;
          const emailMessage = `
Dear Credit Manager,

This is an automated credit alert for distributor: ${distributor.businessName}

CREDIT STATUS:
- Credit Limit: GHS ${creditLimit.toLocaleString()}
- Credit Used: GHS ${creditUsed.toLocaleString()}
- Utilization: ${utilization.toFixed(1)}%
- Available Credit: GHS ${(creditLimit - creditUsed).toLocaleString()}

${utilization >= 100 ? '⚠️ WARNING: Credit limit has been exceeded!' : '⚠️ ALERT: Credit utilization is above the threshold.'}

Please review this distributor's account and take appropriate action.

Best regards,
AdPools Credit Monitoring System
          `.trim();

          const emailResult = await this.sendEmailViaSMTP('admin@adpools.com', emailSubject, emailMessage);

          // Log the alert in credit history
          await prisma.distributorCreditHistory.create({
            data: {
              distributorId: distributor.id,
              action: alertType,
              previousLimit: creditLimit,
              newLimit: creditLimit,
              previousUsed: creditUsed,
              newUsed: creditUsed,
              amount: creditUsed,
              reason: `Automated alert: ${utilization.toFixed(1)}% credit utilization`,
              notes: `SMS: ${smsResult.success ? 'Sent' : 'Failed'}, Email: ${emailResult.success ? 'Sent' : 'Failed'}`,
              performedBy: 'system',
              performedAt: new Date()
            }
          });

          // Save SMS and email records
          if (smsResult.success) {
            await prisma.smsMessage.create({
              data: {
                recipient: distributor.phone,
                message: smsMessage,
                status: 'SENT',
                sentAt: new Date(),
                cost: smsResult.cost || 0.05,
                provider: 'deywuro',
                providerId: smsResult.messageId,
                userId: 'system',
                isBulk: false
              }
            });
          }

          if (emailResult.success) {
            await prisma.emailMessage.create({
              data: {
                recipient: 'admin@adpools.com',
                subject: emailSubject,
                message: emailMessage,
                status: 'SENT',
                sentAt: new Date(),
                provider: 'smtp',
                providerId: emailResult.messageId,
                userId: 'system',
                isBulk: false
              }
            });
          }

          alertsSent++;
        }
      }

      console.log(`✅ Credit monitoring completed: ${alertsSent} alerts sent`);

    } catch (error) {
      console.error('❌ Error in credit monitoring:', error);
    }
  }
}
