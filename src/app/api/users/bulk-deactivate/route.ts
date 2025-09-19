import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/users/bulk-deactivate - Deactivate multiple users
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No user IDs provided" },
        { status: 400 }
      );
    }

    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isActive: false,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'users.bulk_deactivated',
        resource: 'User',
        resourceId: ids.join(','),
        newData: { isActive: false, count: result.count }
      }
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error("Error bulk deactivating users:", error);
    return NextResponse.json(
      { error: "Failed to deactivate users" },
      { status: 500 }
    );
  }
}
