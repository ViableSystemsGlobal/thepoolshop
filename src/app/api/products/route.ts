import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService, SystemNotificationTriggers } from "@/lib/notification-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBarcode, validateBarcode, detectBarcodeType } from "@/lib/barcode-utils";

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
        { name: { contains: search } },
        { sku: { contains: search } },
        { serviceCode: { contains: search } },
        { description: { contains: search } },
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
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      type = "PRODUCT",
      sku,
      serviceCode,
      name,
      description,
      categoryId,
      duration,
      unit,
      barcode: providedBarcode,
      barcodeType: providedBarcodeType,
      generateBarcode: shouldGenerateBarcode = true,
      supplierBarcode,
      supplierName,
      price,
      cost,
      costPrice,
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

    // Validate required fields based on type
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // For products, SKU is required; for services, serviceCode is required
    if (type === "PRODUCT" && !sku) {
      return NextResponse.json(
        { error: "SKU is required for products" },
        { status: 400 }
      );
    }
    
    if (type === "SERVICE" && !serviceCode) {
      return NextResponse.json(
        { error: "Service Code is required for services" },
        { status: 400 }
      );
    }

    // Check if SKU or Service Code already exists
    if (type === "PRODUCT" && sku) {
      const existingProduct = await prisma.product.findFirst({
        where: { sku },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 400 }
        );
      }
    }
    
    if (type === "SERVICE" && serviceCode) {
      const existingService = await prisma.product.findFirst({
        where: { serviceCode },
      });

      if (existingService) {
        return NextResponse.json(
          { error: "Service with this Service Code already exists" },
          { status: 400 }
        );
      }
    }

    // Handle barcode generation/validation
    let finalBarcode = providedBarcode?.trim() || null;
    let finalBarcodeType = providedBarcodeType || 'EAN13';

    if (!finalBarcode && shouldGenerateBarcode) {
      // Generate barcode from SKU or Service Code
      const codeForBarcode = type === "SERVICE" ? serviceCode : sku;
      finalBarcode = generateBarcode(codeForBarcode, finalBarcodeType as any);
      
      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 5) {
        const existingBarcode = await prisma.product.findUnique({
          where: { barcode: finalBarcode as string }
        });
        
        if (!existingBarcode) break;
        
        // Add timestamp to ensure uniqueness
        finalBarcode = generateBarcode(`${codeForBarcode}-${Date.now()}`, finalBarcodeType as any);
        attempts++;
      }
    }

    // Validate barcode if provided
    if (finalBarcode) {
      const detectedType = detectBarcodeType(finalBarcode);
      finalBarcodeType = providedBarcodeType || detectedType;
      
      if (!validateBarcode(finalBarcode, finalBarcodeType as any)) {
        return NextResponse.json(
          { error: 'Invalid barcode format' },
          { status: 400 }
        );
      }
      
      // Check for duplicates
      const duplicateBarcode = await prisma.product.findUnique({
        where: { barcode: finalBarcode }
      });
      
      if (duplicateBarcode) {
        return NextResponse.json(
          { error: 'Barcode already exists on another product' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        type,
        sku: type === "PRODUCT" ? sku : null,
        serviceCode: type === "SERVICE" ? serviceCode : null,
        name,
        description,
        categoryId,
        barcode: finalBarcode,
        barcodeType: finalBarcode ? finalBarcodeType : null,
        generateBarcode: shouldGenerateBarcode,
        price: price ? parseFloat(price) : 0,
        cost: cost ? parseFloat(cost) : 0,
        costPrice: costPrice ? parseFloat(costPrice) : (cost ? parseFloat(cost) : 0),
        originalPrice: originalPrice ? parseFloat(originalPrice) : (price ? parseFloat(price) : 0),
        originalCost: originalCost ? parseFloat(originalCost) : (cost ? parseFloat(cost) : 0),
        originalPriceCurrency: originalPriceCurrency || sellingCurrency || "USD",
        originalCostCurrency: originalCostCurrency || costCurrency || "USD",
        exchangeRateAtImport: exchangeRateAtImport ? parseFloat(exchangeRateAtImport) : null,
        baseCurrency: baseCurrency || sellingCurrency || "USD",
        uomBase,
        uomSell,
        duration: type === "SERVICE" ? duration : null,
        unit: type === "SERVICE" ? unit : null,
        attributes: attributes || {},
        images: images || null,
        active,
      },
      include: {
        category: true,
        additionalBarcodes: true,
      },
    });

    // After product creation, handle supplier barcode if provided
    if (supplierBarcode && supplierBarcode !== finalBarcode) {
      try {
        await prisma.productBarcode.create({
          data: {
            productId: product.id,
            barcode: supplierBarcode,
            barcodeType: detectBarcodeType(supplierBarcode),
            source: supplierName || 'Supplier',
            description: 'Supplier barcode',
            isPrimary: false,
            isActive: true
          }
        });
      } catch (error) {
        console.error('Error creating supplier barcode:', error);
        // Don't fail the entire request if supplier barcode fails
      }
    }

    // Get the default warehouse (Main Warehouse)
    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { code: 'MAIN' }
    });

    // Create initial stock item for the product
    const productCostPrice = costPrice ? parseFloat(costPrice) : (cost ? parseFloat(cost) : 0);
    await prisma.stockItem.create({
      data: {
        productId: product.id,
        quantity: 0,
        reserved: 0,
        available: 0,
        averageCost: cost ? parseFloat(cost) : 0,
        totalValue: 0 * productCostPrice, // Will be 0 initially, but uses costPrice for consistency
        reorderPoint: reorderPoint ? parseFloat(reorderPoint) : 0,
        warehouseId: defaultWarehouse?.id, // Assign to default warehouse
      },
    });

    // Send notification to inventory managers about new product
    if (session?.user) {
      const trigger = {
        type: 'SYSTEM_ALERT' as const,
        title: 'New Product Created',
        message: `Product "${product.name}" (SKU: ${product.sku}) has been created and added to inventory.`,
        channels: ['IN_APP' as const, 'EMAIL' as const],
        data: { productId: product.id, productName: product.name, sku: product.sku }
      };
      
      await NotificationService.sendToInventoryManagers(trigger);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
