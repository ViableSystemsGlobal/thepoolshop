import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();
    const { name, code, address, city, country } = body;

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

    console.log('Creating warehouse in database...');
    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        address,
        city,
        country,
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
