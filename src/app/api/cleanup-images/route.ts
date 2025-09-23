import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting image cleanup...');
    
    // Delete all corrupted images
    const deletedImages = await prisma.distributorLeadImage.deleteMany({
      where: {
        OR: [
          { fileSize: 0 },
          { filePath: { contains: 'midnight' } },
          { filePath: { not: { startsWith: '/uploads/' } } }
        ]
      }
    });
    
    console.log('✅ Deleted', deletedImages.count, 'corrupted images');
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedImages.count} corrupted images`,
      deletedCount: deletedImages.count
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
