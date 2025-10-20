import { NextRequest } from 'next/server';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const relPath = (params.path || []).join('/');
    console.log('🔍 Uploads API - Requested path:', relPath);
    
    if (!relPath) {
      console.log('❌ No path provided');
      return new Response('Not Found', { status: 404 });
    }

    // Primary: persistent volume mount
    const volPath = join('/app/uploads', relPath);
    // Fallback: project public folder (useful for local/dev)
    const publicPath = join(process.cwd(), 'public', 'uploads', relPath);

    console.log('🔍 Checking volume path:', volPath, 'exists:', existsSync(volPath));
    console.log('🔍 Checking public path:', publicPath, 'exists:', existsSync(publicPath));

    const filePath = existsSync(volPath) ? volPath : publicPath;
    console.log('🔍 Using file path:', filePath);

    if (!existsSync(filePath)) {
      console.log('❌ File not found at:', filePath);
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

 
