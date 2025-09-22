import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simple in-memory storage for Google Maps config (replace with database later)
let googleMapsConfig = {
  apiKey: '',
  enabled: false,
  geocodingEnabled: true,
  placesEnabled: true,
  directionsEnabled: true,
  mapsEnabled: true,
  usageQuota: 1000,
  currentUsage: 0,
  lastUpdated: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      config: googleMapsConfig
    });

  } catch (error) {
    console.error('Error fetching Google Maps config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    // Update configuration
    googleMapsConfig = {
      ...googleMapsConfig,
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    console.log('Google Maps config updated:', googleMapsConfig);

    return NextResponse.json({
      success: true,
      message: 'Google Maps configuration updated successfully',
      config: googleMapsConfig
    });

  } catch (error) {
    console.error('Error updating Google Maps config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
