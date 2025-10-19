import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.db') && !file.name.endsWith('.sql')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a .db or .sql file' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Path to the database file
    const dbPath = join(process.cwd(), 'prisma', 'dev.db');

    // Write the uploaded file to the database location
    await writeFile(dbPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Database restored successfully'
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}

