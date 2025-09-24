import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;

    // Fetch SMS messages
    const smsMessages = await (prisma as any).distributorSMS.findMany({
      where: { distributorId },
      orderBy: { sentAt: 'desc' },
      take: 50 // Limit to last 50 messages
    });

    // Fetch Email messages
    const emailMessages = await (prisma as any).distributorEmail.findMany({
      where: { distributorId },
      orderBy: { sentAt: 'desc' },
      take: 50 // Limit to last 50 messages
    });

    // Combine and sort all communications by date
    const allCommunications = [
      ...smsMessages.map((sms: any) => ({
        id: sms.id,
        type: 'SMS',
        to: sms.to,
        content: sms.message,
        subject: null,
        status: sms.status,
        sentAt: sms.sentAt,
        sentBy: sms.sentBy,
        errorMessage: sms.errorMessage
      })),
      ...emailMessages.map((email: any) => ({
        id: email.id,
        type: 'EMAIL',
        to: email.to,
        content: email.content,
        subject: email.subject,
        status: email.status,
        sentAt: email.sentAt,
        sentBy: email.sentBy,
        errorMessage: email.errorMessage
      }))
    ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        communications: allCommunications,
        smsCount: smsMessages.length,
        emailCount: emailMessages.length,
        totalCount: allCommunications.length
      }
    });

  } catch (error) {
    console.error('Error fetching distributor communications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
