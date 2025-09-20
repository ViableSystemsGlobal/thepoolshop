import { prisma } from '@/lib/prisma';
import { getSettingValue } from '@/lib/utils';

interface TaskDueNotificationData {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  taskPriority: string;
  dueDate: Date;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export class TaskDueNotificationService {
  /**
   * Send notification when a task is due soon (configurable minutes before due)
   */
  static async sendTaskDueSoonNotification(data: TaskDueNotificationData) {
    try {
      // Check if task notifications and due soon notifications are enabled
      const notificationsEnabled = await this.isTaskNotificationsEnabled();
      const dueSoonEnabled = await this.isDueSoonNotificationsEnabled();
      
      if (!notificationsEnabled || !dueSoonEnabled) {
        console.log('Task due soon notifications disabled');
        return;
      }

      const minutesBeforeDue = await this.getMinutesBeforeDueSetting();
      const timeUntilDue = data.dueDate.getTime() - Date.now();
      const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));

      // Only send if we're within the notification window
      if (minutesUntilDue > minutesBeforeDue || minutesUntilDue < 0) {
        return;
      }

      // Create notification record
      const notification = await (prisma as any).notification.create({
        data: {
          type: 'TASK_DUE_SOON',
          title: 'Task Due Soon',
          message: `Task "${data.taskTitle}" is due in ${minutesUntilDue} minutes`,
          data: {
            taskId: data.taskId,
            taskTitle: data.taskTitle,
            taskDescription: data.taskDescription,
            taskPriority: data.taskPriority,
            dueDate: data.dueDate.toISOString(),
            minutesUntilDue,
            notificationType: 'DUE_SOON'
          },
          channels: ['EMAIL', 'SMS'],
          userId: data.assignedTo.id,
          status: 'PENDING'
        }
      });

      // Send email notification
      console.log(`📧 Sending due soon EMAIL to: ${data.assignedTo.email}`);
      await this.sendEmailNotification(data, notification.id, 'DUE_SOON', minutesUntilDue);

      // Send SMS notification
      console.log(`📱 Sending due soon SMS to: ${data.assignedTo.phone}`);
      await this.sendSMSNotification(data, notification.id, 'DUE_SOON', minutesUntilDue);

      // Mark notification as sent
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });

      console.log(`Task due soon notification sent for task: ${data.taskTitle}`);
    } catch (error) {
      console.error('Error sending task due soon notification:', error);
    }
  }

  /**
   * Send notification when a task becomes overdue
   */
  static async sendTaskOverdueNotification(data: TaskDueNotificationData) {
    try {
      // Check if task notifications and overdue notifications are enabled
      const notificationsEnabled = await this.isTaskNotificationsEnabled();
      const overdueEnabled = await this.isOverdueNotificationsEnabled();
      
      if (!notificationsEnabled || !overdueEnabled) {
        console.log('Task overdue notifications disabled');
        return;
      }

      const hoursOverdue = Math.floor((Date.now() - data.dueDate.getTime()) / (1000 * 60 * 60));

      // Create notification record
      const notification = await (prisma as any).notification.create({
        data: {
          type: 'TASK_OVERDUE',
          title: 'Task Overdue',
          message: `Task "${data.taskTitle}" is now overdue`,
          data: {
            taskId: data.taskId,
            taskTitle: data.taskTitle,
            taskDescription: data.taskDescription,
            taskPriority: data.taskPriority,
            dueDate: data.dueDate.toISOString(),
            hoursOverdue,
            notificationType: 'OVERDUE'
          },
          channels: ['EMAIL', 'SMS'],
          userId: data.assignedTo.id,
          status: 'PENDING'
        }
      });

      // Send email notification
      await this.sendEmailNotification(data, notification.id, 'OVERDUE', hoursOverdue);

      // Send SMS notification
      await this.sendSMSNotification(data, notification.id, 'OVERDUE', hoursOverdue);

      // Mark notification as sent
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });

      console.log(`Task overdue notification sent for task: ${data.taskTitle}`);
    } catch (error) {
      console.error('Error sending task overdue notification:', error);
    }
  }

  /**
   * Send escalating notification for tasks that are overdue (every hour)
   */
  static async sendTaskOverdueEscalationNotification(data: TaskDueNotificationData) {
    try {
      // Check if task notifications and escalation notifications are enabled
      const notificationsEnabled = await this.isTaskNotificationsEnabled();
      const escalationEnabled = await this.isEscalationNotificationsEnabled();
      
      if (!notificationsEnabled || !escalationEnabled) {
        console.log('Task escalation notifications disabled');
        return;
      }

      const hoursOverdue = Math.floor((Date.now() - data.dueDate.getTime()) / (1000 * 60 * 60));

      // Only send escalation notifications every hour
      if (hoursOverdue < 1 || hoursOverdue % 1 !== 0) {
        return;
      }

      // Check if we've already sent an escalation for this hour
      const existingNotification = await (prisma as any).notification.findFirst({
        where: {
          type: 'TASK_OVERDUE_ESCALATION',
          userId: data.assignedTo.id,
          data: {
            path: ['taskId'],
            equals: data.taskId
          },
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Within last hour
          }
        }
      });

      if (existingNotification) {
        return; // Already sent for this hour
      }

      // Create notification record
      const notification = await (prisma as any).notification.create({
        data: {
          type: 'TASK_OVERDUE_ESCALATION',
          title: 'Task Overdue - Escalation',
          message: `Task "${data.taskTitle}" is ${hoursOverdue} hour${hoursOverdue > 1 ? 's' : ''} overdue`,
          data: {
            taskId: data.taskId,
            taskTitle: data.taskTitle,
            taskDescription: data.taskDescription,
            taskPriority: data.taskPriority,
            dueDate: data.dueDate.toISOString(),
            hoursOverdue,
            notificationType: 'OVERDUE_ESCALATION'
          },
          channels: ['EMAIL', 'SMS'],
          userId: data.assignedTo.id,
          status: 'PENDING'
        }
      });

      // Send email notification
      await this.sendEmailNotification(data, notification.id, 'OVERDUE_ESCALATION', hoursOverdue);

      // Send SMS notification
      await this.sendSMSNotification(data, notification.id, 'OVERDUE_ESCALATION', hoursOverdue);

      // Mark notification as sent
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });

      console.log(`Task overdue escalation notification sent for task: ${data.taskTitle} (${hoursOverdue} hours overdue)`);
    } catch (error) {
      console.error('Error sending task overdue escalation notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    data: TaskDueNotificationData, 
    notificationId: string, 
    type: 'DUE_SOON' | 'OVERDUE' | 'OVERDUE_ESCALATION',
    timeValue: number
  ) {
    try {
      const emailEnabled = await getSettingValue('EMAIL_ENABLED');
      console.log(`📧 Email enabled check: ${emailEnabled}`);
      if (!emailEnabled || emailEnabled !== 'true') {
        console.log('❌ Email notifications disabled or not configured');
        return;
      }

      const subject = this.getEmailSubject(type, data.taskTitle);
      const content = this.generateEmailContent(data, type, timeValue);

      // Use the same email sending logic as the communication system
      const response = await fetch('/api/communications/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.assignedTo.email,
          subject,
          content,
          type: 'html'
        })
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      console.log(`Task ${type} email sent to ${data.assignedTo.email}`);
    } catch (error) {
      console.error(`Error sending task ${type} email:`, error);
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(
    data: TaskDueNotificationData, 
    notificationId: string, 
    type: 'DUE_SOON' | 'OVERDUE' | 'OVERDUE_ESCALATION',
    timeValue: number
  ) {
    try {
      const smsEnabled = await getSettingValue('SMS_ENABLED');
      console.log(`📱 SMS enabled check: ${smsEnabled}`);
      console.log(`📱 Phone number: ${data.assignedTo.phone}`);
      if (!smsEnabled || smsEnabled !== 'true' || !data.assignedTo.phone) {
        console.log('❌ SMS notifications disabled, not configured, or no phone number');
        return;
      }

      const message = this.generateSMSContent(data, type, timeValue);

      // Use the same SMS sending logic as the communication system
      const response = await fetch('/api/communications/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.assignedTo.phone,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`);
      }

      console.log(`Task ${type} SMS sent to ${data.assignedTo.phone}`);
    } catch (error) {
      console.error(`Error sending task ${type} SMS:`, error);
    }
  }

  /**
   * Generate email subject
   */
  private static getEmailSubject(type: string, taskTitle: string): string {
    switch (type) {
      case 'DUE_SOON':
        return `⚠️ Task Due Soon: ${taskTitle}`;
      case 'OVERDUE':
        return `🚨 Task Overdue: ${taskTitle}`;
      case 'OVERDUE_ESCALATION':
        return `🚨 URGENT: Task Overdue - ${taskTitle}`;
      default:
        return `Task Notification: ${taskTitle}`;
    }
  }

  /**
   * Generate email content
   */
  private static generateEmailContent(
    data: TaskDueNotificationData, 
    type: 'DUE_SOON' | 'OVERDUE' | 'OVERDUE_ESCALATION',
    timeValue: number
  ): string {
    const priorityEmoji = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'URGENT': '🔴'
    }[data.taskPriority] || '🟡';

    const baseContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">${priorityEmoji} ${data.taskTitle}</h2>
          ${data.taskDescription ? `<p style="color: #666; margin: 0;">${data.taskDescription}</p>` : ''}
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Task Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Priority:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${data.taskPriority}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Due Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${data.dueDate.toLocaleString()}</td>
            </tr>
          </table>
        </div>
    `;

    let actionContent = '';
    switch (type) {
      case 'DUE_SOON':
        actionContent = `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin: 0 0 10px 0;">⏰ Reminder</h4>
            <p style="color: #856404; margin: 0;">This task is due in <strong>${timeValue} minutes</strong>. Please complete it as soon as possible.</p>
          </div>
        `;
        break;
      case 'OVERDUE':
        actionContent = `
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h4 style="color: #721c24; margin: 0 0 10px 0;">🚨 Overdue</h4>
            <p style="color: #721c24; margin: 0;">This task is now overdue. Please complete it immediately.</p>
          </div>
        `;
        break;
      case 'OVERDUE_ESCALATION':
        actionContent = `
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h4 style="color: #721c24; margin: 0 0 10px 0;">🚨 Urgent - ${timeValue} Hour${timeValue > 1 ? 's' : ''} Overdue</h4>
            <p style="color: #721c24; margin: 0;">This task has been overdue for ${timeValue} hour${timeValue > 1 ? 's' : ''}. Please complete it immediately or contact your manager.</p>
          </div>
        `;
        break;
    }

    return baseContent + actionContent + `
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">Please log into the system to view and update this task.</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate SMS content
   */
  private static generateSMSContent(
    data: TaskDueNotificationData, 
    type: 'DUE_SOON' | 'OVERDUE' | 'OVERDUE_ESCALATION',
    timeValue: number
  ): string {
    const priorityEmoji = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'URGENT': '🔴'
    }[data.taskPriority] || '🟡';

    switch (type) {
      case 'DUE_SOON':
        return `${priorityEmoji} TASK REMINDER: "${data.taskTitle}" is due in ${timeValue} minutes. Priority: ${data.taskPriority}`;
      case 'OVERDUE':
        return `🚨 TASK OVERDUE: "${data.taskTitle}" is now overdue. Please complete immediately. Priority: ${data.taskPriority}`;
      case 'OVERDUE_ESCALATION':
        return `🚨 URGENT: "${data.taskTitle}" is ${timeValue} hour${timeValue > 1 ? 's' : ''} overdue. Please complete immediately or contact your manager. Priority: ${data.taskPriority}`;
      default:
        return `Task notification: ${data.taskTitle}`;
    }
  }

  /**
   * Get the configured minutes before due for notifications
   */
  private static async getMinutesBeforeDueSetting(): Promise<number> {
    try {
      const setting = await getSettingValue('TASK_NOTIFICATION_MINUTES_BEFORE_DUE');
      return setting ? parseInt(setting) : 10; // Default to 10 minutes
    } catch (error) {
      console.error('Error getting minutes before due setting:', error);
      return 10; // Default fallback
    }
  }

  /**
   * Check if task notifications are enabled
   */
  private static async isTaskNotificationsEnabled(): Promise<boolean> {
    try {
      const setting = await getSettingValue('TASK_NOTIFICATIONS_ENABLED');
      return setting === 'true';
    } catch (error) {
      console.error('Error getting task notifications enabled setting:', error);
      return true; // Default to enabled
    }
  }

  /**
   * Check if due soon notifications are enabled
   */
  private static async isDueSoonNotificationsEnabled(): Promise<boolean> {
    try {
      const setting = await getSettingValue('TASK_NOTIFICATION_SEND_DUE_SOON');
      return setting === 'true';
    } catch (error) {
      console.error('Error getting due soon notifications setting:', error);
      return true; // Default to enabled
    }
  }

  /**
   * Check if overdue notifications are enabled
   */
  private static async isOverdueNotificationsEnabled(): Promise<boolean> {
    try {
      const setting = await getSettingValue('TASK_NOTIFICATION_SEND_OVERDUE');
      return setting === 'true';
    } catch (error) {
      console.error('Error getting overdue notifications setting:', error);
      return true; // Default to enabled
    }
  }

  /**
   * Check if escalation notifications are enabled
   */
  private static async isEscalationNotificationsEnabled(): Promise<boolean> {
    try {
      const setting = await getSettingValue('TASK_NOTIFICATION_SEND_ESCALATION');
      return setting === 'true';
    } catch (error) {
      console.error('Error getting escalation notifications setting:', error);
      return true; // Default to enabled
    }
  }
}
