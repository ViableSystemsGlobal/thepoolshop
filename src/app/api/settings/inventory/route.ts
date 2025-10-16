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

    // Get inventory automation setting
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'inventory_automation_enabled' }
    });

    return NextResponse.json({
      inventoryAutomationEnabled: setting?.value !== 'false' // Default to true
    });
  } catch (error) {
    console.error('Error fetching inventory settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory settings' },
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
    const { inventoryAutomationEnabled } = body;

    // Upsert inventory automation setting
    await prisma.systemSettings.upsert({
      where: { key: 'inventory_automation_enabled' },
      update: { value: String(inventoryAutomationEnabled) },
      create: {
        key: 'inventory_automation_enabled',
        value: String(inventoryAutomationEnabled),
        description: 'Enable automatic inventory management for invoices'
      }
    });

    console.log(`✅ Inventory automation ${inventoryAutomationEnabled ? 'enabled' : 'disabled'}`);

    return NextResponse.json({
      success: true,
      inventoryAutomationEnabled
    });
  } catch (error) {
    console.error('Error saving inventory settings:', error);
    return NextResponse.json(
      { error: 'Failed to save inventory settings' },
      { status: 500 }
    );
  }
}

