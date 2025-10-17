import { prisma } from "@/lib/prisma";
import { getCompanyName } from "@/lib/company-settings";
import { NotificationService } from "./notification-service";

export class NotificationProcessor {
  /**
   * Process all pending notifications
   */
  static async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await NotificationService.getPendingNotifications();
      
      console.log(`Processing ${pendingNotifications.length} pending notifications`);
      
      for (const notification of pendingNotifications) {
        await this.processNotification(notification);
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Process a single notification
   */
  static async processNotification(notification: any): Promise<void> {
    try {
      const channels = JSON.parse(notification.channels as string) as string[];
      
      // Process each channel
      const channelPromises = channels.map(channel => 
        this.sendToChannel(notification, channel)
      );
      
      await Promise.all(channelPromises);
      
      // Mark as sent
      await NotificationService.markAsSent(notification.id);
      
      console.log(`Notification ${notification.id} processed successfully`);
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
      
      // Mark as failed (you might want to implement retry logic)
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { 
          status: 'FAILED',
          // You could add an error field to store the error message
        }
      });
    }
  }

  /**
   * Send notification through a specific channel
   */
  static async sendToChannel(notification: any, channel: string): Promise<void> {
    try {
      switch (channel) {
        case 'EMAIL':
          await this.sendEmail(notification);
          break;
        case 'SMS':
          await this.sendSMS(notification);
          break;
        case 'WHATSAPP':
          await this.sendWhatsApp(notification);
          break;
        case 'IN_APP':
          // In-app notifications are already stored in the database
          // They will be fetched by the frontend
          console.log(`In-app notification stored: ${notification.title}`);
          break;
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Error sending notification via ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  static async sendEmail(notification: any): Promise<void> {
    try {
      console.log(`📧 Sending email notification to ${notification.user.email}:`);
      console.log(`Subject: ${notification.title}`);
      console.log(`Body: ${notification.message}`);

      // Get SMTP configuration from database (following README standards)
      const smtpHost = await this.getSettingValue('SMTP_HOST', '');
      const smtpPort = await this.getSettingValue('SMTP_PORT', '587');
      const smtpUsername = await this.getSettingValue('SMTP_USERNAME', '');
      const smtpPassword = await this.getSettingValue('SMTP_PASSWORD', '');
      const smtpFromAddress = await this.getSettingValue('SMTP_FROM_ADDRESS', '');
      const smtpFromName = await this.getSettingValue('SMTP_FROM_NAME', await getCompanyName());
      const smtpEncryption = await this.getSettingValue('SMTP_ENCRYPTION', 'tls');

      if (!smtpHost || !smtpUsername || !smtpPassword || !smtpFromAddress) {
        console.warn('SMTP configuration not found, skipping email notification');
        return;
      }

      // Use nodemailer with standard configuration (following README standards)
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
        to: notification.user.email,
        subject: notification.title,
        text: notification.message,
        html: notification.message.replace(/\n/g, '<br>'),
      });

      console.log(`✅ Email notification sent successfully to ${notification.user.email}`);
    } catch (error) {
      console.error('❌ Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMS(notification: any): Promise<void> {
    try {
      if (!notification.user.phone) {
        console.warn(`No phone number for user ${notification.user.id}`);
        return;
      }

      // Get SMS configuration from database (following README standards)
      const smsUsername = await this.getSettingValue('SMS_USERNAME', '');
      const smsPassword = await this.getSettingValue('SMS_PASSWORD', '');
      const smsSenderId = await this.getSettingValue('SMS_SENDER_ID', 'AdPools');

      if (!smsUsername || !smsPassword) {
        console.warn('SMS configuration not found, skipping SMS notification');
        return;
      }

      console.log(`📱 Sending SMS notification to ${notification.user.phone}: ${notification.message}`);

      // Send SMS via Deywuro API (following README standards)
      const response = await fetch('https://deywuro.com/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: smsUsername,
          password: smsPassword,
          destination: notification.user.phone,
          source: smsSenderId,
          message: notification.message
        })
      });

      const responseText = await response.text();

      // Handle Deywuro response format (following README standards)
      const result = JSON.parse(responseText);
      if (result.code === 0) {
        console.log(`✅ SMS notification sent successfully to ${notification.user.phone}`);
      } else {
        console.error(`❌ SMS notification failed: ${result.message}`);
        throw new Error(`SMS failed: ${result.message}`);
      }
      
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  /**
   * Helper function to get setting value from database
   */
  static async getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
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
   * Send WhatsApp notification
   */
  static async sendWhatsApp(notification: any): Promise<void> {
    try {
      // TODO: Implement actual WhatsApp sending
      // This would integrate with services like:
      // - WhatsApp Business API
      // - Twilio WhatsApp
      // - Deywuro WhatsApp
      
      if (!notification.user.phone) {
        console.warn(`No phone number for user ${notification.user.id}`);
        return;
      }
      
      console.log(`WhatsApp notification sent to ${notification.user.phone}:`);
      console.log(`Message: ${notification.message}`);
      
      // Example implementation:
      // await whatsappService.send({
      //   to: notification.user.phone,
      //   message: notification.message
      // });
      
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw error;
    }
  }

  /**
   * Format email message with HTML
   */
  static formatEmailMessage(notification: any): string {
    const data = notification.data ? JSON.parse(notification.data as string) : {};
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 16px;">${notification.title}</h2>
          <div style="background-color: white; padding: 20px; border-radius: 4px; margin-bottom: 16px;">
            <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          </div>
          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px;">
              This is an automated message from AD Pools Sales Management System.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Schedule notification processing (to be called by a cron job or background task)
   */
  static async startProcessing(): Promise<void> {
    console.log('Starting notification processor...');
    
    // Process notifications every minute
    setInterval(async () => {
      try {
        await this.processPendingNotifications();
      } catch (error) {
        console.error('Error in notification processing interval:', error);
      }
    }, 60000); // 60 seconds
    
    // Initial processing
    await this.processPendingNotifications();
  }
}

// Utility functions for common notification scenarios

export const NotificationHelpers = {
  /**
   * Send low stock alerts for multiple products
   */
  async sendBulkLowStockAlerts(products: Array<{name: string, currentStock: number, reorderPoint: number}>): Promise<void> {
    for (const product of products) {
      const trigger = {
        type: 'STOCK_LOW' as const,
        title: 'Low Stock Alert',
        message: `${product.name} is running low. Current stock: ${product.currentStock}, Reorder point: ${product.reorderPoint}`,
        channels: ['IN_APP' as const, 'EMAIL' as const],
        data: { productName: product.name, currentStock: product.currentStock, reorderPoint: product.reorderPoint }
      };
      
      await NotificationService.sendToInventoryManagers(trigger);
    }
  },

  /**
   * Send daily inventory summary
   */
  async sendDailyInventorySummary(): Promise<void> {
    try {
      // Get inventory summary data
      const lowStockCount = await (prisma as any).product.count({
        where: {
          stockItem: {
            some: {
              available: {
                lte: 10
              }
            }
          }
        }
      });

      const outOfStockCount = await (prisma as any).product.count({
        where: {
          stockItem: {
            some: {
              available: 0
            }
          }
        }
      });

      const trigger = {
        type: 'SYSTEM_ALERT' as const,
        title: 'Daily Inventory Summary',
        message: `Inventory Status: ${lowStockCount} products with low stock, ${outOfStockCount} products out of stock.`,
        channels: ['IN_APP' as const, 'EMAIL' as const],
        data: { lowStockCount, outOfStockCount, date: new Date().toISOString().split('T')[0] }
      };

      await NotificationService.sendToInventoryManagers(trigger);
    } catch (error) {
      console.error('Error sending daily inventory summary:', error);
    }
  },

  /**
   * Send security alerts
   */
  async sendSecurityAlert(alertType: string, description: string, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    const channels = severity === 'high' 
      ? ['IN_APP' as const, 'EMAIL' as const, 'SMS' as const]
      : ['IN_APP' as const, 'EMAIL' as const];

    const trigger = {
      type: 'SECURITY_ALERT' as const,
      title: `Security Alert: ${alertType}`,
      message: `${alertType}: ${description}`,
      channels,
      data: { alertType, description, severity }
    };

    await NotificationService.sendToAdmins(trigger);
  }
};
