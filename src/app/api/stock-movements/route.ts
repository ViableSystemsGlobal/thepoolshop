import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stock-movements - Get all stock movements with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uomBase: true,
          }
        },
        stockItem: {
          select: {
            id: true,
            quantity: true,
            available: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.stockMovement.count({ where });

    return NextResponse.json({
      movements,
      total,
      hasMore: offset + movements.length < total,
    });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}

// POST /api/stock-movements - Create a new stock movement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      type,
      quantity,
      reference,
      reason,
      notes,
      userId,
    } = body;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID, type, and quantity are required" },
        { status: 400 }
      );
    }

    // Get or create stock item
    let stockItem = await prisma.stockItem.findUnique({
      where: { productId },
    });

    if (!stockItem) {
      stockItem = await prisma.stockItem.create({
        data: {
          productId,
          quantity: 0,
          reserved: 0,
          available: 0,
        },
      });
    }

    // Create the stock movement
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        stockItemId: stockItem.id,
        type,
        quantity,
        reference,
        reason,
        notes,
        userId,
      },
    });

    // Update stock quantities
    const newQuantity = stockItem.quantity + quantity;
    const newAvailable = Math.max(0, newQuantity - stockItem.reserved);

    await prisma.stockItem.update({
      where: { id: stockItem.id },
      data: {
        quantity: newQuantity,
        available: newAvailable,
      },
    });

    // Return the movement with product details
    const movementWithDetails = await prisma.stockMovement.findUnique({
      where: { id: movement.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uomBase: true,
          }
        },
        stockItem: {
          select: {
            id: true,
            quantity: true,
            available: true,
          }
        }
      },
    });

    return NextResponse.json(movementWithDetails, { status: 201 });
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json(
      { error: "Failed to create stock movement" },
      { status: 500 }
    );
  }
}
