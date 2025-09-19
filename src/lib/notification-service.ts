import { prisma } from "@/lib/prisma";

export interface NotificationTrigger {
  type: string;
  title: string;
  message: string;
  channels: string[];
  data?: any;
  scheduledAt?: Date;
}

export interface NotificationRecipient {
  userId?: string;
  role?: string;
  email?: string;
}

export class NotificationService {
  /**
   * Send notification to specific user
   */
  static async sendToUser(
    recipientId: string,
    trigger: NotificationTrigger
  ): Promise<void> {
    try {
      // Get user preferences
      const user = await (prisma as any).user.findUnique({
        where: { id: recipientId },
        select: { 
          id: true,
          email: true,
          name: true,
          preferences: true
        }
      });

      const userPreferences = user?.preferences as any;
      const notificationPreferences = userPreferences?.notifications;

      // Check if user has notifications enabled
      if (notificationPreferences?.enabled === false) {
        console.log(`Notifications disabled for user ${recipientId}, skipping notification: ${trigger.title}`);
        return;
      }

      // Filter channels based on user preferences
      let allowedChannels = trigger.channels;
      if (notificationPreferences?.channels) {
        allowedChannels = trigger.channels.filter(channel => {
          const channelKey = channel.toLowerCase().replace('_', '');
          return notificationPreferences.channels[channelKey] === true;
        });
      }

      // Check if notification type is allowed
      if (notificationPreferences?.types) {
        const typeKey = trigger.type.toLowerCase().replace('_', '');
        if (notificationPreferences.types[typeKey] === false) {
          console.log(`Notification type ${trigger.type} disabled for user ${recipientId}, skipping notification: ${trigger.title}`);
          return;
        }
      }

      // Check quiet hours
      if (notificationPreferences?.quietHours?.enabled) {
        const now = new Date();
        const quietStart = notificationPreferences.quietHours.start;
        const quietEnd = notificationPreferences.quietHours.end;
        
        // Simple quiet hours check (you might want to implement timezone support)
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTime = this.parseTime(quietStart);
        const endTime = this.parseTime(quietEnd);
        
        if (this.isInQuietHours(currentTime, startTime, endTime)) {
          console.log(`User ${recipientId} is in quiet hours, skipping notification: ${trigger.title}`);
          return;
        }
      }

      if (allowedChannels.length === 0) {
        console.log(`No allowed channels for user ${recipientId}, skipping notification: ${trigger.title}`);
        return;
      }

      await (prisma as any).notification.create({
        data: {
          userId: recipientId,
          type: trigger.type,
          title: trigger.title,
          message: trigger.message,
          channels: JSON.stringify(allowedChannels),
          status: 'PENDING',
          data: trigger.data ? JSON.stringify(trigger.data) : null,
          scheduledAt: trigger.scheduledAt || null
        }
      });

      console.log(`Notification sent to user ${recipientId}: ${trigger.title} via channels: ${allowedChannels.join(', ')}`);
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  /**
   * Send notification to users by role
   */
  static async sendToRole(
    role: string,
    trigger: NotificationTrigger
  ): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: role as any
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      const notificationPromises = users.map(user => 
        this.sendToUser(user.id, trigger)
      );

      await Promise.all(notificationPromises);
      console.log(`Notification sent to ${users.length} users with role ${role}: ${trigger.title}`);
    } catch (error) {
      console.error('Error sending notification to role:', error);
    }
  }

  /**
   * Send notification to multiple specific users
   */
  static async sendToUsers(
    userIds: string[],
    trigger: NotificationTrigger
  ): Promise<void> {
    try {
      const notificationPromises = userIds.map(userId => 
        this.sendToUser(userId, trigger)
      );

      await Promise.all(notificationPromises);
      console.log(`Notification sent to ${userIds.length} users: ${trigger.title}`);
    } catch (error) {
      console.error('Error sending notification to users:', error);
    }
  }

  /**
   * Send notification to all admins
   */
  static async sendToAdmins(trigger: NotificationTrigger): Promise<void> {
    await this.sendToRole('ADMIN', trigger);
  }

  /**
   * Send notification to all inventory managers
   */
  static async sendToInventoryManagers(trigger: NotificationTrigger): Promise<void> {
    await this.sendToRole('INVENTORY_MANAGER', trigger);
  }

  /**
   * Send notification to all sales managers
   */
  static async sendToSalesManagers(trigger: NotificationTrigger): Promise<void> {
    await this.sendToRole('SALES_MANAGER', trigger);
  }

  /**
   * Send notification to all sales reps
   */
  static async sendToSalesReps(trigger: NotificationTrigger): Promise<void> {
    await this.sendToRole('SALES_REP', trigger);
  }

  /**
   * Send notification to all finance officers
   */
  static async sendToFinanceOfficers(trigger: NotificationTrigger): Promise<void> {
    await this.sendToRole('FINANCE_OFFICER', trigger);
  }

