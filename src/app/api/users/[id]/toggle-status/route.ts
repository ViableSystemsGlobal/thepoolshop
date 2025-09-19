import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/users/[id]/toggle-status - Toggle user active status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deactivating yourself
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle status
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: !(user as any).isActive } as any
    });

    // Log audit trail (temporarily disabled)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: (user as any).isActive ? 'user.deactivated' : 'user.activated',
    //     resource: 'User',
    //     resourceId: params.id,
    //     oldData: { isActive: (user as any).isActive },
    //     newData: { isActive: !(user as any).isActive }
    //   }
    // });

    return NextResponse.json({ 
      user: updatedUser,
      message: `User ${(user as any).isActive ? 'deactivated' : 'activated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: "Failed to toggle user status" },
      { status: 500 }
    );
  }
}
