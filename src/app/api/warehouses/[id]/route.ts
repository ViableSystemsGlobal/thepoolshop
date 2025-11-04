import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// DELETE /api/warehouses/[id] - Delete a warehouse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        stockItems: true,
        fromMovements: true,
        toMovements: true,
        currentMovements: true,
      }
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    // Check if warehouse has any stock items or movements
    if (warehouse.stockItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete warehouse with existing stock items. Please move or delete stock items first." },
        { status: 400 }
      );
    }

    if (warehouse.fromMovements.length > 0 || warehouse.toMovements.length > 0 || warehouse.currentMovements.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete warehouse with existing stock movements. Please delete movements first." },
        { status: 400 }
      );
    }

    // Delete the warehouse
    await prisma.warehouse.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}

// GET /api/warehouses/[id] - Get a specific warehouse
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        stockItems: {
          include: {
            product: true,
          }
        },
        _count: {
          select: {
            stockItems: true,
            fromMovements: true,
            toMovements: true,
            currentMovements: true,
          }
        }
      }
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ warehouse });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
      { status: 500 }
    );
  }
}

// PUT /api/warehouses/[id] - Update a warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if request is FormData (for image upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    let name, code, address, city, country, isActive, image;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with potential image upload)
      const formData = await request.formData();
      name = formData.get('name') as string;
      code = formData.get('code') as string;
      address = formData.get('address') as string;
      city = formData.get('city') as string;
      country = formData.get('country') as string;
      isActive = formData.get('isActive') === 'true';
      image = formData.get('image') as File | null;
    } else {
      // Handle JSON (backward compatibility)
      const body = await request.json();
      ({ name, code, address, city, country, isActive } = body);
    }

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it conflicts with another warehouse
    if (code && code !== existingWarehouse.code) {
      const codeConflict = await prisma.warehouse.findUnique({
        where: { code },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: "Warehouse with this code already exists" },
          { status: 409 }
        );
      }
    }

    // Handle image upload
    let imagePath = existingWarehouse.image;
    if (image && image.size > 0) {
      try {
        // Save to public/uploads/warehouses for development, or /app/uploads/warehouses for production
        const isProduction = process.env.NODE_ENV === 'production';
        const uploadsDir = isProduction 
          ? join('/app', 'uploads', 'warehouses')
          : join(process.cwd(), 'public', 'uploads', 'warehouses');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = image.name.split('.').pop();
        const filename = `${id}-${timestamp}.${fileExtension}`;
        const filepath = join(uploadsDir, filename);

        // Convert File to Buffer and save
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Update image path (relative to uploads root)
        imagePath = `uploads/warehouses/${filename}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Update the warehouse
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(imagePath !== undefined && { image: imagePath }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedWarehouse);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}
