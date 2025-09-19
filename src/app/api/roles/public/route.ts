import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/roles/public - Get all roles without authentication
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        roleAbilities: {
          include: {
            ability: true
          }
        },
        _count: {
          select: {
            userRoles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform the data to include memberCount
    const rolesWithMemberCount = roles.map(role => ({
      ...role,
      memberCount: role._count.userRoles
    }));

    return NextResponse.json({ roles: rolesWithMemberCount });
  } catch (error) {
    console.error('Error fetching public roles:', error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}