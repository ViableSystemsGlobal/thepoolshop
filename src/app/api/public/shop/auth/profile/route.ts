import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "adpools-secret-key-2024-production-change-me";

// GET /api/public/shop/auth/profile - Get customer profile
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

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/public/shop/auth/profile - Update customer profile
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
    const { firstName, lastName, phone } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Update customer profile
    const updatedCustomer = await prisma.customer.update({
      where: { id: decoded.id },
      data: {
        firstName,
        lastName,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// POST /api/public/shop/auth/profile/password - Change password
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Get customer to verify current password
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, customer.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.customer.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}

