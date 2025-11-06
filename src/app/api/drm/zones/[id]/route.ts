import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const zone = await (prisma as any).zone.findUnique({
      where: { id: id },
      include: {
        distributors: {
          select: {
            id: true,
            businessName: true,
            city: true,
            region: true
          }
        },
        routes: {
          select: {
            id: true,
            name: true,
            status: true,
            scheduledDate: true
          }
        }
      }
    });

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: zone
    });

  } catch (error) {
    console.error('Error fetching zone:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Missing required field: name' 
      }, { status: 400 });
    }

    // Check if zone exists
    const existingZone = await (prisma as any).zone.findUnique({
      where: { id: params.id }
    });

    if (!existingZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Update zone
    const zone = await (prisma as any).zone.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        color: color || '#3B82F6',
        isActive: isActive ?? true
      },
      include: {
        distributors: {
          select: {
            id: true,
            businessName: true,
            city: true,
            region: true
          }
        },
        routes: {
          select: {
            id: true,
            name: true,
            status: true,
            scheduledDate: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Zone updated successfully',
      data: zone
    });

  } catch (error) {
    console.error('Error updating zone:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if zone exists and has dependencies
    const zone = await (prisma as any).zone.findUnique({
      where: { id: params.id },
      include: {
        distributors: true,
        routes: true
      }
    });

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Check for dependencies
    if (zone.distributors && zone.distributors.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete zone with assigned distributors. Please reassign them first.' 
      }, { status: 400 });
    }

    if (zone.routes && zone.routes.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete zone with active routes. Please complete or cancel them first.' 
      }, { status: 400 });
    }

    // Delete zone
    await (prisma as any).zone.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Zone deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting zone:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
