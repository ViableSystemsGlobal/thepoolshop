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
    console.log('🔍 Opportunities API: User ID:', userId);
    
    if (!userId) {
      console.log('❌ Opportunities API: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for Opportunity table
    const where: any = {
      ownerId: userId,
    };

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

    // NOTE: Opportunities should be created automatically when a quote is created from a lead
    // Direct opportunity creation is not supported in the new workflow
    return NextResponse.json(
      { error: 'Opportunities are created automatically from leads via quote creation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}