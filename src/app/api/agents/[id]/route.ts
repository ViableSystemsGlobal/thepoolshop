import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;

    const agent = await prisma.agent.findUnique({
      where: { id },
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
            agentCode: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
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

    // Calculate commission statistics
    const commissionStats = await prisma.commission.aggregate({
      where: { agentId: agent.id },
      _sum: {
        commissionAmount: true
      },
      _count: true
    });

    const pendingCommissions = await prisma.commission.aggregate({
      where: { 
        agentId: agent.id,
        status: 'PENDING'
      },
      _sum: {
        commissionAmount: true
      }
    });

    const paidCommissions = await prisma.commission.aggregate({
      where: { 
        agentId: agent.id,
        status: 'PAID'
      },
      _sum: {
        commissionAmount: true
      }
    });

    const agentWithStats = {
      ...agent,
      totalCommissions: commissionStats._sum.commissionAmount || 0,
      commissionCount: commissionStats._count || 0,
      pendingCommissions: pendingCommissions._sum.commissionAmount || 0,
      paidCommissions: paidCommissions._sum.commissionAmount || 0
    };

    return NextResponse.json({ agent: agentWithStats });
  } catch (error) {
    console.error('❌ Error fetching agent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch agent',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    const body = await request.json();
    const {
      status,
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
      where: { id }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update agent
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        status: status || existingAgent.status,
        territory: territory !== undefined ? territory : existingAgent.territory,
        team: team !== undefined ? team : existingAgent.team,
        managerId: managerId !== undefined ? managerId : existingAgent.managerId,
        commissionRate: commissionRate !== undefined ? commissionRate : existingAgent.commissionRate,
        targetMonthly: targetMonthly !== undefined ? targetMonthly : existingAgent.targetMonthly,
        targetQuarterly: targetQuarterly !== undefined ? targetQuarterly : existingAgent.targetQuarterly,
        targetAnnual: targetAnnual !== undefined ? targetAnnual : existingAgent.targetAnnual,
        notes: notes !== undefined ? notes : existingAgent.notes
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
            agentCode: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Agent updated: ${updatedAgent.agentCode}`);

    return NextResponse.json({ agent: updatedAgent });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Delete agent (this will cascade delete related records)
    await prisma.agent.delete({
      where: { id }
    });

    console.log(`✅ Agent deleted: ${existingAgent.agentCode}`);

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}