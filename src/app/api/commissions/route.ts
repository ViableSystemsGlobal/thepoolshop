import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const commissionType = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const where: any = {};
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (commissionType) {
      where.commissionType = commissionType;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        agent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        invoice: {
          select: {
            id: true,
            number: true,
            total: true,
            account: {
              select: { id: true, name: true }
            }
          }
        },
        quotation: {
          select: {
            id: true,
            number: true,
            total: true,
            account: {
              select: { id: true, name: true }
            }
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            distributor: {
              select: { id: true, businessName: true }
            }
          }
        },
        opportunity: {
          select: {
            id: true,
            name: true,
            value: true,
            account: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const {
      agentId,
      commissionType,
      calculationType,
      status = 'PENDING',
      invoiceId,
      quotationId,
      orderId,
      opportunityId,
      baseAmount,
      commissionRate,
      commissionAmount,
      notes
    } = body;

    // Validation
    if (!agentId || !commissionType || !calculationType || !baseAmount || !commissionRate || !commissionAmount) {
      return NextResponse.json(
        { error: 'Agent ID, commission type, calculation type, base amount, rate, and commission amount are required' },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Create commission
    const commission = await prisma.commission.create({
      data: {
        agentId,
        commissionType,
        calculationType,
        status,
        invoiceId: invoiceId || null,
        quotationId: quotationId || null,
        orderId: orderId || null,
        opportunityId: opportunityId || null,
        baseAmount,
        commissionRate,
        commissionAmount,
        notes: notes || null
      },
      include: {
        agent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Commission created: ${commission.id} for agent ${agent.agentCode}`);

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}

