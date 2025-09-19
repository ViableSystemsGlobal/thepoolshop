import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
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
    const { name, phone, role, isActive } = body;

    // Map role name to enum value
    const roleMapping: { [key: string]: string } = {
      'Super Admin': 'ADMIN',
      'Administrator': 'ADMIN', 
      'Sales Manager': 'SALES_MANAGER',
      'Sales Rep': 'SALES_REP',
      'Staff': 'SALES_REP',
      'Inventory Manager': 'INVENTORY_MANAGER',
      'Finance Officer': 'FINANCE_OFFICER',
      'Executive Viewer': 'EXECUTIVE_VIEWER'
    };

    const mappedRole = role ? roleMapping[role] || role : undefined;

    // Get current user data for audit trail
    const currentUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(mappedRole !== undefined && { role: mappedRole }),
        ...(isActive !== undefined && { isActive })
      },
    });

    // Log audit trail (temporarily disabled)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: 'user.updated',
    //     resource: 'User',
    //     resourceId: params.id,
    //     oldData: currentUser,
    //     newData: updatedUser
    //   }
    // });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deleting yourself
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user data for audit trail
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    // Log audit trail (temporarily disabled)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: 'user.deleted',
    //     resource: 'User',
    //     resourceId: params.id,
    //     oldData: userToDelete
    //   }
    // });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
