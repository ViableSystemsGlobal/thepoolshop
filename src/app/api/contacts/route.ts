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
    const search = searchParams.get('search');
    const accountId = searchParams.get('accountId');

    // Super Admins and Admins can see all contacts, others see only contacts from their accounts
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    
    const where: any = {};
    
    // Only filter by account owner if user is not Super Admin or Admin
    if (!isSuperAdmin) {
      where.account = {
        ownerId: userId,
      };
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { position: { contains: search } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
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
      firstName,
      lastName,
      email,
      phone,
      position,
      accountId,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify the account belongs to the user (or user is Super Admin)
    const userRole = (session.user as any).role;
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    
    const accountWhere: any = { id: accountId };
    if (!isSuperAdmin) {
      accountWhere.ownerId = userId;
    }
    
    const account = await prisma.account.findFirst({
      where: accountWhere,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        accountId,
      },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Contact',
        entityId: contact.id,
        action: 'created',
        details: { contact: { firstName, lastName, email, position } },
        userId: userId,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}