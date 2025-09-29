import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company settings
    const companySettings = await prisma.systemSettings.findMany({
      where: {
        category: 'company',
        isActive: true
      }
    });

    // Convert to object
    const settings: Record<string, string> = {};
    companySettings.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, companyAddress, companyPhone, companyEmail } = body;

    // Update or create company settings
    const settings = [
      { key: 'companyName', value: companyName || '' },
      { key: 'companyAddress', value: companyAddress || '' },
      { key: 'companyPhone', value: companyPhone || '' },
      { key: 'companyEmail', value: companyEmail || '' }
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          type: 'string',
          category: 'company',
          description: `Company ${setting.key.replace('company', '').toLowerCase()}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Company settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating company settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
