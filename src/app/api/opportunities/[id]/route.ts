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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const opportunity = await prisma.lead.findFirst({
      where: {
        id,
        ownerId: userId,
        status: {
          in: ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST'] as any
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    // Check if opportunity exists and belongs to user
    const existingOpportunity = await prisma.lead.findFirst({
      where: {
        id,
        ownerId: userId,
        status: {
          in: ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST'] as any
        },
      },
    });

    if (!existingOpportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      leadType,
      company,
      subject,
      source,
      status,
      assignedTo,
      interestedProducts,
      followUpDate,
      notes,
      dealValue,
      probability,
      expectedCloseDate,
    } = body;

    const opportunity = await prisma.lead.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        leadType,
        company,
        subject,
        source,
        status: status || 'QUOTE_SENT' as any, // Ensure it remains an opportunity
        assignedTo: assignedTo ? JSON.stringify(assignedTo) : null,
        interestedProducts: interestedProducts ? JSON.stringify(interestedProducts) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes,
        dealValue,
        probability,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      } as any,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Check if opportunity exists and belongs to user
    const existingOpportunity = await prisma.lead.findFirst({
      where: {
        id,
        ownerId: userId,
        status: {
          in: ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST'] as any
        },
      },
    });

    if (!existingOpportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Opportunity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
