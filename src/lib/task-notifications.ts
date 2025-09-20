import { prisma } from '@/lib/prisma';

interface TaskNotificationData {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  taskPriority: string;
  taskDueDate?: string;
  assignedBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export class TaskNotificationService {
  /**
   * Send notification when a task is assigned to a user
   */
  static async sendTaskAssignedNotification(data: TaskNotificationData) {
    try {
      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          type: 'CUSTOM',
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${data.taskTitle}`,
          data: {
            taskId: data.taskId,
            taskTitle: data.taskTitle,
            taskDescription: data.taskDescription,
            taskPriority: data.taskPriority,
            taskDueDate: data.taskDueDate,
            assignedBy: data.assignedBy.name,
          },
          channels: ['EMAIL', 'SMS'],
          userId: data.assignedTo.id,
          status: 'PENDING'
        }
      });

      // Send email notification
      await this.sendEmailNotification(data, notification.id);

      // Send SMS notification if phone number exists
      if (data.assignedTo.phone) {
        await this.sendSMSNotification(data, notification.id);
      }

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      });

      console.log(`Task assignment notification sent to ${data.assignedTo.email}`);
      return { success: true, notificationId: notification.id };

    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send email notification for task assignment
   */
  private static async sendEmailNotification(data: TaskNotificationData, notificationId: string) {
    try {
      // Use same approach as working communication system
      const smtpHost = await this.getSettingValue('SMTP_HOST', '');
      const smtpPort = await this.getSettingValue('SMTP_PORT', '587');
      const smtpUsername = await this.getSettingValue('SMTP_USERNAME', '');
      const smtpPassword = await this.getSettingValue('SMTP_PASSWORD', '');
      const smtpFromAddress = await this.getSettingValue('SMTP_FROM_ADDRESS', '');
      const smtpFromName = await this.getSettingValue('SMTP_FROM_NAME', 'AdPools Group');
      const smtpEncryption = await this.getSettingValue('SMTP_ENCRYPTION', 'tls');

      if (!smtpHost || !smtpUsername || !smtpPassword || !smtpFromAddress) {
        console.log('Email notifications disabled or not configured');
        return;
      }

      const subject = `New Task Assigned: ${data.taskTitle}`;
      const message = this.generateEmailContent(data);

      // Create email message record
      const emailMessage = await prisma.emailMessage.create({
        data: {
          recipient: data.assignedTo.email,
          subject: subject,
          message: message,
          status: 'PENDING',
          provider: 'nodemailer',
          userId: data.assignedBy.id
        }
      });

      // Send email using nodemailer with same config as communication system
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpEncryption === 'ssl',
        auth: {
          user: smtpUsername,
          pass: smtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"${smtpFromName}" <${smtpFromAddress}>`,
        to: data.assignedTo.email,
        subject: subject,
        text: message,
        html: message.replace(/\n/g, '<br>'),
      });

      // Update email message status
      await prisma.emailMessage.update({
        where: { id: emailMessage.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      });

      console.log(`Task assignment email sent to ${data.assignedTo.email}`);

    } catch (error) {
      console.error('Error sending task assignment email:', error);
    }
  }

