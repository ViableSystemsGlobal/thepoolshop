import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Helper function to get setting value from database
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

// SMS sending function using the same infrastructure as communications
async function sendSmsViaDeywuro(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string; cost?: number }> {
  try {
    const username = await getSettingValue('SMS_USERNAME', '');
    const password = await getSettingValue('SMS_PASSWORD', '');
    const senderId = await getSettingValue('SMS_SENDER_ID', 'AdPools');

    if (!username || !password) {
      throw new Error('SMS configuration not found. Please configure SMS settings.');
    }

    console.log('Sending credit alert SMS to:', phoneNumber);

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
    console.log('Credit Alert SMS Response Status:', response.status);
    console.log('Credit Alert SMS Response Text:', responseText);

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

// Email sending function using the same infrastructure as communications
async function sendEmailViaSMTP(
  recipient: string, 
  subject: string, 
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const smtpHost = await getSettingValue('SMTP_HOST', '');
    const smtpPort = await getSettingValue('SMTP_PORT', '587');
    const smtpUsername = await getSettingValue('SMTP_USERNAME', '');
    const smtpPassword = await getSettingValue('SMTP_PASSWORD', '');
    const smtpFromAddress = await getSettingValue('SMTP_FROM_ADDRESS', '');
    const smtpFromName = await getSettingValue('SMTP_FROM_NAME', 'AdPools Group');
    const smtpEncryption = await getSettingValue('SMTP_ENCRYPTION', 'tls');

    if (!smtpHost || !smtpUsername || !smtpPassword || !smtpFromAddress) {
      throw new Error('SMTP configuration not found. Please configure email settings.');
    }

    console.log('Sending credit alert email to:', recipient);

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

    console.log('Credit alert email sent successfully:', result.messageId);

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

// Main credit monitoring function
async function checkCreditAlerts() {
  try {
    console.log('🔍 Starting credit monitoring check...');

    // Get credit monitoring settings
    const monitoringEnabled = await getSettingValue('CREDIT_MONITORING_ENABLED', 'true');
    if (monitoringEnabled !== 'true') {
      console.log('📴 Credit monitoring is disabled');
      return { checked: 0, alerts: 0 };
    }

    const alertThreshold = parseFloat(await getSettingValue('CREDIT_ALERT_THRESHOLD', '80'));
    const overdueDays = parseInt(await getSettingValue('CREDIT_OVERDUE_DAYS', '30'));

    // Get all active distributors with credit limits
    const distributors = await prisma.distributor.findMany({
      where: {
        status: 'ACTIVE',
        creditLimit: { not: null },
        currentCreditUsed: { not: null }
      },
      include: {
        creditHistory: {
          orderBy: { performedAt: 'desc' },
          take: 1
        }
      }
    });

    console.log(`📊 Checking ${distributors.length} distributors for credit alerts`);

    let alertsSent = 0;
    const alertResults = [];

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
        
        const smsResult = await sendSmsViaDeywuro(distributor.phone, smsMessage);
        
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

        const emailResult = await sendEmailViaSMTP('admin@adpools.com', emailSubject, emailMessage);

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

        alertResults.push({
          distributorId: distributor.id,
          distributorName: distributor.businessName,
          alertType,
          utilization: utilization.toFixed(1),
          smsSent: smsResult.success,
          emailSent: emailResult.success
        });

        alertsSent++;
      }
    }

    console.log(`✅ Credit monitoring completed: ${alertsSent} alerts sent`);

    return {
      checked: distributors.length,
      alerts: alertsSent,
      results: alertResults
    };

  } catch (error) {
    console.error('❌ Error in credit monitoring:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Manual credit monitoring triggered by:', session.user.email);

    const result = await checkCreditAlerts();

    return NextResponse.json({
      success: true,
      message: `Credit monitoring completed. Checked ${result.checked} distributors, sent ${result.alerts} alerts.`,
      data: result
    });

  } catch (error) {
    console.error('Error in credit monitoring API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run credit monitoring',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent credit alerts
    const recentAlerts = await prisma.distributorCreditHistory.findMany({
      where: {
        action: {
          in: ['CREDIT_LIMIT_EXCEEDED', 'HIGH_CREDIT_UTILIZATION']
        }
      },
      include: {
        distributor: {
          select: {
            businessName: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: { performedAt: 'desc' },
      take: 20
    });

    // Get credit monitoring settings
    const settings = await prisma.systemSettings.findMany({
      where: { category: 'credit' }
    });

    const creditSettings = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.type === 'number' ? parseFloat(setting.value) : setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        recentAlerts,
        settings: {
          monitoringEnabled: creditSettings.CREDIT_MONITORING_ENABLED || true,
          alertThreshold: creditSettings.CREDIT_ALERT_THRESHOLD || 80,
          overdueDays: creditSettings.CREDIT_OVERDUE_DAYS || 30
        }
      }
    });

  } catch (error) {
    console.error('Error fetching credit monitoring data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch credit monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
