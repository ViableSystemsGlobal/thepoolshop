import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all banners (public endpoint for frontend, admin endpoint for management)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // If requesting active banners only (public), return them
    if (activeOnly) {
      const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 3, // Maximum 3 banners
      });
      return NextResponse.json({ banners });
    }

    // Admin access - return all banners
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, image, link, linkText, order, isActive } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Get the highest order number
    const maxOrder = await prisma.banner.aggregate({
      _max: { order: true },
    });
    const newOrder = order !== undefined ? order : (maxOrder._max.order || 0) + 1;

    const banner = await prisma.banner.create({
      data: {
        title: title || null,
        image,
        link: link || null,
        linkText: linkText || null,
        order: newOrder,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

