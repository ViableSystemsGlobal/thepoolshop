import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/price-lists - List all price lists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (channel && channel !== "all") {
      where.channel = channel;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const priceLists = await prisma.priceList.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(priceLists);
  } catch (error) {
    console.error("Error fetching price lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch price lists" },
      { status: 500 }
    );
  }
}

// POST /api/price-lists - Create a new price list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      channel,
      currency = "USD",
      effectiveFrom,
      effectiveTo,
    } = body;

    // Validate required fields
    if (!name || !channel) {
      return NextResponse.json(
        { error: "Name and channel are required" },
        { status: 400 }
      );
    }

    // Check if price list name already exists for the same channel
    const existingPriceList = await prisma.priceList.findFirst({
      where: {
        name,
        channel,
      },
    });

    if (existingPriceList) {
      return NextResponse.json(
        { error: "Price list with this name already exists for this channel" },
        { status: 400 }
      );
    }

    const priceList = await prisma.priceList.create({
      data: {
        name,
        channel,
        currency,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json(priceList, { status: 201 });
  } catch (error) {
    console.error("Error creating price list:", error);
    return NextResponse.json(
      { error: "Failed to create price list" },
      { status: 500 }
    );
  }
}
