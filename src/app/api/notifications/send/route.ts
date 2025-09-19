import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';

// Notification templates
const NOTIFICATION_TEMPLATES = {
  stock_low: {
    email: {
      subject: 'Low Stock Alert - {productName}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⚠️ Low Stock Alert</h2>
          <p>The following product is running low on stock:</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Product:</strong> {productName}<br>
            <strong>Current Stock:</strong> {currentStock}<br>
            <strong>Reorder Point:</strong> {reorderPoint}
          </div>
          <p>Please reorder this product to avoid stockouts.</p>
          <p style="color: #666; font-size: 12px;">Sent at: {timestamp}</p>
        </div>
      `
    },
    sms: 'LOW STOCK ALERT: {productName} has {currentStock} units remaining. Reorder point: {reorderPoint}. Please restock soon.'
  },
  stock_out: {
    email: {
      subject: 'Out of Stock Alert - {productName}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🚨 Out of Stock Alert</h2>
          <p>The following product is completely out of stock:</p>
          <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Product:</strong> {productName}<br>
            <strong>Current Stock:</strong> 0 units
          </div>
          <p>Immediate restocking required!</p>
          <p style="color: #666; font-size: 12px;">Sent at: {timestamp}</p>
        </div>
      `
    },
    sms: 'OUT OF STOCK: {productName} is completely out of stock. Immediate restocking required!'
  },
  new_order: {
    email: {
      subject: 'New Order Received - #{orderNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">📦 New Order Received</h2>
          <p>A new order has been placed:</p>
          <div style="background: #d1fae5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Order Number:</strong> #{orderNumber}<br>
            <strong>Customer:</strong> {customerName}<br>
            <strong>Total Amount:</strong> {totalAmount}
          </div>
          <p>Please process this order promptly.</p>
          <p style="color: #666; font-size: 12px;">Sent at: {timestamp}</p>
        </div>
      `
    },
    sms: 'NEW ORDER: #{orderNumber} from {customerName}. Amount: {totalAmount}. Please process promptly.'
  },
  payment_received: {
    email: {
      subject: 'Payment Received - #{orderNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">💰 Payment Received</h2>
          <p>Payment has been received for order:</p>
          <div style="background: #d1fae5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Order Number:</strong> #{orderNumber}<br>
            <strong>Amount:</strong> {amount}<br>
            <strong>Payment Method:</strong> {paymentMethod}
          </div>
          <p>Order can now be processed for fulfillment.</p>
          <p style="color: #666; font-size: 12px;">Sent at: {timestamp}</p>
        </div>
      `
    },
    sms: 'PAYMENT RECEIVED: {amount} for order #{orderNumber} via {paymentMethod}. Ready for fulfillment.'
  },
  user_created: {
    email: {
      subject: 'New User Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">👤 New User Account</h2>
          <p>A new user account has been created:</p>
          <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Name:</strong> {userName}<br>
            <strong>Email:</strong> {userEmail}<br>
            <strong>Role:</strong> {userRole}
          </div>
          <p style="color: #666; font-size: 12px;">Sent at: {timestamp}</p>
        </div>
      `
    },
    sms: 'NEW USER: {userName} ({userEmail}) created with role: {userRole}'
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data, test = false } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Notification type is required" },
        { status: 400 }
      );
    }

    // Get notification settings
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    const smsEnabled = process.env.SMS_ENABLED === 'true';
    const emailTypeEnabled = process.env[`EMAIL_${type.toUpperCase()}`] === 'true';
    const smsTypeEnabled = process.env[`SMS_${type.toUpperCase()}`] === 'true';

    const results = [];

    // Send email notification
    if (emailEnabled && emailTypeEnabled) {
      const emailResult = await sendEmailNotification(type, data, test);
      results.push({ channel: 'email', ...emailResult });
    }

    // Send SMS notification
    if (smsEnabled && smsTypeEnabled) {
      const smsResult = await sendSMSNotification(type, data, test);
      results.push({ channel: 'sms', ...smsResult });
    }

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No notification channels are enabled for this type"
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notifications processed",
      results
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(type: string, data: any, test: boolean) {
  try {
    const template = NOTIFICATION_TEMPLATES[type as keyof typeof NOTIFICATION_TEMPLATES];
    if (!template) {
      return { success: false, message: `No template found for type: ${type}` };
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_ENCRYPTION === 'ssl',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Replace template variables
    let subject = template.email.subject;
    let html = template.email.html;

    // Add timestamp
    const templateData = {
      ...data,
      timestamp: new Date().toLocaleString()
    };

    // Replace placeholders
    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
    });

    const recipient = test 
      ? process.env.SMTP_USERNAME 
      : 'admin@adpoolsgroup.com'; // In real app, get from user settings

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USERNAME}>`,
      to: recipient,
      subject: test ? `[TEST] ${subject}` : subject,
      html: html
    });

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId
    };
  } catch (error) {
    return {
      success: false,
      message: `Email failed: ${(error as Error).message}`
    };
  }
}

async function sendSMSNotification(type: string, data: any, test: boolean) {
  try {
    const template = NOTIFICATION_TEMPLATES[type as keyof typeof NOTIFICATION_TEMPLATES];
    if (!template) {
      return { success: false, message: `No template found for type: ${type}` };
    }

    // Replace template variables
    let message = template.sms;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), String(value));
    });

    if (test) {
      message = `[TEST] ${message}`;
    }

    // For now, simulate SMS sending
    // In a real implementation, integrate with your SMS provider
    console.log('SMS would be sent:', message);

    return {
      success: true,
      message: "SMS sent successfully (simulated)"
    };
  } catch (error) {
    return {
      success: false,
      message: `SMS failed: ${(error as Error).message}`
    };
  }
}
