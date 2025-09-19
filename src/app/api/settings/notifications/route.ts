import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to get setting value from database or environment
async function getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key }
    });
    return setting?.value || process.env[key] || defaultValue;
  } catch (error) {
    return process.env[key] || defaultValue;
  }
}

// GET /api/settings/notifications - Get notification settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get settings from database first, fallback to environment variables
    const smtpPassword = await getSettingValue('SMTP_PASSWORD', '');
    const smsPassword = await getSettingValue('SMS_PASSWORD', '');
    
    const settings = {
      email: {
        enabled: (await getSettingValue('EMAIL_ENABLED', 'false')) === 'true',
        smtp: {
          host: await getSettingValue('SMTP_HOST', ''),
          port: await getSettingValue('SMTP_PORT', '587'),
          username: await getSettingValue('SMTP_USERNAME', ''),
          password: smtpPassword && smtpPassword.length > 0 ? '***' : '',
          encryption: await getSettingValue('SMTP_ENCRYPTION', 'tls'),
          fromAddress: await getSettingValue('SMTP_FROM_ADDRESS', ''),
          fromName: await getSettingValue('SMTP_FROM_NAME', 'AdPools Group')
        },
        notifications: {
          stock_low: (await getSettingValue('EMAIL_STOCK_LOW', 'false')) === 'true',
          stock_out: (await getSettingValue('EMAIL_STOCK_OUT', 'false')) === 'true',
          new_order: (await getSettingValue('EMAIL_NEW_ORDER', 'false')) === 'true',
          order_status: (await getSettingValue('EMAIL_ORDER_STATUS', 'false')) === 'true',
          payment_received: (await getSettingValue('EMAIL_PAYMENT_RECEIVED', 'false')) === 'true',
          user_created: (await getSettingValue('EMAIL_USER_CREATED', 'false')) === 'true',
          user_login: (await getSettingValue('EMAIL_USER_LOGIN', 'false')) === 'true',
          system_backup: (await getSettingValue('EMAIL_SYSTEM_BACKUP', 'false')) === 'true'
        }
      },
      sms: {
        enabled: (await getSettingValue('SMS_ENABLED', 'false')) === 'true',
        provider: {
          name: await getSettingValue('SMS_PROVIDER', 'deywuro'),
          username: await getSettingValue('SMS_USERNAME', ''),
          password: smsPassword && smsPassword.length > 0 ? '***' : '',
          senderId: await getSettingValue('SMS_SENDER_ID', ''),
          baseUrl: await getSettingValue('SMS_BASE_URL', 'https://deywuro.com/api')
        },
        notifications: {
          stock_low: (await getSettingValue('SMS_STOCK_LOW', 'false')) === 'true',
          stock_out: (await getSettingValue('SMS_STOCK_OUT', 'false')) === 'true',
          new_order: (await getSettingValue('SMS_NEW_ORDER', 'false')) === 'true',
          order_status: (await getSettingValue('SMS_ORDER_STATUS', 'false')) === 'true',
          payment_received: (await getSettingValue('SMS_PAYMENT_RECEIVED', 'false')) === 'true',
          user_created: (await getSettingValue('SMS_USER_CREATED', 'false')) === 'true',
          user_login: (await getSettingValue('SMS_USER_LOGIN', 'false')) === 'true',
          system_backup: (await getSettingValue('SMS_SYSTEM_BACKUP', 'false')) === 'true'
        }
      }
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

// Helper function to save setting to database
async function saveSetting(key: string, value: string, category: string = 'notifications'): Promise<void> {
  await prisma.systemSettings.upsert({
    where: { key },
    update: { 
      value,
      category,
      updatedAt: new Date()
    },
    create: {
      key,
      value,
      category,
      type: 'string',
      description: `Notification setting for ${key}`,
      isActive: true
    }
  });
}

// PUT /api/settings/notifications - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      );
    }

    // Save email settings to database
    if (settings.email) {
      await saveSetting('EMAIL_ENABLED', settings.email.enabled ? 'true' : 'false');
      
      if (settings.email.smtp) {
        await saveSetting('SMTP_HOST', settings.email.smtp.host || '');
        await saveSetting('SMTP_PORT', settings.email.smtp.port || '587');
        await saveSetting('SMTP_USERNAME', settings.email.smtp.username || '');
        
        // Only save password if it's not the masked value
        if (settings.email.smtp.password && settings.email.smtp.password !== '***') {
          await saveSetting('SMTP_PASSWORD', settings.email.smtp.password);
        }
        
        await saveSetting('SMTP_ENCRYPTION', settings.email.smtp.encryption || 'tls');
        await saveSetting('SMTP_FROM_ADDRESS', settings.email.smtp.fromAddress || '');
        await saveSetting('SMTP_FROM_NAME', settings.email.smtp.fromName || 'AdPools Group');
      }

      // Save email notification types
      if (settings.email.notifications) {
        for (const [key, value] of Object.entries(settings.email.notifications)) {
          await saveSetting(`EMAIL_${key.toUpperCase()}`, value ? 'true' : 'false');
        }
      }
    }

    // Save SMS settings to database
    if (settings.sms) {
      await saveSetting('SMS_ENABLED', settings.sms.enabled ? 'true' : 'false');
      
      if (settings.sms.provider) {
        await saveSetting('SMS_PROVIDER', settings.sms.provider.name || 'deywuro');
        
        // Save username and password if provided
        await saveSetting('SMS_USERNAME', settings.sms.provider.username || '');
        
        // Only save password if it's not the masked value
        if (settings.sms.provider.password && settings.sms.provider.password !== '***') {
          await saveSetting('SMS_PASSWORD', settings.sms.provider.password);
        }
        
        await saveSetting('SMS_SENDER_ID', settings.sms.provider.senderId || '');
        await saveSetting('SMS_BASE_URL', settings.sms.provider.baseUrl || 'https://deywuro.com/api');
      }

      // Save SMS notification types
      if (settings.sms.notifications) {
        for (const [key, value] of Object.entries(settings.sms.notifications)) {
          await saveSetting(`SMS_${key.toUpperCase()}`, value ? 'true' : 'false');
        }
      }
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      settings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}