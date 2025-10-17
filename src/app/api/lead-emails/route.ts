import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCompanyName } from '@/lib/company-settings';
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

    // Verify the lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ownerId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Create the email record first
    const email = await (prisma as any).leadEmail.create({
      data: {
        leadId,
        to,
        subject,
        content,
        type,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentBy: session.user.id,
        status: 'PENDING',
        sentAt: null,
      },
      include: {
        sentByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email using configured SMTP settings
    let emailResult = null;
    try {
      // Get email settings
      const smtpHost = await getSettingValue('SMTP_HOST', '');
      const smtpPort = await getSettingValue('SMTP_PORT', '587');
      const smtpUsername = await getSettingValue('SMTP_USERNAME', '');
      const smtpPassword = await getSettingValue('SMTP_PASSWORD', '');
      const smtpFromAddress = await getSettingValue('SMTP_FROM_ADDRESS', '');
      const smtpFromName = await getSettingValue('SMTP_FROM_NAME', await getCompanyName());
      const smtpEncryption = await getSettingValue('SMTP_ENCRYPTION', 'tls');

      if (!smtpHost || !smtpUsername || !smtpPassword || !smtpFromAddress) {
        throw new Error('Email configuration not found. Please configure email settings in Settings > Notifications.');
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

      // Send email
      await transporter.sendMail({
        from: `"${smtpFromName}" <${smtpFromAddress}>`,
        to: to,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>'),
      });

      emailResult = { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      emailResult = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Update email record with sending result
    const updatedEmail = await (prisma as any).leadEmail.update({
      where: { id: email.id },
      data: {
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null,
      },
      include: {
        sentByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: updatedEmail,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error creating lead email:', error);
    return NextResponse.json(
      { error: 'Failed to create email' },
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

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Verify the lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ownerId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get emails for the lead
    const emails = await (prisma as any).leadEmail.findMany({
      where: {
        leadId,
      },
      include: {
        sentByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error fetching lead emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