  /**
   * Use notification template to send notification
   */
  static async sendFromTemplate(
    recipientId: string,
    templateName: string,
    variables: Record<string, any> = {}
  ): Promise<void> {
    try {
      const template = await (prisma as any).notificationTemplate.findUnique({
        where: { name: templateName }
      });

      if (!template) {
        console.error(`Notification template not found: ${templateName}`);
        return;
      }

      if (!template.isActive) {
        console.log(`Notification template is inactive: ${templateName}`);
        return;
      }

      // Replace variables in template
      let title = template.subject || '';
      let message = template.body;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), String(value));
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      });

      const trigger: NotificationTrigger = {
        type: template.type,
        title,
        message,
        channels: JSON.parse(template.channels as string) as string[],
        data: { templateName, variables }
      };

      await this.sendToUser(recipientId, trigger);
    } catch (error) {
      console.error('Error sending notification from template:', error);
    }
  }

  /**
   * Mark notification as sent
   */
  static async markAsSent(notificationId: string): Promise<void> {
    try {
      await (prisma as any).notification.update({
        where: { id: notificationId },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking notification as sent:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await (prisma as any).notification.update({
        where: { id: notificationId },
        data: {
          readAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get pending notifications for processing
   */
  static async getPendingNotifications(): Promise<any[]> {
    try {
      return await (prisma as any).notification.findMany({
        where: {
          status: 'PENDING',
          OR: [
            { scheduledAt: null },
            { scheduledAt: { lte: new Date() } }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching pending notifications:', error);
      return [];
    }
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if current time is within quiet hours
   */
  private static isInQuietHours(currentTime: number, startTime: number, endTime: number): boolean {
    if (startTime <= endTime) {
      // Quiet hours within the same day (e.g., 22:00 to 08:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span across midnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }
}

// Predefined notification triggers for common system events
export const SystemNotificationTriggers = {
  // Stock notifications
  stockLow: (productName: string, currentStock: number, reorderPoint: number) => ({
    type: 'STOCK_LOW',
    title: 'Low Stock Alert',
    message: `${productName} is running low. Current stock: ${currentStock}, Reorder point: ${reorderPoint}`,
    channels: ['IN_APP', 'EMAIL'],
    data: { productName, currentStock, reorderPoint }
  }),

  stockOut: (productName: string) => ({
    type: 'STOCK_LOW',
    title: 'Out of Stock Alert',
    message: `${productName} is now out of stock and needs immediate attention.`,
    channels: ['IN_APP', 'EMAIL', 'SMS'],
    data: { productName, stockLevel: 0 }
  }),

  // Order notifications
  orderCreated: (orderNumber: string, customerName: string, total: number) => ({
    type: 'ORDER_STATUS',
    title: 'New Order Created',
    message: `Order ${orderNumber} has been created for ${customerName} with a total of $${total}`,
    channels: ['IN_APP', 'EMAIL'],
    data: { orderNumber, customerName, total }
  }),

  orderStatusChanged: (orderNumber: string, newStatus: string, customerName: string) => ({
    type: 'ORDER_STATUS',
    title: 'Order Status Updated',
    message: `Order ${orderNumber} for ${customerName} has been updated to ${newStatus}`,
    channels: ['IN_APP', 'EMAIL'],
    data: { orderNumber, newStatus, customerName }
  }),

  // Payment notifications
  paymentReceived: (amount: number, customerName: string, paymentMethod: string) => ({
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: `Payment of $${amount} received from ${customerName} via ${paymentMethod}`,
    channels: ['IN_APP', 'EMAIL'],
    data: { amount, customerName, paymentMethod }
  }),

  // User notifications
  userInvited: (userName: string, invitedBy: string) => ({
    type: 'USER_INVITED',
    title: 'Welcome to AD Pools SM',
    message: `You have been invited to join AD Pools Sales Management System by ${invitedBy}`,
    channels: ['EMAIL'],
    data: { userName, invitedBy }
  }),

  passwordReset: (userName: string) => ({
    type: 'PASSWORD_RESET',
    title: 'Password Reset Request',
    message: `A password reset has been requested for ${userName}'s account`,
    channels: ['EMAIL'],
    data: { userName }
  }),

  // Security notifications
  securityAlert: (alertType: string, description: string) => ({
    type: 'SECURITY_ALERT',
    title: 'Security Alert',
    message: `${alertType}: ${description}`,
    channels: ['IN_APP', 'EMAIL', 'SMS'],
    data: { alertType, description }
  }),

  // System notifications
  systemAlert: (alertType: string, description: string) => ({
    type: 'SYSTEM_ALERT',
    title: 'System Alert',
    message: `${alertType}: ${description}`,
    channels: ['IN_APP', 'EMAIL'],
    data: { alertType, description }
  })
};
