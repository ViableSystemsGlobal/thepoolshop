import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get distributors with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Default to 100 for dropdown lists
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    // Get distributors with pagination
    const [distributors, totalCount] = await Promise.all([
      prisma.distributor.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          businessName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          region: true,
          country: true,
          creditLimit: true,
          currentCreditUsed: true,
          creditStatus: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { businessName: 'asc' },
        skip: offset,
        take: limit
      }),
      prisma.distributor.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      distributors,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching distributors:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch distributors',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Create a new distributor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      businessName,
      businessType,
      email,
      phone,
      address,
      city,
      region,
      country = 'Ghana',
      creditLimit = 0,
      creditStatus = 'ACTIVE',
      status = 'ACTIVE'
    } = body;

    // Validate required fields
    if (!businessName || !firstName || !lastName || !email || !phone || !businessType || !city || !region) {
      return NextResponse.json({ 
        error: 'Business name, first name, last name, email, phone, business type, city, and region are required' 
      }, { status: 400 });
    }

    // Create the distributor
    const distributor = await prisma.distributor.create({
      data: {
        firstName,
        lastName,
        businessName,
        businessType,
        email,
        phone,
        address: address || null,
        city,
        region,
        country,
        creditLimit: creditLimit || 0,
        currentCreditUsed: 0,
        creditStatus: creditStatus || 'ACTIVE',
        status: status || 'ACTIVE',
        approvedBy: session.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        region: true,
        country: true,
        creditLimit: true,
        currentCreditUsed: true,
        creditStatus: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor created successfully',
      distributor
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating distributor:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create distributor',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

