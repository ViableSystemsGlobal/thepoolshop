import { prisma } from '@/lib/prisma';

interface StakeholderNotificationData {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  taskPriority: string;
  taskStatus: string;
  taskDueDate?: string;
  updatedBy: {
    id: string;
    name: string;
    email: string;
  };
  stakeholders: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  }[];
  changeType: 'STATUS_CHANGE' | 'PRIORITY_CHANGE' | 'ASSIGNEE_CHANGE' | 'DUE_DATE_CHANGE' | 'DESCRIPTION_CHANGE';
  oldValue?: string;
  newValue?: string;
}

export class StakeholderNotificationService {
  /**
   * Send notifications to all stakeholders when a task is updated
   */
  static async sendTaskUpdateNotification(data: StakeholderNotificationData) {
    try {
      const results = [];

      for (const stakeholder of data.stakeholders) {
        // Skip if the stakeholder is the one who made the change
        if (stakeholder.id === data.updatedBy.id) {
          continue;
        }

        const result = await this.sendNotificationToStakeholder(data, stakeholder);
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`Task update notifications sent to ${successCount}/${data.stakeholders.length} stakeholders`);
      
      return { 
        success: true, 
        sentCount: successCount,
        totalCount: data.stakeholders.length,
        results 
      };

    } catch (error) {
      console.error('Error sending stakeholder notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send notification to a specific stakeholder
   */
  private static async sendNotificationToStakeholder(data: StakeholderNotificationData, stakeholder: any) {
    try {
      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          type: 'CUSTOM',
          title: this.getNotificationTitle(data.changeType),
          message: this.generateNotificationMessage(data, stakeholder),
          data: {
            taskId: data.taskId,
            taskTitle: data.taskTitle,
            taskDescription: data.taskDescription,
            taskPriority: data.taskPriority,
            taskStatus: data.taskStatus,
            taskDueDate: data.taskDueDate,
            updatedBy: data.updatedBy.name,
            changeType: data.changeType,
            oldValue: data.oldValue,
            newValue: data.newValue,
          },
          channels: ['EMAIL', 'SMS'],
          userId: stakeholder.id,
          status: 'PENDING'
        }
      });

      // Send email notification
      await this.sendEmailNotification(data, stakeholder, notification.id);

      // Send SMS notification if phone number exists
      if (stakeholder.phone) {
        await this.sendSMSNotification(data, stakeholder, notification.id);
      }

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      });

