import { NextRequest } from 'next/server';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const relPath = (params.path || []).join('/');
    if (!relPath) {
      return new Response('Not Found', { status: 404 });
    }

    // Primary: persistent volume mount
    const volPath = join('/app/uploads', relPath);
    // Fallback: project public folder (useful for local/dev)
    const publicPath = join(process.cwd(), 'public', 'uploads', relPath);

    const filePath = existsSync(volPath) ? volPath : publicPath;

    if (!existsSync(filePath)) {
      return new Response('Not Found', { status: 404 });
    }

    const { size } = statSync(filePath);
    const stream = createReadStream(filePath);

    // Minimal content-type detection by extension
    const lower = filePath.toLowerCase();
    let contentType = 'application/octet-stream';
    if (lower.endsWith('.png')) contentType = 'image/png';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lower.endsWith('.gif')) contentType = 'image/gif';
    else if (lower.endsWith('.webp')) contentType = 'image/webp';
    else if (lower.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (lower.endsWith('.pdf')) contentType = 'application/pdf';

    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(size),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (_err) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

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
