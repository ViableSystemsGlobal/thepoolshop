import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCurrencies() {
  console.log('🌍 Seeding currencies...');

  // Create currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }

  console.log('✅ Currencies seeded');

  // Create exchange rates (example rates - in production, these would come from an API)
  console.log('💱 Seeding exchange rates...');

  const exchangeRates = [
    // USD to GHS (example rate: 1 USD = 12.5 GHS)
    { fromCurrency: 'USD', toCurrency: 'GHS', rate: 12.5, source: 'manual' },
    { fromCurrency: 'GHS', toCurrency: 'USD', rate: 0.08, source: 'manual' },
    
    // USD to EUR (example rate: 1 USD = 0.85 EUR)
    { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.85, source: 'manual' },
    { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.18, source: 'manual' },
    
    // USD to GBP (example rate: 1 USD = 0.75 GBP)
    { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.75, source: 'manual' },
    { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.33, source: 'manual' },
    
    // GHS to EUR (example rate: 1 GHS = 0.068 EUR)
    { fromCurrency: 'GHS', toCurrency: 'EUR', rate: 0.068, source: 'manual' },
    { fromCurrency: 'EUR', toCurrency: 'GHS', rate: 14.7, source: 'manual' },
    
    // GHS to NGN (example rate: 1 GHS = 45 NGN)
    { fromCurrency: 'GHS', toCurrency: 'NGN', rate: 45, source: 'manual' },
    { fromCurrency: 'NGN', toCurrency: 'GHS', rate: 0.022, source: 'manual' },
  ];

  for (const rate of exchangeRates) {
    await prisma.exchangeRate.create({
      data: {
        ...rate,
        effectiveFrom: new Date(),
        isActive: true,
      },
    });
  }

  console.log('✅ Exchange rates seeded');

  // Create sample products with multi-currency support
  console.log('📦 Seeding sample products...');

  // First, create a category
  const electronicsCategory = await prisma.category.upsert({
    where: { id: 'electronics-cat' },
    update: {},
    create: {
      id: 'electronics-cat',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  });

  const furnitureCategory = await prisma.category.upsert({
    where: { id: 'furniture-cat' },
    update: {},
    create: {
      id: 'furniture-cat',
      name: 'Furniture',
      description: 'Office and home furniture',
    },
  });

  // Create sample products
  const products = [
    {
      id: 'prod-001',
      sku: 'PROD-001',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      categoryId: electronicsCategory.id,
      price: 299.99, // Import price in USD
      cost: 200.00,  // Cost in USD
      importCurrency: 'USD',
    },
    {
      id: 'prod-002',
      sku: 'PROD-002',
      name: 'Ergonomic Office Chair',
      description: 'Comfortable office chair with lumbar support',
      categoryId: furnitureCategory.id,
      price: 199.99, // Import price in USD
      cost: 120.00,  // Cost in USD
      importCurrency: 'USD',
    },
    {
      id: 'prod-003',
      sku: 'PROD-003',
      name: 'Smart Fitness Tracker',
      description: 'Advanced fitness tracker with heart rate monitoring',
      categoryId: electronicsCategory.id,
      price: 149.99, // Import price in USD
      cost: 80.00,   // Cost in USD
      importCurrency: 'USD',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  console.log('✅ Sample products seeded');

  // Create price lists for different currencies
  console.log('💰 Seeding price lists...');

  const priceLists = [
    {
      id: 'price-list-usd',
      name: 'Standard Retail (USD)',
      description: 'Standard pricing for retail customers in USD',
      channel: 'retail',
      currency: 'USD',
    },
    {
      id: 'price-list-ghs',
      name: 'Standard Retail (GHS)',
      description: 'Standard pricing for retail customers in Ghana Cedis',
      channel: 'retail',
      currency: 'GHS',
    },
    {
      id: 'price-list-wholesale',
      name: 'Wholesale Pricing (GHS)',
      description: 'Discounted pricing for wholesale customers',
      channel: 'wholesale',
      currency: 'GHS',
    },
  ];

  for (const priceList of priceLists) {
    await prisma.priceList.upsert({
      where: { id: priceList.id },
      update: priceList,
      create: priceList,
    });
  }

  console.log('✅ Price lists seeded');

  console.log('🎉 Multi-currency system seeded successfully!');
}

seedCurrencies()
  .catch((e) => {
    console.error('❌ Error seeding currencies:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
