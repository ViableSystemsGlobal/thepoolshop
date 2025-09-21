import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, type, title, description, scheduledAt, duration, status } = body;

    if (!leadId || !type || !title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Lead ID, type, title, and scheduled time are required' },
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

    // Create LeadMeeting record
    const leadMeeting = await (prisma as any).leadMeeting.create({
      data: {
        leadId,
        type,
        title,
        description: description || null,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        status: status || 'SCHEDULED',
        createdBy: session.user.id,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(leadMeeting);
  } catch (error) {
    console.error('Error adding lead meeting:', error);
    return NextResponse.json(
      { error: 'Failed to schedule meeting' },
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

    // Get meetings for the lead
    const meetings = await (prisma as any).leadMeeting.findMany({
      where: {
        leadId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Error fetching lead meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
