import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Get email campaigns with pagination
    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          messages: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.emailCampaign.count({ where })
    ]);

    // Calculate actual sent/failed counts from messages
    const campaignsWithCounts = campaigns.map(campaign => ({
      ...campaign,
      actualSent: campaign.messages.filter(m => m.status === 'SENT' || m.status === 'DELIVERED').length,
      actualFailed: campaign.messages.filter(m => m.status === 'FAILED').length
    }));

    return NextResponse.json({
      campaigns: campaignsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json(
      { error: "Failed to fetch email campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, subject, message, recipients, scheduledAt } = body;

    if (!name || !subject || !message || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: "Name, subject, message, and recipients are required" },
        { status: 400 }
      );
    }

    // Create email campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        description,
        subject,
        message,
        recipients: JSON.stringify(recipients),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        userId: session.user.id,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json(
      { error: "Failed to create email campaign" },
      { status: 500 }
    );
  }
}
