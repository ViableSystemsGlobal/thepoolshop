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

    const zones = await prisma.zone.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: zones
    });

  } catch (error) {
    console.error('Error fetching zones:', error);
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
    const { name, description, color, boundaries } = body;

    // Validate required fields
    if (!name || !boundaries) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, boundaries' 
      }, { status: 400 });
    }

    // Create zone
    const zone = await prisma.zone.create({
      data: {
        name,
        description: description || null,
        color: color || '#3B82F6',
        boundaries: boundaries,
        isActive: true
      },
      include: {
        distributors: true,
        routes: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Zone created successfully',
      data: zone
    });

  } catch (error) {
    console.error('Error creating zone:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
