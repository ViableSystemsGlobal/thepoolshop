import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { leadId, to, message, type } = await request.json();

    if (!leadId || !to || !message) {
      return NextResponse.json({ 
        error: 'Lead ID, phone number, and message are required' 
      }, { status: 400 });
    }

    // Verify lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ownerId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get SMS settings
    const smsUsername = await getSettingValue('SMS_USERNAME', '');
    const smsPassword = await getSettingValue('SMS_PASSWORD', '');
    const smsSenderId = await getSettingValue('SMS_SENDER_ID', 'AdPools');

    if (!smsUsername || !smsPassword) {
      return NextResponse.json({ 
        error: 'SMS configuration not found. Please configure SMS settings in Settings > Notifications.' 
      }, { status: 400 });
    }

    // Send SMS using Deywuro API
    let smsResult = null;
    try {
      const response = await fetch('https://deywuro.com/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: smsUsername,
          password: smsPassword,
          destination: to,
          source: smsSenderId,
          message: message
        })
      });

      const responseText = await response.text();
      smsResult = JSON.parse(responseText);
      
      if (smsResult.code !== 0) {
        throw new Error(smsResult.message || 'SMS sending failed');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return NextResponse.json({ 
        error: `Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, { status: 500 });
    }

    // Create LeadSMS record
    const leadSMS = await (prisma as any).leadSMS.create({
      data: {
        leadId,
        to,
        message,
        type: type || 'OUTBOUND',
        status: smsResult?.code === 0 ? 'SENT' : 'FAILED',
        sentBy: session.user.id,
        sentAt: new Date(),
        externalId: smsResult?.id || null,
        errorMessage: smsResult?.code !== 0 ? smsResult?.message : null,
      },
    });

    return NextResponse.json({
      success: true,
      sms: leadSMS,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    console.error('Error in lead SMS API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
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
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Verify lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ownerId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get SMS history for the lead
    const smsHistory = await (prisma as any).leadSMS.findMany({
      where: { leadId },
      orderBy: { sentAt: 'desc' },
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

    return NextResponse.json({ sms: smsHistory });

  } catch (error) {
    console.error('Error fetching lead SMS:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
