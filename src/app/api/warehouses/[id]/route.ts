import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json();
    const { name, code, address, city, country, isActive } = body;

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

    // Update the warehouse
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
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
