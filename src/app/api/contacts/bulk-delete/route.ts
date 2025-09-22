import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
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
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Contact IDs are required' },
        { status: 400 }
      );
    }

    // Verify all contacts belong to user's accounts
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: ids },
        account: {
          ownerId: userId,
        },
      },
    });

    if (contacts.length !== ids.length) {
      return NextResponse.json(
        { error: 'Some contacts not found or access denied' },
        { status: 404 }
      );
    }

    // Delete contacts
    await prisma.contact.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // Log activity for each deleted contact
    for (const contact of contacts) {
      await prisma.activity.create({
        data: {
          entityType: 'Contact',
          entityId: contact.id,
          action: 'deleted',
          details: { contact: { firstName: contact.firstName, lastName: contact.lastName } },
          userId: userId,
        },
      });
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${contacts.length} contact(s)` 
    });
  } catch (error) {
    console.error('Error deleting contacts:', error);
    return NextResponse.json(
      { error: 'Failed to delete contacts' },
      { status: 500 }
    );
  }
}