      console.log(`Task update notification sent to ${stakeholder.email}`);
      return { success: true, notificationId: notification.id, stakeholder: stakeholder.email };

    } catch (error) {
      console.error(`Error sending notification to ${stakeholder.email}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stakeholder: stakeholder.email };
    }
  }

  /**
   * Send email notification for task update
   */
  private static async sendEmailNotification(data: StakeholderNotificationData, stakeholder: any, notificationId: string) {
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

      const subject = this.getEmailSubject(data);
      const message = this.generateEmailContent(data, stakeholder);

      // Create email message record
      const emailMessage = await prisma.emailMessage.create({
        data: {
          recipient: stakeholder.email,
          subject,
          message,
          status: 'SENT',
          sentAt: new Date(),
          metadata: {
            notificationId,
            taskId: data.taskId,
            changeType: data.changeType,
          }
        }
      });

      // Send email using nodemailer
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
        to: stakeholder.email,
        subject,
        html: message,
      });

      console.log(`Task update email sent to ${stakeholder.email}`);

    } catch (error) {
      console.error('Error sending task update email:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification for task update
   */
  private static async sendSMSNotification(data: StakeholderNotificationData, stakeholder: any, notificationId: string) {
    try {
      // Use same approach as working communication system
      const deywuroApiKey = await this.getSettingValue('DEYWURO_API_KEY', '');
      const deywuroSenderId = await this.getSettingValue('DEYWURO_SENDER_ID', 'AdPools');
      const deywuroEndpoint = await this.getSettingValue('DEYWURO_ENDPOINT', 'https://api.deywuro.com/sms/send');

      if (!deywuroApiKey || !deywuroSenderId) {
        console.log('SMS notifications disabled or not configured');
        return;
      }

      const message = this.generateSMSContent(data, stakeholder);

      // Create SMS message record
      const smsMessage = await prisma.smsMessage.create({
        data: {
          recipient: stakeholder.phone!,
          message,
          status: 'SENT',
          sentAt: new Date(),
          metadata: {
            notificationId,
            taskId: data.taskId,
            changeType: data.changeType,
          }
        }
      });

      // Send SMS using Deywuro API
      const formData = new URLSearchParams();
      formData.append('api_key', deywuroApiKey);
      formData.append('to', stakeholder.phone!);
      formData.append('from', deywuroSenderId);
      formData.append('message', message);

      const response = await fetch(deywuroEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Deywuro API error: ${response.status}`);
      }

      console.log(`Task update SMS sent to ${stakeholder.phone}`);

    } catch (error) {
      console.error('Error sending task update SMS:', error);
      throw error;
    }
  }

  /**
   * Get notification title based on change type
   */
  private static getNotificationTitle(changeType: string): string {
    switch (changeType) {
      case 'STATUS_CHANGE':
        return 'Task Status Updated';
      case 'PRIORITY_CHANGE':
        return 'Task Priority Updated';
      case 'ASSIGNEE_CHANGE':
        return 'Task Assignment Updated';
      case 'DUE_DATE_CHANGE':
        return 'Task Due Date Updated';
      case 'DESCRIPTION_CHANGE':
        return 'Task Description Updated';
      default:
        return 'Task Updated';
    }
  }

  /**
   * Generate notification message
   */
  private static generateNotificationMessage(data: StakeholderNotificationData, stakeholder: any): string {
    const baseMessage = `Task "${data.taskTitle}" has been updated by ${data.updatedBy.name}`;
    
    switch (data.changeType) {
      case 'STATUS_CHANGE':
        return `${baseMessage}. Status changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'PRIORITY_CHANGE':
        return `${baseMessage}. Priority changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'ASSIGNEE_CHANGE':
        return `${baseMessage}. Assignment changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'DUE_DATE_CHANGE':
        return `${baseMessage}. Due date changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'DESCRIPTION_CHANGE':
        return `${baseMessage}. Description has been updated`;
      default:
        return `${baseMessage}. The task has been modified`;
    }
  }

  /**
   * Get email subject
   */
  private static getEmailSubject(data: StakeholderNotificationData): string {
    return `Task Update: ${data.taskTitle}`;
  }

  /**
   * Generate email content
   */
  private static generateEmailContent(data: StakeholderNotificationData, stakeholder: any): string {
    const changeDescription = this.getChangeDescription(data);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Task Update Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-details { background-color: #fff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .change-info { background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
          .priority-urgent { color: #dc3545; font-weight: bold; }
          .priority-high { color: #fd7e14; font-weight: bold; }
          .priority-medium { color: #ffc107; font-weight: bold; }
          .priority-low { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Task Update Notification</h2>
            <p>Hello ${stakeholder.name},</p>
            <p>A task you're involved in has been updated.</p>
          </div>
          
          <div class="task-details">
            <h3>${data.taskTitle}</h3>
            ${data.taskDescription ? `<p><strong>Description:</strong> ${data.taskDescription}</p>` : ''}
            <p><strong>Priority:</strong> <span class="priority-${data.taskPriority.toLowerCase()}">${data.taskPriority}</span></p>
            <p><strong>Status:</strong> ${data.taskStatus.replace('_', ' ')}</p>
            ${data.taskDueDate ? `<p><strong>Due Date:</strong> ${new Date(data.taskDueDate).toLocaleDateString()}</p>` : ''}
            <p><strong>Updated by:</strong> ${data.updatedBy.name}</p>
          </div>
          
          <div class="change-info">
            <h4>What Changed:</h4>
            <p>${changeDescription}</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from AdPools Group Task Management System.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate SMS content
   */
  private static generateSMSContent(data: StakeholderNotificationData, stakeholder: any): string {
    const changeDescription = this.getChangeDescription(data);
    return `Task "${data.taskTitle}" updated by ${data.updatedBy.name}. ${changeDescription}`;
  }

  /**
   * Get change description
   */
  private static getChangeDescription(data: StakeholderNotificationData): string {
    switch (data.changeType) {
      case 'STATUS_CHANGE':
        return `Status changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'PRIORITY_CHANGE':
        return `Priority changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'ASSIGNEE_CHANGE':
        return `Assignment changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'DUE_DATE_CHANGE':
        return `Due date changed from "${data.oldValue}" to "${data.newValue}"`;
      case 'DESCRIPTION_CHANGE':
        return `Description has been updated`;
      default:
        return `The task has been modified`;
    }
  }

  /**
   * Get setting value from database
   */
  private static async getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { key }
      });
      return setting?.value || defaultValue;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get all stakeholders for a task (assignees, creator, and anyone who has commented)
   */
  static async getTaskStakeholders(taskId: string): Promise<any[]> {
    try {
      const task = await (prisma as any).task.findUnique({
        where: { id: taskId },
        include: {
          creator: {
            select: { id: true, name: true, email: true, phone: true }
          },
          assignee: {
            select: { id: true, name: true, email: true, phone: true }
          },
          assignees: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true }
              }
            }
          }
        }
      });

      if (!task) {
        return [];
      }

      // Collect all unique stakeholders
      const stakeholders = new Map<string, any>();

      // Add creator
      if (task.creator) {
        stakeholders.set(task.creator.id, task.creator);
      }

      // Add assignee (legacy)
      if (task.assignee) {
        stakeholders.set(task.assignee.id, task.assignee);
      }

      // Add assignees (new system)
      task.assignees.forEach(assignment => {
        stakeholders.set(assignment.user.id, assignment.user);
      });

      // Add comment authors
      task.comments.forEach(comment => {
        if (comment.user) {
          stakeholders.set(comment.user.id, comment.user);
        }
      });

      return Array.from(stakeholders.values());

    } catch (error) {
      console.error('Error getting task stakeholders:', error);
      return [];
    }
  }
}
