import { prisma } from './prisma';
import nodemailer from 'nodemailer';

export class TaskNotificationService {
  /**
   * Send task assignment notification
   */
  static async sendTaskAssignmentNotification(task: any): Promise<void> {
    try {
      // Get email settings
      const emailSettings = await this.getEmailSettings();
      if (!emailSettings.enabled) {
        console.log('Email notifications disabled');
        return;
      }

      // Get assignee details
      const assignee = await prisma.user.findUnique({
        where: { id: task.assignedTo },
      });

      if (!assignee?.email) {
        console.log('Assignee has no email address');
        return;
      }

      // Create email transporter
      const transporter = nodemailer.createTransport({
        host: emailSettings.smtpHost,
        port: parseInt(emailSettings.smtpPort),
        secure: emailSettings.smtpEncryption === 'ssl',
        auth: {
          user: emailSettings.smtpUsername,
          pass: emailSettings.smtpPassword,
        },
      });

      // Send email
      const mailOptions = {
        from: emailSettings.smtpUsername,
        to: assignee.email,
        subject: `New Task Assigned: ${task.title}`,
        html: this.generateTaskAssignmentEmailHTML(task, assignee),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Task assignment notification sent to ${assignee.email}`);
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
    }
  }

  /**
   * Send daily task summary email
   */
  static async sendDailyTaskSummary(userId: string): Promise<void> {
    try {
      // Get email settings
      const emailSettings = await this.getEmailSettings();
      if (!emailSettings.enabled) {
        console.log('Email notifications disabled');
        return;
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.email) {
        console.log('User has no email address');
        return;
      }

      // Get user's tasks for today
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const tasks = await prisma.task.findMany({
        where: {
          assignedTo: userId,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          OR: [
            { dueDate: { gte: startOfDay, lt: endOfDay } },
            { dueDate: null },
          ],
        },
        include: {
          creator: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
      });

      if (tasks.length === 0) {
        console.log('No tasks found for daily summary');
        return;
      }

      // Create email transporter
      const transporter = nodemailer.createTransport({
        host: emailSettings.smtpHost,
        port: parseInt(emailSettings.smtpPort),
        secure: emailSettings.smtpEncryption === 'ssl',
        auth: {
          user: emailSettings.smtpUsername,
          pass: emailSettings.smtpPassword,
        },
      });

      // Send email
      const mailOptions = {
        from: emailSettings.smtpUsername,
        to: user.email,
        subject: `Daily Task Summary - ${today.toLocaleDateString()}`,
        html: this.generateDailySummaryEmailHTML(user, tasks),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Daily task summary sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending daily task summary:', error);
    }
  }

  /**
   * Send daily summaries to all users with tasks
   */
  static async sendDailySummariesToAllUsers(): Promise<void> {
    try {
      // Get all users who have pending tasks
      const usersWithTasks = await prisma.user.findMany({
        where: {
          assignedTasks: {
            some: {
              status: { notIn: ['COMPLETED', 'CANCELLED'] },
            },
          },
          email: { not: null },
        },
        select: {
          id: true,
          email: true,
        },
      });

      console.log(`Sending daily summaries to ${usersWithTasks.length} users`);

      for (const user of usersWithTasks) {
        await this.sendDailyTaskSummary(user.id);
      }
    } catch (error) {
      console.error('Error sending daily summaries to all users:', error);
    }
  }

  /**
   * Get email settings from database
   */
  private static async getEmailSettings(): Promise<any> {
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'email.enabled',
            'email.smtp.host',
            'email.smtp.port',
            'email.smtp.encryption',
            'email.smtp.username',
            'email.smtp.password',
          ],
        },
      },
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      enabled: settingsMap['email.enabled'] === 'true',
      smtpHost: settingsMap['email.smtp.host'] || '',
      smtpPort: settingsMap['email.smtp.port'] || '587',
      smtpEncryption: settingsMap['email.smtp.encryption'] || 'tls',
      smtpUsername: settingsMap['email.smtp.username'] || '',
      smtpPassword: settingsMap['email.smtp.password'] || '',
    };
  }

  /**
   * Generate HTML for task assignment email
   */
  private static generateTaskAssignmentEmailHTML(task: any, assignee: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Task Assigned</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-details { background: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .priority-high { background: #f8d7da; color: #721c24; }
          .priority-medium { background: #fff3cd; color: #856404; }
          .priority-low { background: #d1edff; color: #0c5460; }
          .priority-urgent { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Task Assigned</h2>
            <p>Hello ${assignee.name},</p>
            <p>A new task has been assigned to you.</p>
          </div>
          
          <div class="task-details">
            <h3>${task.title}</h3>
            <p><strong>Priority:</strong> <span class="priority priority-${task.priority.toLowerCase()}">${task.priority}</span></p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
            ${task.dueDate ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
            <p><strong>Status:</strong> ${task.status.replace('_', ' ')}</p>
          </div>
          
          <p>Please log in to your account to view and manage this task.</p>
          
          <p>Best regards,<br>Your Team</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for daily task summary email
   */
  private static generateDailySummaryEmailHTML(user: any, tasks: any[]): string {
    const today = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Task Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-list { background: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .task-item { padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .task-item:last-child { border-bottom: none; }
          .priority { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-right: 8px; }
          .priority-high { background: #f8d7da; color: #721c24; }
          .priority-medium { background: #fff3cd; color: #856404; }
          .priority-low { background: #d1edff; color: #0c5460; }
          .priority-urgent { background: #f8d7da; color: #721c24; }
          .status { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; }
          .status-pending { background: #e2e3e5; color: #383d41; }
          .status-in-progress { background: #cce5ff; color: #004085; }
          .status-overdue { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Daily Task Summary</h2>
            <p>Hello ${user.name},</p>
            <p>Here are your tasks for ${today}:</p>
          </div>
          
          <div class="task-list">
            <h3>Your Tasks (${tasks.length})</h3>
            ${tasks.map(task => `
              <div class="task-item">
                <strong>${task.title}</strong>
                <br>
                <span class="priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
                <span class="status status-${task.status.toLowerCase().replace('_', '-')}">${task.status.replace('_', ' ')}</span>
                ${task.dueDate ? `<br><small>Due: ${new Date(task.dueDate).toLocaleDateString()}</small>` : ''}
                ${task.description ? `<br><small>${task.description}</small>` : ''}
              </div>
            `).join('')}
          </div>
          
          <p>Have a productive day!</p>
          
          <p>Best regards,<br>Your Team</p>
        </div>
      </body>
      </html>
    `;
  }
}
