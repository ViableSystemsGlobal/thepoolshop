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
      notes: formData.get('notes') as string,
      submittedBy: session.user.id,
      status: 'PENDING',
      createdAt: new Date(),
    };

    // Handle file uploads
    const uploadDir = join(process.cwd(), 'uploads', 'distributor-leads');
    
    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePaths: { [key: string]: string } = {};

    // Handle profile picture
    const profilePicture = formData.get('profilePicture') as File;
    if (profilePicture && profilePicture.size > 0) {
      const bytes = await profilePicture.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `profile_${Date.now()}_${profilePicture.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      filePaths.profilePicture = `/uploads/distributor-leads/${fileName}`;
    }

    // Handle business license
    const businessLicense = formData.get('businessLicense') as File;
    if (businessLicense && businessLicense.size > 0) {
      const bytes = await businessLicense.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `license_${Date.now()}_${businessLicense.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      filePaths.businessLicense = `/uploads/distributor-leads/${fileName}`;
    }

    // Handle tax certificate
    const taxCertificate = formData.get('taxCertificate') as File;
    if (taxCertificate && taxCertificate.size > 0) {
      const bytes = await taxCertificate.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `tax_${Date.now()}_${taxCertificate.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      filePaths.taxCertificate = `/uploads/distributor-leads/${fileName}`;
    }

    // Create new distributor lead
    // Create distributor lead in database
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
        expectedVolume: distributorLeadData.expectedVolume ? parseInt(distributorLeadData.expectedVolume) : null,
        experience: distributorLeadData.experience || null,
        investmentCapacity: distributorLeadData.investmentCapacity ? parseInt(distributorLeadData.investmentCapacity) : null,
        targetMarket: distributorLeadData.targetMarket || null,
        notes: distributorLeadData.notes || null,
        profileImage: filePaths.profilePicture || null,
        businessLicense: filePaths.businessLicense || null,
        taxCertificate: filePaths.taxCertificate || null,
        submittedBy: session.user.id,
        status: 'PENDING'
      }
    });

    console.log('New distributor lead application:', distributorLead);

    return NextResponse.json({
      success: true,
      message: 'Distributor lead application submitted successfully',
      data: distributorLead
    });

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

    // Return distributor leads from database
    // For now, return all leads. You can add filtering by role/permissions later
    const leads = await prisma.distributorLead.findMany({
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
