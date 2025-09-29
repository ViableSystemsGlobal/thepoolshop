import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ 
        error: 'Latitude and longitude are required' 
      }, { status: 400 });
    }

    // Get Google Maps API key from config file
    const configPath = join(process.cwd(), 'data', 'google-maps-config.json');
    let apiKey = '';
    
    try {
      if (existsSync(configPath)) {
        const fileContent = await readFile(configPath, 'utf-8');
        const config = JSON.parse(fileContent);
        apiKey = config.apiKey || '';
      }
    } catch (fileError) {
      console.log('No Google Maps config file found');
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Google Maps API key not configured' 
      }, { status: 400 });
    }

    // Call Google Maps Reverse Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to get address from coordinates' 
      }, { status: 500 });
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json({ 
        error: 'No address found for these coordinates' 
      }, { status: 404 });
    }

    // Return the formatted address
    const result = data.results[0];
    return NextResponse.json({
      success: true,
      address: result.formatted_address,
      components: result.address_components
    });

  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
