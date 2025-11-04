import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ warehouses });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating warehouse...');
    
    // Check if request is FormData (for image upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    let name, code, address, city, country, image: File | null = null;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with potential image upload)
      const formData = await request.formData();
      name = formData.get('name') as string;
      code = formData.get('code') as string;
      address = formData.get('address') as string;
      city = formData.get('city') as string;
      country = formData.get('country') as string;
      image = formData.get('image') as File | null;
    } else {
      // Handle JSON (backward compatibility)
    const body = await request.json();
      ({ name, code, address, city, country } = body);
    }

    console.log('Warehouse data:', { name, code, address, city, country });

    // Validate required fields
    if (!name || !code) {
      console.log('Validation failed: Missing name or code');
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if warehouse with same code already exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { code },
    });

    if (existingWarehouse) {
      console.log(`Warehouse with code ${code} already exists:`, existingWarehouse);
      return NextResponse.json(
        { error: `Warehouse with code "${code}" already exists. Please use a different code.` },
        { status: 400 }
      );
    }

    // Handle image upload
    let imagePath: string | undefined = undefined;
    if (image && image.size > 0) {
      try {
        // Save to public/uploads/warehouses for development, or /app/uploads/warehouses for production
        const isProduction = process.env.NODE_ENV === 'production';
        const uploadsDir = isProduction 
          ? join('/app', 'uploads', 'warehouses')
          : join(process.cwd(), 'public', 'uploads', 'warehouses');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = image.name.split('.').pop();
        const uniqueId = randomUUID().substring(0, 8);
        const filename = `${code}-${timestamp}-${uniqueId}.${fileExtension}`;
        const filepath = join(uploadsDir, filename);

        // Convert File to Buffer and save
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Update image path (relative to uploads root)
        imagePath = `uploads/warehouses/${filename}`;
        console.log('Image uploaded successfully:', imagePath);
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    console.log('Creating warehouse in database...');
    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        address: address || null,
        city: city || null,
        country: country || null,
        image: imagePath,
        isActive: true, // Default to active
      },
    });

    console.log('✅ Warehouse created successfully:', warehouse);
    return NextResponse.json({ warehouse }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating warehouse:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: `Failed to create warehouse: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
