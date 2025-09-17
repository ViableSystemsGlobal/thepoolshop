import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCurrencySettings() {
  try {
    console.log('Seeding currency settings...');

    // Create currencies
    const currencies = [
      { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
    ];

    for (const currency of currencies) {
      await prisma.currency.upsert({
        where: { code: currency.code },
        update: currency,
        create: currency,
      });
      console.log(`Created/updated currency: ${currency.code}`);
    }

    // Create system settings
    const settings = [
      {
        key: 'base_currency',
        value: 'GHS',
        type: 'string',
        category: 'currency',
        description: 'System base currency'
      },
      {
        key: 'default_exchange_rate_source',
        value: 'manual',
        type: 'string',
        category: 'currency',
        description: 'Default source for exchange rates'
      },
      {
        key: 'auto_update_exchange_rates',
        value: 'false',
        type: 'boolean',
        category: 'currency',
        description: 'Automatically update exchange rates'
      },
      {
        key: 'exchange_rate_update_interval',
        value: 'daily',
        type: 'string',
        category: 'currency',
        description: 'How often to update exchange rates'
      }
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      });
      console.log(`Created/updated setting: ${setting.key}`);
    }

    // Create default exchange rates
    const exchangeRates = [
      {
        fromCurrency: 'USD',
        toCurrency: 'GHS',
        rate: 12.5,
        source: 'manual',
        effectiveFrom: new Date(),
        isActive: true
      },
      {
        fromCurrency: 'EUR',
        toCurrency: 'GHS',
        rate: 13.8,
        source: 'manual',
        effectiveFrom: new Date(),
        isActive: true
      },
      {
        fromCurrency: 'GHS',
        toCurrency: 'USD',
        rate: 0.08,
        source: 'manual',
        effectiveFrom: new Date(),
        isActive: true
      }
    ];

    for (const rate of exchangeRates) {
      await prisma.exchangeRate.create({
        data: rate,
      });
      console.log(`Created exchange rate: ${rate.fromCurrency} to ${rate.toCurrency} = ${rate.rate}`);
    }

    console.log('Currency settings seeded successfully!');
  } catch (error) {
    console.error('Error seeding currency settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCurrencySettings()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