  /**
   * Helper method to get setting value
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
   * Send SMS notification for task assignment
   */
  private static async sendSMSNotification(data: TaskNotificationData, notificationId: string) {
    try {
      // Use same approach as working communication system
      const smsUsername = await this.getSettingValue('SMS_USERNAME', '');
      const smsPassword = await this.getSettingValue('SMS_PASSWORD', '');
      const smsSenderId = await this.getSettingValue('SMS_SENDER_ID', 'AdPools');

      if (!smsUsername || !smsPassword) {
        console.log('SMS notifications disabled or not configured');
        return;
      }

      if (!data.assignedTo.phone) {
        console.log('SMS notifications disabled or no phone number');
        return;
      }

      const message = this.generateSMSContent(data);

      // Create SMS message record
      const smsMessage = await prisma.smsMessage.create({
        data: {
          recipient: data.assignedTo.phone,
          message: message,
          status: 'PENDING',
          userId: data.assignedBy.id
        }
      });

      // Send SMS using same working endpoint as communication system
      const response = await fetch('https://deywuro.com/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: smsUsername,
          password: smsPassword,
          destination: data.assignedTo.phone,
          source: smsSenderId,
          message: message
        })
      });

      const responseText = await response.text();
      
      // Try to parse as JSON like the working communication system
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`SMS provider returned non-JSON response: ${response.status} - ${responseText.substring(0, 100)}`);
      }

      if (result.code === 0) {
        // Update SMS message status
        await prisma.smsMessage.update({
          where: { id: smsMessage.id },
          data: { 
            status: 'SENT',
            sentAt: new Date(),
            providerId: result.id || `deywuro_${Date.now()}`
          }
        });

        console.log(`Task assignment SMS sent to ${data.assignedTo.phone}`);
      } else {
        throw new Error(`Deywuro SMS failed: ${result.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error sending task assignment SMS:', error);
    }
  }

  /**
   * Generate email content for task assignment
   */
  private static generateEmailContent(data: TaskNotificationData): string {
    const dueDate = data.taskDueDate 
      ? new Date(data.taskDueDate).toLocaleDateString() 
      : 'Not specified';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0 0 10px 0;">New Task Assigned</h2>
          <p style="color: #6b7280; margin: 0;">You have been assigned to a new task</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">${data.taskTitle}</h3>
          
          ${data.taskDescription ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">Description:</strong>
              <p style="color: #6b7280; margin: 5px 0 0 0;">${data.taskDescription}</p>
            </div>
          ` : ''}
          
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Priority:</strong>
            <span style="color: ${this.getPriorityColor(data.taskPriority)}; font-weight: 600;">
              ${data.taskPriority}
            </span>
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Due Date:</strong>
            <span style="color: #6b7280;">${dueDate}</span>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #374151;">Assigned by:</strong>
            <span style="color: #6b7280;">${data.assignedBy.name}</span>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/tasks" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Task
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>This is an automated message from AdPools Group Task Management System</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate SMS content for task assignment
   */
  private static generateSMSContent(data: TaskNotificationData): string {
    const dueDate = data.taskDueDate 
      ? new Date(data.taskDueDate).toLocaleDateString() 
      : 'No due date';

    return `New Task Assigned: "${data.taskTitle}" - Priority: ${data.taskPriority}, Due: ${dueDate}. Assigned by ${data.assignedBy.name}. Check your tasks at ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/tasks`;
  }

  /**
   * Get color for priority display
   */
  private static getPriorityColor(priority: string): string {
    switch (priority.toUpperCase()) {
      case 'URGENT': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#ca8a04';
      case 'LOW': return '#16a34a';
      default: return '#6b7280';
    }
  }

  /**
   * Send notification when task is completed
   */
  static async sendTaskCompletedNotification(taskId: string, completedBy: { id: string; name: string }) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          creator: { select: { id: true, name: true, email: true, phone: true } },
          assignee: { select: { id: true, name: true, email: true, phone: true } }
        }
      });

      if (!task || !task.creator) return;

      // Only notify the task creator if someone else completed it
      if (task.creator.id === completedBy.id) return;

      const notificationData = {
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskPriority: task.priority,
        taskDueDate: task.dueDate?.toISOString(),
        assignedBy: completedBy,
        assignedTo: {
          id: task.creator.id,
          name: task.creator.name || 'User',
          email: task.creator.email,
          phone: task.creator.phone
        }
      };

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          type: 'CUSTOM',
          title: 'Task Completed',
          message: `Task "${task.title}" has been completed by ${completedBy.name}`,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            completedBy: completedBy.name,
          },
          channels: ['EMAIL', 'SMS'],
          userId: task.creator.id,
          status: 'SENT'
        }
      });

      console.log(`Task completion notification created for ${task.creator.email}`);
      return { success: true, notificationId: notification.id };

    } catch (error) {
      console.error('Error sending task completion notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
