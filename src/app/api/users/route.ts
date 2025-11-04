import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService, SystemNotificationTriggers } from "@/lib/notification-service";
import bcrypt from "bcryptjs";

// GET /api/users - Get all users with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true
        } as any
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, phone, password, role, sendInvitation = true } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || password.trim().length < 6) {
      return NextResponse.json(
        { error: "Password is required and must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

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

    const mappedRole = roleMapping[role || ''] || 'SALES_REP';
    console.log('Original role:', role);
    console.log('Mapped role:', mappedRole);

    // Hash password (required, validated above)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed successfully');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: mappedRole as any,
        isActive: true
      } as any,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      } as any
    });

    // Send notification to the new user
    if (sendInvitation && user.name) {
      const trigger = SystemNotificationTriggers.userInvited(
        user.name,
        session.user.name || session.user.email || 'System Administrator'
      );
      await NotificationService.sendToUser(user.id, trigger);
    }

    // Notify admins about new user creation
    const adminTrigger = {
      type: 'SYSTEM_ALERT' as const,
      title: 'New User Created',
      message: `A new user "${user.name || user.email}" has been created with role "${role || 'Sales Rep'}"`,
      channels: ['IN_APP' as const, 'EMAIL' as const],
      data: { 
        newUserId: user.id, 
        newUserName: user.name, 
        newUserEmail: user.email,
        newUserRole: role
      }
    };
    await NotificationService.sendToAdmins(adminTrigger);

    // TODO: Send invitation email if requested
    if (sendInvitation) {
      // await sendUserInvitation(user.email, user.name);
    }

    // Log audit trail (temporarily disabled due to foreign key constraint)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: 'user.created',
    //     resource: 'User',
    //     resourceId: user.id,
    //     newData: user
    //   }
    // });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
