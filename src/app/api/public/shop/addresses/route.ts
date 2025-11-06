import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "adpools-secret-key-2024-production-change-me";

// GET /api/public/shop/addresses - Get customer addresses
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    // Get customer addresses
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: decoded.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/public/shop/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      label, 
      firstName,
      lastName,
      phone: addressPhone,
      street, 
      city, 
      region, 
      postalCode, 
      country, 
      isDefault 
    } = body;

    // Validate required fields
    if (!street || !city || !region || !country) {
      return NextResponse.json(
        { error: "Street, city, region, and country are required" },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: decoded.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new address
    const address = await prisma.customerAddress.create({
      data: {
        customerId: decoded.id,
        label: label || "Home",
        firstName: firstName || customer.firstName,
        lastName: lastName || customer.lastName,
        phone: addressPhone || customer.phone,
        street,
        city,
        region,
        country: country || "Ghana",
        postalCode: postalCode || "",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      address,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}

// PUT /api/public/shop/addresses - Update address
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      id,
      label,
      firstName,
      lastName,
      phone: addressPhone,
      street, 
      city, 
      region, 
      postalCode, 
      country, 
      isDefault 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    // Verify address belongs to customer
    const address = await prisma.customerAddress.findFirst({
      where: {
        id,
        customerId: decoded.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: decoded.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Update address
    const updatedAddress = await prisma.customerAddress.update({
      where: { id },
      data: {
        label: label || address.label,
        firstName: firstName || address.firstName,
        lastName: lastName || address.lastName,
        phone: addressPhone || address.phone,
        street: street || address.street,
        city: city || address.city,
        region: region || address.region,
        country: country || address.country,
        postalCode: postalCode || address.postalCode,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/public/shop/addresses - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    // Verify address belongs to customer and delete
    const address = await prisma.customerAddress.findFirst({
      where: {
        id,
        customerId: decoded.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    await prisma.customerAddress.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}

