import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        opportunities: {
          orderBy: { createdAt: 'desc' },
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
          include: {
            lines: {
              include: {
                product: {
                  select: { id: true, name: true, sku: true },
                },
              },
            },
          },
        },
        proformas: {
          orderBy: { createdAt: 'desc' },
          include: {
            lines: {
              include: {
                product: {
                  select: { id: true, name: true, sku: true },
                },
              },
            },
          },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: {
            lines: {
              include: {
                product: {
                  select: { id: true, name: true, sku: true },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { receivedAt: 'desc' },
          select: {
            id: true,
            number: true,
            amount: true,
            method: true,
            reference: true,
            receivedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      type,
      email,
      phone,
      website,
      notes,
    } = body;

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: params.id,
        ownerId: userId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = await prisma.account.update({
      where: { id: params.id },
      data: {
        name,
        type,
        email,
        phone,
        website,
        notes,
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
        action: 'updated',
        details: { changes: body },
        userId: userId,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: params.id,
        ownerId: userId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    await prisma.account.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Account',
        entityId: params.id,
        action: 'deleted',
        details: { account: existingAccount },
        userId: userId,
      },
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
