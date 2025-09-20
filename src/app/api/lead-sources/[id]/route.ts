import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/lead-sources/[id] - Update a lead source
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isActive } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Source name is required" },
        { status: 400 }
      );
    }

    // Check if source exists
    const existingSource = await prisma.systemSettings.findUnique({
      where: { id: params.id }
    });

    if (!existingSource) {
      return NextResponse.json(
        { error: "Lead source not found" },
        { status: 404 }
      );
    }

    // Check if another source with the same name exists
    const duplicateSource = await prisma.systemSettings.findFirst({
      where: {
        key: {
          startsWith: 'lead_source_'
        },
        value: name.trim(),
        id: {
          not: params.id
        }
      }
    });

    if (duplicateSource) {
      return NextResponse.json(
        { error: "Source with this name already exists" },
        { status: 400 }
      );
    }

    // Update the source
    const updatedSource = await prisma.systemSettings.update({
      where: { id: params.id },
      data: {
        value: name.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingSource.isActive
      }
    });

    return NextResponse.json({
      source: {
        id: updatedSource.id,
        name: updatedSource.value,
        description: updatedSource.description,
        isActive: updatedSource.isActive,
        createdAt: updatedSource.createdAt,
        updatedAt: updatedSource.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating lead source:', error);
    return NextResponse.json(
      { error: "Failed to update lead source" },
      { status: 500 }
    );
  }
}

// DELETE /api/lead-sources/[id] - Delete a lead source
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if source exists
    const existingSource = await prisma.systemSettings.findUnique({
      where: { id: params.id }
    });

    if (!existingSource) {
      return NextResponse.json(
        { error: "Lead source not found" },
        { status: 404 }
      );
    }

    // Check if source is being used by any leads
    const leadsUsingSource = await prisma.lead.count({
      where: {
        source: existingSource.value
      }
    });

    if (leadsUsingSource > 0) {
      return NextResponse.json(
        { error: `Cannot delete source. It is being used by ${leadsUsingSource} lead(s).` },
        { status: 400 }
      );
    }

    // Delete the source
    await prisma.systemSettings.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Lead source deleted successfully" });
  } catch (error) {
    console.error('Error deleting lead source:', error);
    return NextResponse.json(
      { error: "Failed to delete lead source" },
      { status: 500 }
    );
  }
}
