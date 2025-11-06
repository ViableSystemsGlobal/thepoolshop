import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Helper function to get setting value
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, to, subject, content, type = 'OUTBOUND', scheduledAt } = body;

    if (!leadId || !to || !subject || !content) {
      return NextResponse.json(
        { error: 'Lead ID, recipient, subject, and content are required' },
        { status: 400 }
      );
    }

    // Verify the distributor lead exists and user has access
    const lead = await prisma.distributorLead.findFirst({
      where: {
        id: leadId,
        submittedBy: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Distributor lead not found' },
        { status: 404 }
      );
    }

    // Get email settings
    const smtpHost = await getSettingValue('SMTP_HOST', '');
    const smtpPort = await getSettingValue('SMTP_PORT', '587');
    const smtpUsername = await getSettingValue('SMTP_USERNAME', '');
    const smtpPassword = await getSettingValue('SMTP_PASSWORD', '');
    const smtpFromAddress = await getSettingValue('SMTP_FROM_ADDRESS', '');
    const smtpFromName = await getSettingValue('SMTP_FROM_NAME', 'AdPools Group');
    const smtpEncryption = await getSettingValue('SMTP_ENCRYPTION', 'tls');

    if (!smtpHost || !smtpUsername || !smtpPassword || !smtpFromAddress) {
      return NextResponse.json(
        { error: 'Email configuration not found. Please configure email settings in Settings > Notifications.' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpEncryption === 'ssl',
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Convert message to HTML if it's plain text
    const messageHtml = content.includes('<') && content.includes('>') 
      ? content 
      : content.replace(/\n/g, '<br>');
    
    // Generate email template with theme colors
    const { generateEmailTemplate, generatePlainText } = await import('@/lib/email-template');
    const htmlContent = await generateEmailTemplate(messageHtml);
    
    // Generate plain text version
    const plainText = generatePlainText(content);

    // Send email
    const mailOptions = {
      from: `"${smtpFromName}" <${smtpFromAddress}>`,
      to: to,
      subject: subject,
      text: plainText,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    // Save email to database
    await prisma.distributorLeadEmail.create({
      data: {
        distributorLeadId: leadId,
        to: to,
        subject: subject,
        content: content,
        type: type,
        status: 'SENT',
        sentBy: session.user.id,
        sentAt: new Date(),
        messageId: info.messageId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: info.messageId,
        status: 'SENT'
      }
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
