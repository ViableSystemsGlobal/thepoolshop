import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('GET /api/drm/distributor-leads/[id] - Requested ID:', id);

    // Find the distributor lead by ID in database
    const lead = await prisma.distributorLead.findUnique({
      where: { id }
    });

    if (!lead) {
      console.log('Lead not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Distributor lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error('Error fetching distributor lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Handle both JSON and FormData requests
    let body: any = {};
    
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (file uploads)
      const formData = await request.formData();
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // For now, just store the file name - in production, you'd save the file
          body[key] = value.name;
        } else {
          body[key] = value;
        }
      }
    } else {
      // Handle JSON requests
      body = await request.json();
    }

    // Update the distributor lead in database
    const updatedLead = await prisma.distributorLead.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth || null,
        businessName: body.businessName,
        businessType: body.businessType,
        businessRegistrationNumber: body.businessRegistrationNumber || null,
        yearsInBusiness: body.yearsInBusiness ? parseInt(body.yearsInBusiness) : null,
        address: body.address || null,
        city: body.city,
        region: body.region,
        country: body.country || 'Ghana',
        postalCode: body.postalCode || null,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        territory: body.territory || null,
        expectedVolume: body.expectedVolume ? parseInt(body.expectedVolume) : null,
        experience: body.experience || null,
        investmentCapacity: body.investmentCapacity ? parseInt(body.investmentCapacity) : null,
        targetMarket: body.targetMarket || null,
        notes: body.notes || null,
        profileImage: body.profilePicture || body.profileImage || null,
        businessLicense: body.businessLicense || null,
        taxCertificate: body.taxCertificate || null,
        status: body.status || undefined
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedLead
    });

  } catch (error) {
    console.error('Error updating distributor lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the distributor lead from database
    const deletedLead = await prisma.distributorLead.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: deletedLead
    });

  } catch (error) {
    console.error('Error deleting distributor lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
