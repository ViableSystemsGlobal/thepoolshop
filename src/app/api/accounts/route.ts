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
    const userRole = (session.user as any).role;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Super Admins and Admins can see all accounts, others see only their own
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    
    const where: any = {};
    
    // Only filter by owner if user is not Super Admin or Admin
    if (!isSuperAdmin) {
      where.ownerId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const accounts = await prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        contacts: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        opportunities: {
          select: { id: true, name: true, stage: true, value: true, closeDate: true },
        },
        quotations: {
          select: { id: true, number: true, status: true, total: true, createdAt: true },
        },
        proformas: {
          select: { id: true, number: true, status: true, total: true, createdAt: true },
        },
        _count: {
          select: { contacts: true, opportunities: true, quotations: true, proformas: true },
        },
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
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
      type = 'INDIVIDUAL',
      email,
      phone,
      website,
      notes,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        email,
        phone,
        website,
        notes,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        contacts: true,
        opportunities: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Account',
        entityId: account.id,
        action: 'created',
        details: { account: { name, type, email } },
        userId: userId,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
