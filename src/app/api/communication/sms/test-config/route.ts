import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check SMS configuration
    const smsUsername = await prisma.systemSettings.findUnique({
      where: { key: 'SMS_USERNAME' },
      select: { value: true }
    });

    const smsPassword = await prisma.systemSettings.findUnique({
      where: { key: 'SMS_PASSWORD' },
      select: { value: true }
    });

    const smsSenderId = await prisma.systemSettings.findUnique({
      where: { key: 'SMS_SENDER_ID' },
      select: { value: true }
    });

    const smsBaseUrl = await prisma.systemSettings.findUnique({
      where: { key: 'SMS_BASE_URL' },
      select: { value: true }
    });

    return NextResponse.json({
      config: {
        username: smsUsername?.value ? '***' : null,
        password: smsPassword?.value ? '***' : null,
        senderId: smsSenderId?.value || 'AdPools',
        baseUrl: smsBaseUrl?.value || 'https://deywuro.com/api'
      },
      isConfigured: !!(smsUsername?.value && smsPassword?.value)
    });

  } catch (error) {
    console.error('Error checking SMS config:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
