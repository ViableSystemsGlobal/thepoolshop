import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/users/[id]/change-password - Change user password
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: newPassword } as any
    });

    // Log audit trail (temporarily disabled)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: 'user.password_changed',
    //     resource: 'User',
    //     resourceId: params.id,
    //     newData: { passwordChanged: true }
    //   }
    // });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
