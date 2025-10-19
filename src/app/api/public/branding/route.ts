import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get branding settings from database (public endpoint for login page)
    const settings = await prisma.systemSettings.findMany({
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
      companyLogo: settings.find(s => s.key === 'company_logo')?.value || '',
      favicon: settings.find(s => s.key === 'favicon')?.value || '/uploads/branding/favicon_default.svg',
      primaryColor: settings.find(s => s.key === 'primary_color')?.value || '#ea580c',
      secondaryColor: settings.find(s => s.key === 'secondary_color')?.value || '#c2410c',
      description: settings.find(s => s.key === 'company_description')?.value || 'A practical, single-tenant system for sales and distribution management'
    };

    return NextResponse.json(brandingSettings);

  } catch (error) {
    console.error('Error fetching public branding settings:', error);
    // Return default settings if database error
    return NextResponse.json({
      companyName: 'AdPools Group',
      companyLogo: '',
      favicon: '/uploads/branding/favicon_default.svg',
      primaryColor: '#ea580c',
      secondaryColor: '#c2410c',
      description: 'A practical, single-tenant system for sales and distribution management'
    });
  }
}
