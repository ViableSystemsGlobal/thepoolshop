import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Test the API key with a simple geocoding request
    const testAddress = 'Accra, Ghana';
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${apiKey}`;
    
    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'API key is valid and working correctly',
          testResult: {
            address: testAddress,
            coordinates: data.results[0].geometry.location,
            formattedAddress: data.results[0].formatted_address
          }
        });
      } else if (data.status === 'REQUEST_DENIED') {
        return NextResponse.json({
          success: false,
          error: 'API key is invalid or restricted. Please check your key and API restrictions.'
        }, { status: 400 });
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        return NextResponse.json({
          success: false,
          error: 'API key has exceeded its quota. Please check your usage limits.'
        }, { status: 400 });
      } else {
        return NextResponse.json({
          success: false,
          error: `API test failed: ${data.status} - ${data.error_message || 'Unknown error'}`
        }, { status: 400 });
      }
    } catch (fetchError) {
      console.error('Error testing Google Maps API:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Google Maps API. Please check your internet connection.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
