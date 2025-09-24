import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 Starting credit approval process...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    console.log('📝 Processing credit approval for distributor:', distributorId);
    
    const body = await request.json();
    const { newCreditLimit, creditTerms, reason, notes, action } = body;
    
    console.log('📝 Credit approval data:', { newCreditLimit, creditTerms, reason, action });

    // Get current distributor data
    const distributor = await (prisma as any).distributor.findUnique({
      where: { id: distributorId }
    });

    if (!distributor) {
      console.log('❌ Distributor not found:', distributorId);
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    console.log('✅ Found distributor:', distributor.businessName);

    // Get credit settings for approval limits
    console.log('🔧 Loading credit settings...');
    const creditSettings = await (prisma as any).systemSettings.findMany({
      where: { category: 'credit' }
    });
    
    console.log('🔧 Credit settings loaded:', creditSettings.length, 'settings');

    const settings = creditSettings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.type === 'number' ? parseFloat(setting.value) : setting.value;
      return acc;
    }, {});

    // Check approval authority
    const managerLimit = settings.MANAGER_CREDIT_APPROVAL_LIMIT || 5000;
    const directorLimit = settings.DIRECTOR_CREDIT_APPROVAL_LIMIT || 20000;
    const superAdminLimit = settings.SUPER_ADMIN_CREDIT_APPROVAL_LIMIT || 100000;

    // Get user role (simplified - you might want to implement proper role checking)
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id }
    });

    const userRole = user?.role || 'SALES_REP';
    console.log('👤 User role:', userRole, 'for user:', session.user.email);
    
    let hasApprovalAuthority = false;

    // Check if user has approval authority based on role and amount
    if (userRole === 'MANAGER' && newCreditLimit <= managerLimit) {
      hasApprovalAuthority = true;
    } else if (userRole === 'DIRECTOR' && newCreditLimit <= directorLimit) {
      hasApprovalAuthority = true;
    } else if ((userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && newCreditLimit <= superAdminLimit) {
      hasApprovalAuthority = true;
    }
    
    console.log('🔐 Approval authority check:', {
      userRole,
      newCreditLimit,
      managerLimit,
      directorLimit,
      superAdminLimit,
      hasApprovalAuthority
    });

    if (!hasApprovalAuthority) {
      return NextResponse.json({ 
        error: 'Insufficient approval authority for this credit limit amount',
        requiredApproval: newCreditLimit <= managerLimit ? 'Manager' : 
                         newCreditLimit <= directorLimit ? 'Director' : 
                         newCreditLimit <= superAdminLimit ? 'Super Admin' : 'Board Approval'
      }, { status: 403 });
    }

    const currentLimit = distributor.creditLimit ? parseFloat(distributor.creditLimit.toString()) : 0;
    const currentUsed = distributor.currentCreditUsed ? parseFloat(distributor.currentCreditUsed.toString()) : 0;

    // Update distributor credit information
    console.log('💾 Updating distributor credit information...');
    const updatedDistributor = await (prisma as any).distributor.update({
      where: { id: distributorId },
      data: {
        creditLimit: newCreditLimit,
        creditTerms: creditTerms,
        creditApprovedBy: session.user.id,
        creditApprovedAt: new Date(),
        lastCreditReview: new Date(),
        nextCreditReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Distributor credit information updated');

    // Create credit history record
    console.log('📝 Creating credit history record...');
    await (prisma as any).distributorCreditHistory.create({
      data: {
        distributorId: distributorId,
        action: action === 'INCREASE' ? 'CREDIT_LIMIT_INCREASED' : 'CREDIT_LIMIT_DECREASED',
        previousLimit: currentLimit,
        newLimit: newCreditLimit,
        previousUsed: currentUsed,
        newUsed: currentUsed, // Credit used doesn't change with limit change
        amount: Math.abs(newCreditLimit - currentLimit),
        reason: reason,
        notes: notes,
        performedBy: session.user.id,
        performedAt: new Date()
      }
    });
    
    console.log('✅ Credit history record created');

    return NextResponse.json({
      success: true,
      message: `Credit limit ${action.toLowerCase()}d successfully`,
      data: {
        distributorId: distributorId,
        previousLimit: currentLimit,
        newLimit: newCreditLimit,
        changeAmount: newCreditLimit - currentLimit,
        approvedBy: session.user.id,
        approvedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error updating credit limit:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;

    // Get credit history for the distributor
    const creditHistory = await (prisma as any).distributorCreditHistory.findMany({
      where: { distributorId },
      include: {
        performedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { performedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: creditHistory
    });

  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
