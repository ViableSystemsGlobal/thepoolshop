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

    const routes = await prisma.route.findMany({
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            vehiclePlate: true
          }
        },
        deliveries: {
          include: {
            distributor: {
              select: {
                id: true,
                businessName: true,
                city: true,
                region: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: routes
    });

  } catch (error) {
    console.error('Error fetching routes:', error);
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
      zoneId, 
      driverId, 
      waypoints, 
      totalDistance, 
      estimatedDuration, 
      scheduledDate 
    } = body;

    // Validate required fields
    if (!name || !zoneId || !scheduledDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, zoneId, scheduledDate' 
      }, { status: 400 });
    }

    // Verify zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId }
    });

    if (!zone) {
      return NextResponse.json({ 
        error: 'Zone not found' 
      }, { status: 404 });
    }

    // Verify driver exists (if provided)
    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      });

      if (!driver) {
        return NextResponse.json({ 
          error: 'Driver not found' 
        }, { status: 404 });
      }
    }

    // Create route
    const route = await prisma.route.create({
      data: {
        name,
        zoneId,
        driverId: driverId || null,
        waypoints: waypoints || [],
        totalDistance: totalDistance || 0,
        estimatedDuration: estimatedDuration || 0,
        scheduledDate: new Date(scheduledDate),
        status: 'PLANNED'
      },
      include: {
        zone: true,
        driver: true,
        deliveries: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Route created successfully',
      data: route
    });

  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
