import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Opportunities API: GET request received');
    const session = await getServerSession(authOptions);
    console.log('🔍 Opportunities API: Session exists:', !!session);
    console.log('🔍 Opportunities API: User exists:', !!session?.user);
    
    if (!session?.user) {
      console.log('❌ Opportunities API: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    console.log('🔍 Opportunities API: User ID:', userId);
    console.log('🔍 Opportunities API: User Role:', userRole);
    
    if (!userId) {
      console.log('❌ Opportunities API: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Super Admins and Admins can see all opportunities, others see only their own
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    
    // Build where clause for Opportunity table
    const where: any = {};
    
    // Only filter by owner if user is not Super Admin or Admin
    if (!isSuperAdmin) {
      where.ownerId = userId;
    }

    // Add status filter if provided
    if (status) {
      where.stage = status;
    }

    // Add search filter if provided (search in account and lead details)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { account: { name: { contains: search } } },
        { account: { email: { contains: search } } },
        { lead: { firstName: { contains: search } } },
        { lead: { lastName: { contains: search } } },
        { lead: { company: { contains: search } } },
      ];
    }

    console.log('🔍 Opportunities API: Where clause:', JSON.stringify(where, null, 2));
    
    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        quotations: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        invoices: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    console.log('🔍 Opportunities API: Found opportunities:', opportunities.length);

    // Get total count for pagination
    const total = await prisma.opportunity.count({ where });
    console.log('🔍 Opportunities API: Total count:', total);

    return NextResponse.json({
      opportunities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
    
  } catch (error) {
    console.error('Error in opportunities API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { name, accountId, stage, value, probability, closeDate, lostReason } = body;

    // Validate required fields
    if (!name || !accountId) {
      return NextResponse.json(
        { error: 'Name and account are required' },
        { status: 400 }
      );
    }

    // Verify account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Validate stage
    const validStages = ['QUOTE_SENT', 'QUOTE_REVIEWED', 'NEGOTIATION', 'WON', 'LOST'];
    const opportunityStage = stage || 'QUOTE_SENT';
    if (!validStages.includes(opportunityStage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
        { status: 400 }
      );
    }

    // Validate probability
    let oppProbability = probability !== undefined ? parseInt(probability) : 25;
    if (oppProbability < 0 || oppProbability > 100) {
      return NextResponse.json(
        { error: 'Probability must be between 0 and 100' },
        { status: 400 }
      );
    }

    // If stage is WON, automatically set probability to 100%
    if (opportunityStage === 'WON') {
      oppProbability = 100;
    }

    // Determine the deal value
    let dealValue = value !== undefined && value !== null ? parseFloat(value) : null;
    
    // If stage is WON but no value provided, try to get from account's invoices/quotations
    if (opportunityStage === 'WON' && (!dealValue || dealValue === 0)) {
      // Get the account's latest invoice or quotation
      const latestInvoice = await prisma.invoice.findFirst({
        where: { accountId },
        orderBy: { createdAt: 'desc' }
      });
      
      if (latestInvoice) {
        dealValue = latestInvoice.total;
        console.log(`✅ Setting deal value from latest invoice: ${dealValue}`);
      } else {
        const latestQuotation = await prisma.quotation.findFirst({
          where: { accountId },
          orderBy: { createdAt: 'desc' }
        });
        
        if (latestQuotation) {
          dealValue = latestQuotation.total;
          console.log(`✅ Setting deal value from latest quotation: ${dealValue}`);
        }
      }
    }

    // Create the opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        name,
        accountId,
        stage: opportunityStage,
        value: dealValue,
        probability: oppProbability,
        closeDate: closeDate ? new Date(closeDate) : null,
        lostReason: lostReason || null,
        ownerId: userId,
        ...(opportunityStage === 'WON' && { wonDate: new Date() })
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
        }
      }
    });

    console.log('✅ Created opportunity from account:', opportunity.id);

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}