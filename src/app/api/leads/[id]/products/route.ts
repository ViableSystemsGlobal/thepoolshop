import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/leads/[id]/products - Get all products for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    console.log('🔍 Lead Products API: Fetching products for lead:', id);
    console.log('🔍 Lead Products API: Database URL:', process.env.DATABASE_URL);

    // Check if lead exists first
    const lead = await prisma.lead.findUnique({
      where: { id }
    });
    console.log('🔍 Lead Products API: Lead exists:', !!lead, lead?.firstName, lead?.lastName);

    // Get products from both interestedProducts JSON field and LeadProduct table
    let products = [];
    
    // First, check interestedProducts JSON field
    if (lead?.interestedProducts) {
      try {
        const interestedProducts = JSON.parse(lead.interestedProducts);
        console.log('🔍 Lead Products API: Parsed interestedProducts:', interestedProducts);
        
        // Get full product details for each interested product
        const productIds = interestedProducts.map((ip: any) => ip.id);
        const fullProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds }
          },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            cost: true,
            description: true,
          }
        });
        
        // Map interested products with full product details
        const jsonProducts = interestedProducts.map((ip: any) => ({
          id: ip.id,
          productId: ip.id,
          quantity: ip.quantity || 1,
          interestLevel: ip.interestLevel || 'MEDIUM',
          product: fullProducts.find(p => p.id === ip.id)
        })).filter(item => item.product); // Only include products that exist
        
        products = [...products, ...jsonProducts];
        console.log('🔍 Lead Products API: Mapped JSON products:', jsonProducts);
      } catch (error) {
        console.error('🔍 Lead Products API: Error parsing interestedProducts:', error);
      }
    }
    
    // Second, check LeadProduct table
    try {
      console.log('🔍 Lead Products API: Checking LeadProduct table for leadId:', id);
      const leadProducts = await prisma.leadProduct.findMany({
        where: { leadId: id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              cost: true,
              description: true,
            }
          }
        }
      });
      
      console.log('🔍 Lead Products API: Found leadProducts:', leadProducts.length, leadProducts);
      
      const tableProducts = leadProducts.map(lp => ({
        id: lp.id,
        productId: lp.productId,
        quantity: lp.quantity,
        interestLevel: lp.interestLevel,
        notes: lp.notes,
        product: lp.product
      })).filter(item => item.product); // Only include products that exist
      
      products = [...products, ...tableProducts];
      console.log('🔍 Lead Products API: Mapped table products:', tableProducts);
    } catch (error) {
      console.error('🔍 Lead Products API: Error fetching LeadProduct records:', error);
    }

    console.log('🔍 Lead Products API: Final products:', products.length, products);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching lead products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead products' },
      { status: 500 }
    );
  }
}

