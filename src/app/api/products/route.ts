import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Check if pagination is requested
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = { name: category };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stockItems: {
          include: {
            warehouse: true
          }
        },
      },
      ...(isPaginated && {
        skip: (page - 1) * limit,
        take: limit,
      }),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.product.count({ where });

    // Get total counts for metrics (without pagination filters)
    const totalActive = await prisma.product.count({ 
      where: { 
        ...where, 
        active: true 
      } 
    });

    // For stock-related metrics, we need to check stock items
    const totalLowStock = await prisma.product.count({
      where: {
        ...where,
        stockItems: {
          some: {
            available: {
              lte: 10 // Assuming 10 is the low stock threshold
            }
          }
        }
      }
    });

    const totalOutOfStock = await prisma.product.count({
      where: {
        ...where,
        stockItems: {
          some: {
            available: 0
          }
        }
      }
    });

    const response: any = {
      products,
      metrics: {
        totalActive,
        totalLowStock,
        totalOutOfStock,
      },
    };

    // Only include pagination data if pagination was requested
    if (isPaginated) {
      response.pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      description,
      categoryId,
      price,
      cost,
      costCurrency,
      sellingCurrency,
      exchangeRateMode,
      customExchangeRate,
      originalPrice,
      originalCost,
      originalPriceCurrency,
      originalCostCurrency,
      exchangeRateAtImport,
      baseCurrency,
      uomBase,
      uomSell,
      reorderPoint,
      attributes,
      images,
      active = true,
    } = body;

    // Validate required fields
    if (!sku || !name || !categoryId) {
      return NextResponse.json(
        { error: "SKU, name, and category are required" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        categoryId,
        price: price ? parseFloat(price) : 0,
        cost: cost ? parseFloat(cost) : 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : (price ? parseFloat(price) : 0),
        originalCost: originalCost ? parseFloat(originalCost) : (cost ? parseFloat(cost) : 0),
        originalPriceCurrency: originalPriceCurrency || sellingCurrency || "USD",
        originalCostCurrency: originalCostCurrency || costCurrency || "USD",
        exchangeRateAtImport: exchangeRateAtImport ? parseFloat(exchangeRateAtImport) : null,
        baseCurrency: baseCurrency || sellingCurrency || "USD",
        uomBase,
        uomSell,
        attributes: attributes || {},
        images: images || null,
        active,
      },
      include: {
        category: true,
      },
    });

    // Get the default warehouse (Main Warehouse)
    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { code: 'MAIN' }
    });

    // Create initial stock item for the product
    await prisma.stockItem.create({
      data: {
        productId: product.id,
        quantity: 0,
        reserved: 0,
        available: 0,
        averageCost: cost ? parseFloat(cost) : 0,
        totalValue: 0,
        reorderPoint: reorderPoint ? parseFloat(reorderPoint) : 0,
        warehouseId: defaultWarehouse?.id, // Assign to default warehouse
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
