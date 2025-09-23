import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Extract form data
    const distributorLeadData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      businessName: formData.get('businessName') as string,
      businessType: formData.get('businessType') as string,
      businessRegistrationNumber: formData.get('businessRegistrationNumber') as string,
      yearsInBusiness: formData.get('yearsInBusiness') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      region: formData.get('region') as string,
      country: formData.get('country') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      experience: formData.get('experience') as string,
      investmentCapacity: formData.get('investmentCapacity') as string,
      targetMarket: formData.get('targetMarket') as string,
      territory: formData.get('territory') as string,
      expectedVolume: formData.get('expectedVolume') as string,
      notes: formData.get('notes') as string,
      submittedBy: session.user.id,
      status: 'PENDING',
      createdAt: new Date(),
    };

    // Handle file uploads like the working products system
    const imagesToCreate: any[] = [];

    // Handle profile picture upload
    const profilePicture = formData.get('profilePicture') as File;
    if (profilePicture && profilePicture.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'uploads', 'distributor-leads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = profilePicture.name.split('.').pop();
        const filename = `profile_${timestamp}-${profilePicture.name}`;
        const filepath = join(uploadsDir, filename);

        // Save file
        const bytes = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        imagesToCreate.push({
          fileName: filename,
          originalName: profilePicture.name,
          filePath: `/uploads/distributor-leads/${filename}`, // Web-accessible path
          fileType: profilePicture.type,
          fileSize: profilePicture.size,
          imageType: 'PROFILE_PICTURE'
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    // Create new distributor lead
    // Create distributor lead in database with images
    const distributorLead = await prisma.distributorLead.create({
      data: {
        firstName: distributorLeadData.firstName,
        lastName: distributorLeadData.lastName,
        email: distributorLeadData.email,
        phone: distributorLeadData.phone,
        dateOfBirth: distributorLeadData.dateOfBirth || null,
        businessName: distributorLeadData.businessName,
        businessType: distributorLeadData.businessType,
        businessRegistrationNumber: distributorLeadData.businessRegistrationNumber || null,
        yearsInBusiness: distributorLeadData.yearsInBusiness ? parseInt(distributorLeadData.yearsInBusiness) : null,
        address: distributorLeadData.address || null,
        city: distributorLeadData.city,
        region: distributorLeadData.region,
        country: distributorLeadData.country || 'Ghana',
        postalCode: distributorLeadData.postalCode || null,
        latitude: distributorLeadData.latitude ? parseFloat(distributorLeadData.latitude) : null,
        longitude: distributorLeadData.longitude ? parseFloat(distributorLeadData.longitude) : null,
        territory: distributorLeadData.territory || null,
        expectedVolume: distributorLeadData.salesVolume ? parseInt(distributorLeadData.salesVolume) : null,
        experience: distributorLeadData.experience || null,
        investmentCapacity: distributorLeadData.investmentCapacity || null,
        targetMarket: distributorLeadData.targetMarket || null,
        notes: distributorLeadData.notes || null,
        submittedBy: session.user.id,
        status: 'PENDING',
        images: {
          create: imagesToCreate
        },
        interestedProducts: {
          create: (distributorLeadData.interestedProducts || []).map((productId: string) => ({
            productId,
            quantity: 1,
            interestLevel: 'MEDIUM',
            addedBy: session.user.id
          }))
        }
      },
      include: {
        images: true
      }
    });

    console.log('New distributor lead application:', distributorLead);

    const response = NextResponse.json({
      success: true,
      message: 'Distributor lead application submitted successfully',
      data: distributorLead
    });
    
    console.log('Response being sent:', response);
    return response;

  } catch (error) {
    console.error('Error creating distributor lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return distributor leads from database with images
    const leads = await prisma.distributorLead.findMany({
      include: {
        images: true,
        interestedProducts: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: leads
    });

  } catch (error) {
    console.error('Error fetching distributor leads:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Update the distributor lead using Prisma
    const updatedLead = await prisma.distributorLead.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor lead updated successfully',
      data: updatedLead
    });

  } catch (error) {
    console.error('Error updating distributor lead:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Delete the distributor lead using Prisma
    const deletedLead = await prisma.distributorLead.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor lead deleted successfully',
      data: deletedLead
    });

  } catch (error) {
    console.error('Error deleting distributor lead:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
