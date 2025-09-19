import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';

// Helper function to get actual setting value from database
async function getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { channel, settings, testRecipient } = body;

    if (!channel || !settings) {
      return NextResponse.json(
        { error: "Channel and settings are required" },
        { status: 400 }
      );
    }

    if (channel === 'email') {
      const result = await testEmail(settings.email, testRecipient);
      return NextResponse.json(result);
    } else if (channel === 'sms') {
      const result = await testSMS(settings.sms, testRecipient);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid channel" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error testing notification:', error);
    return NextResponse.json(
      { error: "Failed to test notification" },
      { status: 500 }
    );
  }
}

async function testEmail(emailSettings: any, testRecipient?: string) {
  try {
    if (!emailSettings.enabled) {
      return { success: false, message: "Email is not enabled" };
    }

    const { smtp } = emailSettings;
    
    // Get actual password from database if it's masked
    const actualPassword = smtp.password === '***' 
      ? await getSettingValue('SMTP_PASSWORD', '')
      : smtp.password;
    
    if (!smtp.host || !smtp.username || !actualPassword) {
      return { 
        success: false, 
        message: "Email configuration is incomplete. Please check host, username, and password." 
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port) || 587,
      secure: smtp.encryption === 'ssl',
      auth: {
        user: smtp.username,
        pass: actualPassword  // Use actual password from database
      }
    });

    // Send test email
    const info = await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromAddress || smtp.username}>`,
      to: testRecipient || smtp.username, // Send to test recipient or configured email
      subject: 'Test Email from AdPools Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email Successful!</h2>
          <p>This is a test email from your AdPools Group notification system.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: AdPools Group Notification System
          </p>
        </div>
      `
    });

    return {
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId
    };
  } catch (error) {
    return {
      success: false,
      message: `Email test failed: ${(error as Error).message}`
    };
  }
}

async function testSMS(smsSettings: any, testRecipient?: string) {
  try {
    if (!smsSettings.enabled) {
      return { success: false, message: "SMS is not enabled" };
    }

    const { provider } = smsSettings;
    
    // Get actual password from database if it's masked
    const actualPassword = provider.password === '***' 
      ? await getSettingValue('SMS_PASSWORD', '')
      : provider.password;
    
    if (!provider.username || !actualPassword || !provider.senderId) {
      return { 
        success: false, 
        message: "SMS configuration is incomplete. Please check username, password and sender ID." 
      };
    }

    // For now, we'll simulate SMS sending
    // In a real implementation, you would integrate with your SMS provider
    
    if (provider.name === 'deywuro') {
      // Deywuro API as per official documentation
      const response = await fetch(`https://deywuro.com/api/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: provider.username || '',
          password: actualPassword || '',  // Use actual password from database
          destination: testRecipient || '+233000000000',
          source: provider.senderId || 'AdPools',
          message: 'Test SMS from AdPools Group inventory system. Configuration is working correctly!'
        })
      });

      const result = await response.json();
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message || "Test SMS sent successfully"
        };
      } else {
        return {
          success: false,
          message: `Deywuro SMS failed: ${result.message}`
        };
      }
    } else {
      // For other providers, simulate success
      return {
        success: true,
        message: `Test SMS simulated successfully for ${provider.name}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `SMS test failed: ${(error as Error).message}`
    };
  }
}
