import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      zoneId,
      driverId,
      scheduledDateTime,
      startingPoint,
      distributorCoordinates,
      optimizeRoute,
      notes
    } = body;

    // Validate required fields
    if (!name || !zoneId || !driverId || !scheduledDateTime || !startingPoint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!distributorCoordinates || distributorCoordinates.length === 0) {
      return NextResponse.json(
        { error: 'No distributor coordinates provided' },
        { status: 400 }
      );
    }

    // Verify zone exists
    const zone = await (prisma as any).zone.findUnique({
      where: { id: zoneId }
    });

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    // Verify driver exists
    const driver = await (prisma as any).driver.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Generate optimized waypoints using Google Maps Directions API
    let optimizedWaypoints = distributorCoordinates;
    let totalDistance = 0;
    let estimatedDuration = 0;
    
    if (optimizeRoute && distributorCoordinates.length > 1) {
      try {
        // Use Google Maps Directions API to optimize route
        const waypoints = distributorCoordinates
          .map((coord: any) => `${coord.latitude},${coord.longitude}`)
          .join('|');

        // For now, we'll use the coordinates as-is
        // In a full implementation, you would call Google Maps Directions API here
        // to get the optimized route order
        optimizedWaypoints = distributorCoordinates;
      } catch (error) {
        console.error('Error optimizing route:', error);
        // Fall back to original order if optimization fails
        optimizedWaypoints = distributorCoordinates;
      }
    }

    // Calculate estimated distance and duration
    if (distributorCoordinates.length > 0) {
      // Simple estimation: assume average 2km between stops and 30 minutes per stop
      totalDistance = distributorCoordinates.length * 2; // km
      estimatedDuration = distributorCoordinates.length * 30; // minutes
      console.log(`Calculated distance: ${totalDistance}km, duration: ${estimatedDuration}min for ${distributorCoordinates.length} stops`);
    }

    // Create the route
    console.log(`Creating route with distance: ${totalDistance}, duration: ${estimatedDuration}`);
    const route = await (prisma as any).route.create({
      data: {
        name,
        zoneId,
        driverId,
        waypoints: optimizedWaypoints,
        totalDistance: totalDistance,
        estimatedDuration: estimatedDuration,
        status: 'PLANNED',
        scheduledDate: new Date(scheduledDateTime)
      },
      include: {
        zone: true,
        driver: true
      }
    });

    // Create delivery records for each distributor
    const deliveries = await Promise.all(
      distributorCoordinates.map(async (coord: any, index: number) => {
        return (prisma as any).delivery.create({
          data: {
            routeId: route.id,
            distributorId: coord.id,
            status: 'SCHEDULED',
            scheduledAt: new Date(scheduledDateTime),
            notes: `Delivery to ${coord.name}`
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        ...route,
        deliveries
      }
    });

  } catch (error) {
    console.error('Error generating route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
