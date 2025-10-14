import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/addresses/[id] - Get a single address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ address });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses/[id] - Update an address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      label,
      type,
      street,
      city,
      region,
      country,
      postalCode,
      contactPerson,
      phone,
      isDefault
    } = body;

    // If this is set as default, unset other defaults for the same account
    if (isDefault) {
      const address = await prisma.address.findUnique({ where: { id } });
      if (address) {
        await prisma.address.updateMany({
          where: { 
            accountId: address.accountId,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        label,
        type,
        street,
        city,
        region,
        country,
        postalCode,
        contactPerson,
        phone,
        isDefault
      }
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.address.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}

