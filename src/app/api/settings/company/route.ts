import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get company settings
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: ['company_name', 'company_description', 'company_favicon']
        }
      }
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      companyName: settingsMap.company_name || 'AdPools Group',
      description: settingsMap.company_description || 'A practical, single-tenant system for sales and distribution management',
      favicon: settingsMap.company_favicon || ''
    });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const contentType = request.headers.get('content-type');
    console.log('🔍 Upload API - Content-Type:', contentType);
    
    let companyName, description, favicon;
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload (favicon)
    const formData = await request.formData();
    console.log('🔍 Upload API - Form data received');
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    console.log('🔍 Upload API - File:', file?.name, 'Type:', type);
      
      if (type === 'favicon' && file) {
        try {
          console.log('🔍 Upload API - Processing favicon file:', file.name);
          // Save favicon file
          const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'ico';
        const filename = `favicon_${timestamp}.${extension}`;
        const filepath = `/uploads/branding/${filename}`;
        
        // Save to persistent volume directory
        const publicDir = '/app/uploads/branding';
        console.log('🔍 Upload API - Saving to directory:', publicDir);
        console.log('🔍 Upload API - Filename:', filename);
        
        // Ensure directory exists
        if (!fs.existsSync(publicDir)) {
          console.log('🔍 Upload API - Creating directory:', publicDir);
          fs.mkdirSync(publicDir, { recursive: true });
        } else {
          console.log('🔍 Upload API - Directory already exists:', publicDir);
        }
        
        const fullPath = path.join(publicDir, filename);
        console.log('🔍 Upload API - Writing file to:', fullPath);
        fs.writeFileSync(fullPath, buffer);
        console.log('✅ Upload API - File written successfully');
        
        // Update favicon setting
        await prisma.systemSettings.upsert({
          where: { key: 'company_favicon' },
          update: { value: filepath },
          create: {
            key: 'company_favicon',
            value: filepath,
            description: 'Company favicon URL'
          }
        });
        
        return NextResponse.json({
          success: true,
          filePath: filepath
        });
        console.log('✅ Upload API - Database updated with favicon path:', filepath);
        } catch (error) {
          console.error('❌ Upload API - Error processing favicon:', error);
          throw error;
        }
      }
    } else {
      // Handle JSON data
      const body = await request.json();
      companyName = body.companyName;
      description = body.description;
      favicon = body.favicon;
    }

    // Upsert company settings
    console.log('Saving company settings:', { companyName, description, favicon });
    
    const updates = [
      prisma.systemSettings.upsert({
        where: { key: 'company_name' },
        update: { value: companyName },
        create: {
          key: 'company_name',
          value: companyName,
          type: 'string',
          category: 'company'
        }
      }),
      prisma.systemSettings.upsert({
        where: { key: 'company_description' },
        update: { value: description },
        create: {
          key: 'company_description',
          value: description,
          type: 'string',
          category: 'company'
        }
      })
    ];
    
    // Only update favicon if it's provided (not undefined)
    if (favicon !== undefined && favicon !== null) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'company_favicon' },
          update: { value: favicon || '' },
          create: {
            key: 'company_favicon',
            value: favicon || '',
            type: 'string',
            category: 'company'
          }
        })
      );
    }
    
    await Promise.all(updates);

    console.log(`✅ Company settings updated: ${companyName}`);

    return NextResponse.json({
      success: true,
      companyName,
      description,
      favicon
    });
  } catch (error) {
    console.error('Error saving company settings:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to save company settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}