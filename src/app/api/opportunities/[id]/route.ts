import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🔍 Opportunity API: Session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('❌ Opportunity API: Unauthorized - no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    
    // Opportunities are Leads with specific statuses
    const opportunity = await prisma.lead.findUnique({
      where: {
        id: params.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        quotations: {
          include: {
            billingContact: true,
            shippingContact: true,
            account: true,
            lines: {
              include: {
                product: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        comments: true,
        files: true,
        emails: true,
        sms: true,
        products: {
          include: {
            product: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        meetings: true
      }
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Verify it's actually an opportunity (has opportunity status)
    const opportunityStatuses = ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST'];
    if (!opportunityStatuses.includes(opportunity.status)) {
      return NextResponse.json({ error: 'Not an opportunity' }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      subject,
      source,
      status,
      dealValue,
      probability,
      expectedCloseDate,
      notes
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate probability
    if (probability !== null && probability !== undefined) {
      if (probability < 0 || probability > 100) {
        return NextResponse.json(
          { error: 'Probability must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Validate deal value
    if (dealValue !== null && dealValue !== undefined) {
      if (dealValue < 0) {
        return NextResponse.json(
          { error: 'Deal value must be positive' },
          { status: 400 }
        );
      }
    }

    // Opportunities are Leads with specific statuses
    const opportunity = await prisma.lead.update({
      where: {
        id: params.id
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        subject,
        source,
        status,
        dealValue,
        probability,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    
    // Check if opportunity has quotations or invoices
    const opportunity = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        quotations: true,
        invoices: true
      }
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // If there are quotations or invoices, unlink them first
    if (opportunity.quotations && opportunity.quotations.length > 0) {
      await prisma.quotation.updateMany({
        where: { leadId: params.id },
        data: { leadId: null }
      });
      console.log(`🔗 Unlinked ${opportunity.quotations.length} quotations from opportunity`);
    }

    if (opportunity.invoices && opportunity.invoices.length > 0) {
      await prisma.invoice.updateMany({
        where: { leadId: params.id },
        data: { leadId: null }
      });
      console.log(`🔗 Unlinked ${opportunity.invoices.length} invoices from opportunity`);
    }
    
    // Now delete the opportunity (Lead)
    // This will cascade delete: tasks, comments, files, emails, SMS, products, meetings
    await prisma.lead.delete({
      where: {
        id: params.id
      }
    });

    console.log('✅ Opportunity deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}