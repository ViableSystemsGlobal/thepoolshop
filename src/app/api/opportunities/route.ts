import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');

    const where: any = {
      account: {
        ownerId: userId,
      },
    };

    if (stage) {
      where.stage = stage;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { account: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: { id: true, name: true, type: true, email: true },
        },
      },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      stage = 'NEW',
      value,
      probability = 0,
      closeDate,
      accountId,
    } = body;

    if (!name || !accountId) {
      return NextResponse.json(
        { error: 'Opportunity name and account are required' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        ownerId: userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        name,
        stage,
        value,
        probability,
        closeDate: closeDate ? new Date(closeDate) : null,
        accountId,
      },
      include: {
        account: {
          select: { id: true, name: true, type: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Opportunity',
        entityId: opportunity.id,
        action: 'created',
        details: { opportunity: { name, stage, value, accountId } },
        userId: userId,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
