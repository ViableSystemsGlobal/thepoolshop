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

    // Get user's role assignments
    const userRoleAssignments = await prisma.userRoleAssignment.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        role: {
          include: {
            roleAbilities: {
              include: {
                ability: true
              }
            }
          }
        }
      }
    });

    // Extract all abilities from all assigned roles
    const abilities: string[] = [];
    userRoleAssignments.forEach(assignment => {
      assignment.role.roleAbilities.forEach(roleAbility => {
        if (!abilities.includes(roleAbility.ability.name)) {
          abilities.push(roleAbility.ability.name);
        }
      });
    });

    return NextResponse.json({
      success: true,
      abilities
    });

  } catch (error) {
    console.error('Error fetching user abilities:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
