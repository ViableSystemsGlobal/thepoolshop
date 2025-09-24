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

    const { id: distributorId } = await params;

    // Fetch distributor with all related data
    const distributor = await prisma.distributor.findUnique({
      where: {
        id: distributorId
      },
      include: {
        images: true,
        interestedProducts: {
          include: {
            product: true
          }
        },
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: distributor
    });

  } catch (error) {
    console.error('Error fetching distributor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
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

    // Update distributor
    const updatedDistributor = await prisma.distributor.update({
      where: {
        id: distributorId
      },
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
        notes: notes || null
      },
      include: {
        images: true,
        interestedProducts: {
          include: {
            product: true
          }
        },
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Update interested products if provided
    if (interestedProducts !== undefined) {
      // Delete existing products
      await prisma.distributorProduct.deleteMany({
        where: { distributorId }
      });

      // Add new products
      if (interestedProducts && interestedProducts.length > 0) {
        await Promise.all(
          interestedProducts.map((productId: string) =>
            prisma.distributorProduct.create({
              data: {
                distributorId,
                productId,
                interestLevel: 'MEDIUM',
                quantity: 1,
                addedBy: session.user.id
              }
            })
          )
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedDistributor
    });

  } catch (error) {
    console.error('Error updating distributor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;

    // Delete distributor and related data
    await (prisma as any).distributor.delete({
      where: {
        id: distributorId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting distributor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
