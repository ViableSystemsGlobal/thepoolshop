import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('GET /api/drm/distributor-leads/[id] - Requested ID:', id);

    // Check for corrupted ID (filename instead of proper ID) and clean it up
    if (id.includes('.jpg') || id.includes('.png') || id.includes('midnight') || id.length > 50) {
      console.log('🚫 Detected corrupted ID (filename), cleaning up:', id.substring(0, 50) + '...');
      
        // Try to delete the corrupted entry
        try {
          await (prisma as any).distributorLead.delete({
            where: { id }
          });
        console.log('✅ Deleted corrupted entry');
      } catch (deleteError) {
        console.log('Entry already deleted or not found');
      }
      
      return NextResponse.json(
        { success: false, error: 'Corrupted lead entry removed. Please refresh the page.' },
        { status: 404 }
      );
    }

    // Find the distributor lead by ID in database with images
    const lead = await (prisma as any).distributorLead.findUnique({
          where: { id },
          include: {
            images: true,
            interestedProducts: {
              include: {
                product: true
              }
            }
          }
        });

    if (!lead) {
      console.log('Lead not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Distributor lead not found' },
        { status: 404 }
      );
    }

    // Clean up corrupted image entries for this lead
    if (lead.images && lead.images.length > 0) {
      const corruptedImages = lead.images.filter((image: any) => 
        image.filePath.includes('.jpg') && !image.filePath.startsWith('/uploads/') ||
        image.fileSize === 0 ||
        image.filePath.includes('midnight')
      );
      
      if (corruptedImages.length > 0) {
        console.log('🧹 Cleaning up', corruptedImages.length, 'corrupted images...');
        for (const corruptedImage of corruptedImages) {
          await (prisma as any).distributorLeadImage.delete({
            where: { id: corruptedImage.id }
          });
        }
        // Refetch the lead after cleanup
        const refreshedLead = await (prisma as any).distributorLead.findUnique({
          where: { id },
          include: {
            images: true,
            interestedProducts: {
              include: {
                product: true
              }
            }
          }
        });
        if (refreshedLead) {
          lead.images = refreshedLead.images;
          lead.interestedProducts = refreshedLead.interestedProducts;
        }
      }
    }

    console.log('📸 Lead data with images and products:', {
      id: lead.id,
      businessName: lead.businessName,
      imagesCount: lead.images?.length || 0,
      images: lead.images?.map((img: any) => ({
        id: img.id,
        imageType: img.imageType,
        filePath: img.filePath,
        originalName: img.originalName
      })) || [],
      interestedProductsCount: lead.interestedProducts?.length || 0,
      interestedProducts: lead.interestedProducts?.map((p: any) => ({
        id: p.id,
        productName: p.product?.name,
        productSku: p.product?.sku,
        interestLevel: p.interestLevel,
        quantity: p.quantity
      })) || [],
      legacyProfileImage: lead.profileImage
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
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
        } else if (key === 'interestedProducts') {
          // Parse JSON string for interested products
          try {
            body[key] = JSON.parse(value as string);
          } catch (error) {
            console.error('Error parsing interestedProducts:', error);
            body[key] = [];
          }
        } else {
          body[key] = value;
        }
      }
    } else {
      // Handle JSON requests
      body = await request.json();
    }

    // Handle interested products update
    if (body.interestedProducts && Array.isArray(body.interestedProducts)) {
      // Delete existing interested products
      await (prisma as any).distributorLeadProduct.deleteMany({
        where: { distributorLeadId: id }
      });

      // Create new interested products
      if (body.interestedProducts.length > 0) {
        await (prisma as any).distributorLeadProduct.createMany({
          data: body.interestedProducts.map((productId: string) => ({
            distributorLeadId: id,
            productId,
            quantity: 1,
            interestLevel: 'MEDIUM',
            addedBy: session.user.id
          }))
        });
      }
    }

    // Update the distributor lead in database
    const updatedLead = await (prisma as any).distributorLead.update({
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
            expectedVolume: body.salesVolume ? parseInt(body.salesVolume) : null,
        experience: body.experience || null,
        investmentCapacity: body.investmentCapacity || null,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the distributor lead from database
        const deletedLead = await (prisma as any).distributorLead.delete({
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
