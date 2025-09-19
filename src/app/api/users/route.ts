import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
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
        }
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
    if (!session?.user || session.user.role !== 'ADMIN') {
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
      'Executive Viewer': 'EXECUTIVE_VIEWER',
      'Client': 'SALES_REP' // Default clients to SALES_REP for now
    };

    const mappedRole = roleMapping[role || ''] || 'SALES_REP';
    console.log('Original role:', role);
    console.log('Mapped role:', mappedRole);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: password || null,
        role: mappedRole,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

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
