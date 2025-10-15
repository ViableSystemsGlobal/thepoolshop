import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to get setting value from database
async function getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
      select: { value: true }
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

// Check if distributor has sufficient credit for order
async function checkDistributorCredit(distributorId: string, orderAmount: number): Promise<{
  hasCredit: boolean;
  availableCredit: number;
  creditLimit: number;
  currentUsed: number;
  message: string;
}> {
  try {
    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
      select: {
        id: true,
        businessName: true,
        creditLimit: true,
        currentCreditUsed: true,
        creditStatus: true
      }
    });

    if (!distributor) {
      return {
        hasCredit: false,
        availableCredit: 0,
        creditLimit: 0,
        currentUsed: 0,
        message: 'Distributor not found'
      };
    }

    const creditLimit = parseFloat(distributor.creditLimit?.toString() || '0');
    const currentUsed = parseFloat(distributor.currentCreditUsed?.toString() || '0');
    const availableCredit = creditLimit - currentUsed;

    // Check if credit is suspended
    if (distributor.creditStatus === 'SUSPENDED') {
      return {
        hasCredit: false,
        availableCredit,
        creditLimit,
        currentUsed,
        message: 'Credit account is suspended'
      };
    }

    // Check if order amount exceeds available credit
    if (orderAmount > availableCredit) {
      return {
        hasCredit: false,
        availableCredit,
        creditLimit,
        currentUsed,
        message: `Order amount (GHS ${orderAmount.toLocaleString()}) exceeds available credit (GHS ${availableCredit.toLocaleString()})`
      };
    }

    return {
      hasCredit: true,
      availableCredit,
      creditLimit,
      currentUsed,
      message: 'Credit check passed'
    };

  } catch (error) {
    console.error('Error checking distributor credit:', error);
    return {
      hasCredit: false,
      availableCredit: 0,
      creditLimit: 0,
      currentUsed: 0,
      message: 'Error checking credit status'
    };
  }
}

// Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customerType = 'distributor',
      customerId, // Can be distributorId, accountId, or contactId
      distributorId, // Legacy support
      accountId,
      contactId,
      items, 
      totalAmount, 
      paymentMethod = 'credit',
      notes = '',
      deliveryAddress = '',
      deliveryDate = null
    } = body;

    // Determine the actual customer ID and type
    const actualCustomerType = customerType || 'distributor';
    const actualCustomerId = customerId || distributorId;
    const actualDistributorId = actualCustomerType === 'distributor' ? actualCustomerId : (distributorId || actualCustomerId);
    const actualAccountId = actualCustomerType === 'account' ? actualCustomerId : accountId;
    const actualContactId = actualCustomerType === 'contact' ? actualCustomerId : contactId;

    // Validate required fields
    if (!actualCustomerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Customer ID and order items are required' 
      }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ 
        error: 'Total amount must be greater than 0' 
      }, { status: 400 });
    }

    console.log('🚀 Creating order for customer:', { type: actualCustomerType, id: actualCustomerId });
    console.log('📦 Order details:', { totalAmount, items: items.length, paymentMethod });

    // Check if credit checking is enabled (only for distributors)
    const creditCheckingEnabled = await getSettingValue('CREDIT_CHECKING_ENABLED', 'true');
    
    if (creditCheckingEnabled === 'true' && paymentMethod === 'credit' && actualCustomerType === 'distributor') {
      console.log('🔍 Running credit check...');
      
      // Perform credit check
      const creditCheck = await checkDistributorCredit(actualDistributorId, totalAmount);
      
      console.log('💳 Credit check result:', creditCheck);

      if (!creditCheck.hasCredit) {
        return NextResponse.json({
          error: 'Credit check failed',
          details: creditCheck.message,
          creditInfo: {
            availableCredit: creditCheck.availableCredit,
            creditLimit: creditCheck.creditLimit,
            currentUsed: creditCheck.currentUsed
          }
        }, { status: 400 });
      }

      console.log('✅ Credit check passed');
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        distributorId: actualDistributorId,
        customerType: actualCustomerType,
        accountId: actualAccountId,
        contactId: actualContactId,
        totalAmount,
        status: 'PENDING',
        paymentMethod,
        notes,
        deliveryAddress,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        createdBy: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes || ''
          }))
        }
      },
      include: {
        distributor: {
          select: {
            businessName: true,
            email: true,
            phone: true
          }
        },
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      }
    });

    // If payment method is credit and customer is distributor, update credit usage
    if (paymentMethod === 'credit' && actualCustomerType === 'distributor') {
      console.log('💳 Updating distributor credit usage...');
      
      const distributor = await prisma.distributor.findUnique({
        where: { id: actualDistributorId }
      });

      if (distributor) {
        const newCreditUsed = (distributor.currentCreditUsed || 0) + totalAmount;
        
        await prisma.distributor.update({
          where: { id: actualDistributorId },
          data: {
            currentCreditUsed: newCreditUsed,
            updatedAt: new Date()
          }
        });

        // Log credit usage in credit history
        await prisma.distributorCreditHistory.create({
          data: {
            distributorId: actualDistributorId,
            action: 'CREDIT_USED',
            previousLimit: distributor.creditLimit || 0,
            newLimit: distributor.creditLimit || 0,
            previousUsed: distributor.currentCreditUsed || 0,
            newUsed: newCreditUsed,
            amount: totalAmount,
            reason: `Order created: ${orderNumber}`,
            notes: `Order total: GHS ${totalAmount.toLocaleString()}`,
            performedBy: session.user.id,
            performedAt: new Date()
          }
        });

        console.log('✅ Credit usage updated');
      }
    }

    console.log('✅ Order created successfully:', orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        distributor: order.distributor,
        items: order.items,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Get orders with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (distributorId) where.distributorId = distributorId;
    if (status) where.status = status;

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          distributor: {
            select: {
              businessName: true,
              email: true,
              phone: true
            }
          },
          account: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
