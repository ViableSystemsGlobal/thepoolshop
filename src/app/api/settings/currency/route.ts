import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings/currency - Get currency settings
export async function GET() {
  try {
    // Get system settings related to currency
    const settings = await prisma.systemSettings.findMany({
      where: {
        category: 'currency',
        isActive: true
      }
    });

    // Get all active currencies
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });

    // Get current exchange rates
    const exchangeRates = await prisma.exchangeRate.findMany({
      where: { isActive: true },
      orderBy: { effectiveFrom: 'desc' }
    });

    // Parse settings into a more usable format
    const currencySettings = {
      baseCurrency: settings.find(s => s.key === 'base_currency')?.value || 'GHS',
      defaultExchangeRateSource: settings.find(s => s.key === 'default_exchange_rate_source')?.value || 'manual',
      autoUpdateExchangeRates: settings.find(s => s.key === 'auto_update_exchange_rates')?.value === 'true',
      exchangeRateUpdateInterval: settings.find(s => s.key === 'exchange_rate_update_interval')?.value || 'daily',
      currencies,
      exchangeRates
    };

    return NextResponse.json(currencySettings);
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/currency - Update currency settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      baseCurrency, 
      defaultExchangeRateSource, 
      autoUpdateExchangeRates, 
      exchangeRateUpdateInterval,
      exchangeRates 
    } = body;

    // Update or create system settings
    const settingsToUpdate = [
      { key: 'base_currency', value: baseCurrency, type: 'string', category: 'currency' },
      { key: 'default_exchange_rate_source', value: defaultExchangeRateSource, type: 'string', category: 'currency' },
      { key: 'auto_update_exchange_rates', value: autoUpdateExchangeRates.toString(), type: 'boolean', category: 'currency' },
      { key: 'exchange_rate_update_interval', value: exchangeRateUpdateInterval, type: 'string', category: 'currency' }
    ];

    for (const setting of settingsToUpdate) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { 
          value: setting.value,
          type: setting.type,
          category: setting.category,
          updatedAt: new Date()
        },
        create: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category,
          description: `Currency setting: ${setting.key}`
        }
      });
    }

    // Update exchange rates if provided
    if (exchangeRates && Array.isArray(exchangeRates)) {
      for (const rate of exchangeRates) {
        if (rate.id) {
          // Update existing rate
          await prisma.exchangeRate.update({
            where: { id: rate.id },
            data: {
              rate: rate.rate,
              effectiveFrom: new Date(rate.effectiveFrom),
              effectiveTo: rate.effectiveTo ? new Date(rate.effectiveTo) : null,
              isActive: rate.isActive,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new rate
          await prisma.exchangeRate.create({
            data: {
              fromCurrency: rate.fromCurrency,
              toCurrency: rate.toCurrency,
              rate: rate.rate,
              source: rate.source || 'manual',
              effectiveFrom: new Date(rate.effectiveFrom),
              effectiveTo: rate.effectiveTo ? new Date(rate.effectiveTo) : null,
              isActive: rate.isActive !== false
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    return NextResponse.json(
      { error: 'Failed to update currency settings' },
      { status: 500 }
    );
  }
}
