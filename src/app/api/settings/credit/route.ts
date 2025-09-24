import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Loading credit settings...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized request to credit settings');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get credit-related settings
    const creditSettings = await (prisma as any).systemSettings.findMany({
      where: {
        category: 'credit'
      }
    });
    
    console.log('🔧 Found credit settings:', creditSettings.length);

    // Convert to object format
    const settings = creditSettings.reduce((acc: any, setting: any) => {
      let value = setting.value;
      
      // Convert numeric values
      if (setting.type === 'number') {
        value = parseFloat(value);
      } else if (setting.type === 'boolean') {
        value = value === 'true';
      }
      
      acc[setting.key] = value;
      return acc;
    }, {});

    const responseData = {
      success: true,
      data: {
        managerLimit: settings.MANAGER_CREDIT_APPROVAL_LIMIT || 5000,
        directorLimit: settings.DIRECTOR_CREDIT_APPROVAL_LIMIT || 20000,
        superAdminLimit: settings.SUPER_ADMIN_CREDIT_APPROVAL_LIMIT || 100000,
        defaultTerms: settings.DEFAULT_CREDIT_TERMS || 'Net 30',
        reviewFrequency: settings.CREDIT_REVIEW_FREQUENCY || 'QUARTERLY',
        alertThreshold: settings.CREDIT_ALERT_THRESHOLD || 80,
        overdueDays: settings.CREDIT_OVERDUE_DAYS || 30,
        monitoringEnabled: settings.CREDIT_MONITORING_ENABLED || true
      }
    };
    
    console.log('✅ Credit settings response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching credit settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    // Update credit settings
    for (const [key, value] of Object.entries(settings)) {
      await (prisma as any).systemSettings.upsert({
        where: { key },
        update: {
          value: value.toString(),
          updatedAt: new Date()
        },
        create: {
          key,
          value: value.toString(),
          type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
          category: 'credit',
          description: `Credit management setting for ${key}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Credit settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating credit settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
