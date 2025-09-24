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

    // Get all distributors with related data
    const distributors = await prisma.distributor.findMany({
      include: {
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        },
        images: {
          select: {
            id: true,
            imageType: true,
            filePath: true,
            originalName: true
          }
        },
        interestedProducts: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: {
        approvedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: distributors
    });

  } catch (error) {
    console.error('Error fetching distributors:', error);
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
    const {
      firstName,
      lastName,
      dateOfBirth,
      businessName,
      businessType,
      businessRegistrationNumber,
      yearsInBusiness,
      email,
      phone,
      address,
      city,
      region,
      country,
      postalCode,
      latitude,
      longitude,
      territory,
      expectedVolume,
      experience,
      investmentCapacity,
      targetMarket,
      notes,
      interestedProducts
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !businessName || !email || !phone) {
      return NextResponse.json({ 
        error: 'Missing required fields: firstName, lastName, businessName, email, phone' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingDistributor = await prisma.distributor.findUnique({
      where: { email }
    });

    if (existingDistributor) {
      return NextResponse.json({ 
        error: 'A distributor with this email already exists' 
      }, { status: 400 });
    }

    // Create distributor
    const distributor = await prisma.distributor.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || null,
        businessName,
        businessType,
        businessRegistrationNumber: businessRegistrationNumber || null,
        yearsInBusiness: yearsInBusiness || null,
        email,
        phone,
        address: address || null,
        city,
        region,
        country: country || 'Ghana',
        postalCode: postalCode || null,
        latitude: latitude || null,
        longitude: longitude || null,
        territory: territory || null,
        expectedVolume: expectedVolume || null,
        experience: experience || null,
        investmentCapacity: investmentCapacity || null,
        targetMarket: targetMarket || null,
        notes: notes || null,
        status: 'ACTIVE',
        approvedAt: new Date(),
        approvedBy: session.user.id
      }
    });

    // Add interested products if provided
    if (interestedProducts && interestedProducts.length > 0) {
      await Promise.all(
        interestedProducts.map((productId: string) =>
          prisma.distributorProduct.create({
            data: {
              distributorId: distributor.id,
              productId,
              interestLevel: 'MEDIUM',
              quantity: 1,
              addedBy: session.user.id
            }
          })
        )
      );
    }

    // Fetch the created distributor with related data
    const createdDistributor = await prisma.distributor.findUnique({
      where: { id: distributor.id },
      include: {
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        },
        images: {
          select: {
            id: true,
            imageType: true,
            filePath: true,
            originalName: true
          }
        },
        interestedProducts: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor created successfully',
      data: createdDistributor
    });

  } catch (error) {
    console.error('Error creating distributor:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}