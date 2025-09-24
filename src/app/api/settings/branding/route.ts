import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get branding settings from database
    const settings = await (prisma as any).setting.findMany({
      where: {
        key: {
          in: [
            'company_name',
            'company_logo',
            'favicon',
            'primary_color',
            'secondary_color',
            'company_description'
          ]
        }
      }
    });

    // Convert to object format
    const brandingSettings = {
      companyName: settings.find(s => s.key === 'company_name')?.value || 'AdPools Group',
      companyLogo: settings.find(s => s.key === 'company_logo')?.value || '/uploads/branding/company_logo_default.svg',
      favicon: settings.find(s => s.key === 'favicon')?.value || '/uploads/branding/favicon_default.svg',
      primaryColor: settings.find(s => s.key === 'primary_color')?.value || '#3B82F6',
      secondaryColor: settings.find(s => s.key === 'secondary_color')?.value || '#1E40AF',
      description: settings.find(s => s.key === 'company_description')?.value || 'A practical, single-tenant system for sales and distribution management'
    };

    return NextResponse.json(brandingSettings);

  } catch (error) {
    console.error('Error fetching branding settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const {
      companyName,
      companyLogo,
      favicon,
      primaryColor,
      secondaryColor,
      description
    } = body;

    // Update or create settings
    const settingsToUpdate = [
      { key: 'company_name', value: companyName },
      { key: 'company_logo', value: companyLogo },
      { key: 'favicon', value: favicon },
      { key: 'primary_color', value: primaryColor },
      { key: 'secondary_color', value: secondaryColor },
      { key: 'company_description', value: description }
    ];

    for (const setting of settingsToUpdate) {
      await (prisma as any).setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: 'branding',
          updatedBy: session.user.id
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving branding settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
