import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        distributor: {
          select: {
            id: true,
            businessName: true,
            email: true,
            phone: true,
            creditLimit: true,
            currentCreditUsed: true,
            creditStatus: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                sellingPrice: true,
                stockQuantity: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { 
      status, 
      paymentMethod, 
      notes, 
      deliveryAddress, 
      deliveryDate 
    } = body;

    // Validate required fields
    if (!status || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Status and payment method are required' 
      }, { status: 400 });
    }

    // Validate status
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid order status' 
      }, { status: 400 });
    }

    console.log('🔄 Updating order:', id);
    console.log('📝 Update data:', { status, paymentMethod, notes, deliveryAddress, deliveryDate });

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentMethod,
        notes: notes || null,
        deliveryAddress: deliveryAddress || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        updatedAt: new Date()
      },
      include: {
        distributor: {
          select: {
            id: true,
            businessName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Order updated successfully:', updatedOrder.orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    console.log('🗑️ Deleting order:', id);

    // First, get the order details for logging and credit reversal
    const orderToDelete = await prisma.order.findUnique({
      where: { id },
      include: {
        distributor: {
          select: {
            id: true,
            businessName: true,
            currentCreditUsed: true
          }
        }
      }
    });

    if (!orderToDelete) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order can be deleted (only pending orders should be deletable)
    if (orderToDelete.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Only pending orders can be deleted',
        details: `Current status: ${orderToDelete.status}`
      }, { status: 400 });
    }

    // Delete the order (items will be deleted automatically due to cascade)
    await prisma.order.delete({
      where: { id }
    });

    // If payment method was credit, reverse the credit usage
    if (orderToDelete.paymentMethod === 'credit') {
      console.log('💳 Reversing credit usage...');
      
      const distributor = await prisma.distributor.findUnique({
        where: { id: orderToDelete.distributorId }
      });

      if (distributor) {
        const newCreditUsed = Math.max(0, (distributor.currentCreditUsed || 0) - orderToDelete.totalAmount);
        
        await prisma.distributor.update({
          where: { id: orderToDelete.distributorId },
          data: {
            currentCreditUsed: newCreditUsed,
            updatedAt: new Date()
          }
        });

        // Log credit reversal in credit history
        await prisma.distributorCreditHistory.create({
          data: {
            distributorId: orderToDelete.distributorId,
            action: 'CREDIT_REVERSED',
            previousLimit: distributor.creditLimit || 0,
            newLimit: distributor.creditLimit || 0,
            previousUsed: distributor.currentCreditUsed || 0,
            newUsed: newCreditUsed,
            amount: -orderToDelete.totalAmount, // Negative amount for reversal
            reason: `Order deleted: ${orderToDelete.orderNumber}`,
            notes: `Order total: GHS ${orderToDelete.totalAmount.toLocaleString()}`,
            performedBy: session.user.id,
            performedAt: new Date()
          }
        });

        console.log('✅ Credit usage reversed');
      }
    }

    console.log('✅ Order deleted successfully:', orderToDelete.orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete order',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
