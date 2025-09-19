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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const emailOnly = searchParams.get('email') === 'true';

    // Build where clause
    const whereClause = emailOnly ? 
      { email: { not: null } } : 
      { OR: [{ phone: { not: null } }, { email: { not: null } }] };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const contacts = await prisma.contact.findMany({
      where: {
        ...whereClause,
        ...(search && {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } }
          ]
        })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Also get leads with phone numbers or email addresses
    const leadsWhereClause = emailOnly ? 
      { email: { not: null } } : 
      { OR: [{ phone: { not: null } }, { email: { not: null } }] };

    const leads = await prisma.lead.findMany({
      where: {
        ...leadsWhereClause,
        ...(search && {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } }
          ]
        })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Transform contacts to have a name field
    const transformedContacts = contacts.map(contact => ({
      id: contact.id,
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown',
      phone: contact.phone,
      email: contact.email
    }));

    // Transform leads to have a name field
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown',
      phone: lead.phone,
      email: lead.email
    }));

    // Combine and deduplicate contacts
    const allContacts = [...transformedContacts, ...transformedLeads].reduce((acc, contact) => {
      const existing = acc.find(c => 
        (contact.email && c.email === contact.email) || 
        (contact.phone && c.phone === contact.phone)
      );
      if (!existing) {
        acc.push(contact);
      }
      return acc;
    }, [] as typeof transformedContacts);

    return NextResponse.json({
      contacts: allContacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
