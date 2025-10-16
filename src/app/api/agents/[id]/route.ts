import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        commissions: {
          include: {
            invoice: {
              select: { id: true, number: true, total: true }
            },
            quotation: {
              select: { id: true, number: true, total: true }
            },
            order: {
              select: { id: true, orderNumber: true, totalAmount: true }
            },
            opportunity: {
              select: { id: true, name: true, value: true }
            }
          },
          orderBy: { earnedDate: 'desc' },
          take: 50
        },
        commissionRules: {
          where: { isActive: true },
          orderBy: { priority: 'desc' }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Calculate commission stats
    const commissionStats = await prisma.commission.aggregate({
      where: { agentId: params.id },
      _sum: {
        commissionAmount: true
      },
      _count: true
    });

    const statusBreakdown = await prisma.commission.groupBy({
      by: ['status'],
      where: { agentId: params.id },
      _sum: {
        commissionAmount: true
      },
      _count: true
    });

    return NextResponse.json({
      ...agent,
      stats: {
        totalCommissions: commissionStats._sum.commissionAmount || 0,
        commissionCount: commissionStats._count || 0,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const {
      status,
      hireDate,
      terminationDate,
      territory,
      team,
      managerId,
      commissionRate,
      targetMonthly,
      targetQuarterly,
      targetAnnual,
      notes
    } = body;

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update agent
    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(hireDate && { hireDate: new Date(hireDate) }),
        ...(terminationDate !== undefined && { 
          terminationDate: terminationDate ? new Date(terminationDate) : null 
        }),
        ...(territory !== undefined && { territory: territory || null }),
        ...(team !== undefined && { team: team || null }),
        ...(managerId !== undefined && { managerId: managerId || null }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(targetMonthly !== undefined && { targetMonthly: targetMonthly || null }),
        ...(targetQuarterly !== undefined && { targetQuarterly: targetQuarterly || null }),
        ...(targetAnnual !== undefined && { targetAnnual: targetAnnual || null }),
        ...(notes !== undefined && { notes: notes || null })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Agent updated: ${agent.agentCode}`);

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            commissions: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent has commissions
    if (agent._count.commissions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete agent with existing commissions. Set status to TERMINATED instead.' },
        { status: 400 }
      );
    }

    // Delete agent
    await prisma.agent.delete({
      where: { id: params.id }
    });

    console.log(`✅ Agent deleted: ${agent.agentCode}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}

