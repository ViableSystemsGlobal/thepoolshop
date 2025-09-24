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

    // Fetch all images/documents for the distributor
    const documents = await (prisma as any).distributorImage.findMany({
      where: { distributorId },
      orderBy: { uploadedAt: 'desc' }
    });

    // Group documents by type
    const documentsByType = documents.reduce((acc: any, doc: any) => {
      const type = doc.imageType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(doc);
      return acc;
    }, {});

    // Get document type counts
    const typeCounts = Object.keys(documentsByType).reduce((acc: any, type) => {
      acc[type] = documentsByType[type].length;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        documents,
        documentsByType,
        typeCounts,
        totalCount: documents.length
      }
    });

  } catch (error) {
    console.error('Error fetching distributor documents:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const imageType = formData.get('imageType') as string;
    const description = formData.get('description') as string;

    if (!file || !imageType) {
      return NextResponse.json({ error: 'File and image type are required' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${distributorId}_${imageType}_${timestamp}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = `public/uploads/distributors/${distributorId}`;
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Save document record to database
    const document = await (prisma as any).distributorImage.create({
      data: {
        distributorId,
        fileName,
        originalName: file.name,
        filePath: `/uploads/distributors/${distributorId}/${fileName}`,
        fileType: file.type,
        fileSize: file.size,
        imageType,
        uploadedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
