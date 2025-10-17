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
    
    // Fetch from Opportunity table
    const opportunity = await prisma.opportunity.findUnique({
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
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true
          }
        },
        lead: {
          include: {
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
        invoices: {
          include: {
            account: true,
            lines: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
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
      name,
      stage,
      value,
      probability,
      closeDate,
      lostReason
    } = body;

    // Validate stage
    const validStages = ['QUOTE_SENT', 'QUOTE_REVIEWED', 'NEGOTIATION', 'WON', 'LOST'];
    if (stage && !validStages.includes(stage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
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

    // Validate value
    if (value !== null && value !== undefined) {
      if (value < 0) {
        return NextResponse.json(
          { error: 'Value must be positive' },
          { status: 400 }
        );
      }
    }

    // Update the opportunity
    const opportunity = await prisma.opportunity.update({
      where: {
        id: params.id
      },
      data: {
        ...(name && { name }),
        ...(stage && { stage }),
        ...(value !== undefined && { value }),
        ...(probability !== undefined && { probability }),
        ...(closeDate && { closeDate: new Date(closeDate) }),
        ...(lostReason && { lostReason }),
        ...(stage === 'WON' && { wonDate: new Date() })
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        account: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true
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
    const opportunity = await prisma.opportunity.findUnique({
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
        where: { opportunityId: params.id },
        data: { opportunityId: null }
      });
      console.log(`🔗 Unlinked ${opportunity.quotations.length} quotations from opportunity`);
    }

    if (opportunity.invoices && opportunity.invoices.length > 0) {
      await prisma.invoice.updateMany({
        where: { opportunityId: params.id },
        data: { opportunityId: null }
      });
      console.log(`🔗 Unlinked ${opportunity.invoices.length} invoices from opportunity`);
    }
    
    // Now delete the opportunity
    await prisma.opportunity.delete({
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