import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Default Google Maps config
const defaultConfig = {
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

// File path for storing config
const configPath = join(process.cwd(), 'data', 'google-maps-config.json');

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get config from file
    let config = defaultConfig;
    try {
      if (existsSync(configPath)) {
        const fileContent = await readFile(configPath, 'utf-8');
        const savedConfig = JSON.parse(fileContent);
        config = { ...defaultConfig, ...savedConfig };
      }
    } catch (fileError) {
      console.log('No existing config file found, using defaults');
    }

    return NextResponse.json({
      success: true,
      config
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
    const updatedConfig = {
      ...defaultConfig,
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Save to file
    await writeFile(configPath, JSON.stringify(updatedConfig, null, 2));

    console.log('Google Maps config updated:', updatedConfig);

    return NextResponse.json({
      success: true,
      message: 'Google Maps configuration updated successfully',
      config: updatedConfig
    });

  } catch (error) {
    console.error('Error updating Google Maps config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
