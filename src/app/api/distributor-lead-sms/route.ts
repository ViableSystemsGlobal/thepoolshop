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

    // Verify distributor lead exists and user has access
    const lead = await prisma.distributorLead.findFirst({
      where: {
        id: leadId,
        submittedBy: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Distributor lead not found' }, { status: 404 });
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
    const smsResponse = await fetch('https://deywuro.com/api/sms', {
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

    const responseText = await smsResponse.text();
    const result = JSON.parse(responseText);

    if (result.code === 0) {
      // SMS sent successfully, save to database
      await prisma.distributorLeadSMS.create({
        data: {
          distributorLeadId: leadId,
          to: to,
          message: message,
          type: type || 'OUTBOUND',
          status: 'SENT',
          sentBy: session.user.id,
          sentAt: new Date(),
        }
      });

      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        data: {
          id: result.id,
          status: 'SENT'
        }
      });
    } else {
      // SMS failed
      await prisma.distributorLeadSMS.create({
        data: {
          distributorLeadId: leadId,
          to: to,
          message: message,
          type: type || 'OUTBOUND',
          status: 'FAILED',
          sentBy: session.user.id,
          sentAt: new Date(),
          errorMessage: result.message || 'Unknown error'
        }
      });

      return NextResponse.json({
        error: result.message || 'Failed to send SMS'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
