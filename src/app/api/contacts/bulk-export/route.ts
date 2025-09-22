import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Contact IDs are required' },
        { status: 400 }
      );
    }

    // Get contacts that belong to user's accounts
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: ids },
        account: {
          ownerId: userId,
        },
      },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts found or access denied' },
        { status: 404 }
      );
    }

    // Prepare CSV data
    const csvData = [
      // Header row
      ['First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Account', 'Account Type', 'Created Date'],
      // Data rows
      ...contacts.map(contact => [
        contact.firstName,
        contact.lastName,
        contact.email || '',
        contact.phone || '',
        contact.position || '',
        contact.account.name,
        contact.account.type,
        new Date(contact.createdAt).toLocaleDateString(),
      ])
    ];

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `contacts-export-${timestamp}.csv`;

    return NextResponse.json({
      data: csvData,
      filename,
    });
  } catch (error) {
    console.error('Error exporting contacts:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 }
    );
  }
}
