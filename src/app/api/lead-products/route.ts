import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, productId, quantity, notes, interestLevel } = body;

    if (!leadId || !productId) {
      return NextResponse.json(
        { error: 'Lead ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Verify the lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ownerId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Verify the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is already added to this lead
    const existingLeadProduct = await (prisma as any).leadProduct.findFirst({
      where: {
        leadId,
        productId,
      },
    });

    if (existingLeadProduct) {
      return NextResponse.json(
        { error: 'This product is already added to the lead' },
        { status: 400 }
      );
    }

    // Create LeadProduct record
    const leadProduct = await (prisma as any).leadProduct.create({
      data: {
        leadId,
        productId,
        quantity: quantity || 1,
        notes: notes || null,
        interestLevel: interestLevel || 'MEDIUM',
        addedBy: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            description: true,
          },
        },
        addedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(leadProduct);
  } catch (error) {
    console.error('Error adding lead product:', error);
    return NextResponse.json(
      { error: 'Failed to add product interest' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Verify the lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ownerId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get products for the lead
    const products = await (prisma as any).leadProduct.findMany({
      where: {
        leadId,
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            description: true,
          },
        },
        addedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching lead products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
