import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = join(process.cwd(), 'uploads', ...path);
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const fileExtension = path[path.length - 1].split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
