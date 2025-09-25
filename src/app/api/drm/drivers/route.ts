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

    const drivers = await prisma.driver.findMany({
      include: {
        routes: {
          select: {
            id: true,
            name: true,
            status: true,
            scheduledDate: true
          }
        },
        deliveries: {
          select: {
            id: true,
            status: true,
            scheduledAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: drivers
    });

  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      phone, 
      email, 
      licenseNumber, 
      vehicleType, 
      vehiclePlate, 
      capacity 
    } = body;

    // Validate required fields
    if (!name || !phone || !licenseNumber || !vehicleType || !vehiclePlate || !capacity) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, phone, licenseNumber, vehicleType, vehiclePlate, capacity' 
      }, { status: 400 });
    }

    // Check if license number already exists
    const existingDriver = await prisma.driver.findFirst({
      where: { licenseNumber }
    });

    if (existingDriver) {
      return NextResponse.json({ 
        error: 'A driver with this license number already exists' 
      }, { status: 400 });
    }

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        email: email || null,
        licenseNumber,
        vehicleType,
        vehiclePlate,
        capacity: parseInt(capacity),
        isActive: true
      },
      include: {
        routes: true,
        deliveries: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });

  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
