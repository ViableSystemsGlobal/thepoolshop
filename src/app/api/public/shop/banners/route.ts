import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint for fetching active banners (max 3)
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 3, // Maximum 3 banners
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ banners: [] });
  }
}

