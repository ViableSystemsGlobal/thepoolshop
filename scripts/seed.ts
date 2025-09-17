import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'admin@adpools.com' },
    update: {},
    create: {
      email: 'admin@adpools.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create some demo categories
  const electronics = await prisma.category.upsert({
    where: { id: 'electronics' },
    update: {},
    create: {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic products and accessories',
    },
  })

  const furniture = await prisma.category.upsert({
    where: { id: 'furniture' },
    update: {},
    create: {
      id: 'furniture',
      name: 'Furniture',
      description: 'Office and home furniture',
    },
  })

  // Create a demo price list
  const priceList = await prisma.priceList.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Default Price List',
      channel: 'direct',
      currency: 'USD',
    },
  })

  // Create a demo warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      id: 'main-warehouse',
      name: 'Main Warehouse',
      code: 'MAIN',
      address: '123 Business Street',
      city: 'Accra',
      country: 'Ghana',
    },
  })

  // Create some demo products
  const laptop = await prisma.product.upsert({
    where: { sku: 'LAPTOP-001' },
    update: {},
    create: {
      sku: 'LAPTOP-001',
      name: 'Dell Laptop',
      description: 'High-performance business laptop',
      uomBase: 'pcs',
      uomSell: 'pcs',
      price: 1200.00,
      cost: 800.00,
      importCurrency: 'USD',
      categoryId: electronics.id,
    },
  })

  const chair = await prisma.product.upsert({
    where: { sku: 'CHAIR-001' },
    update: {},
    create: {
      sku: 'CHAIR-001',
      name: 'Office Chair',
      description: 'Ergonomic office chair',
      uomBase: 'pcs',
      uomSell: 'pcs',
      price: 150.00,
      cost: 100.00,
      importCurrency: 'USD',
      categoryId: furniture.id,
    },
  })

  const monitor = await prisma.product.upsert({
    where: { sku: 'MONITOR-001' },
    update: {},
    create: {
      sku: 'MONITOR-001',
      name: '24" Monitor',
      description: 'Full HD monitor',
      uomBase: 'pcs',
      uomSell: 'pcs',
      price: 200.00,
      cost: 120.00,
      importCurrency: 'USD',
      categoryId: electronics.id,
    },
  })

  // Create stock items for the products
  const laptopStock = await prisma.stockItem.upsert({
    where: { productId: laptop.id },
    update: {},
    create: {
      productId: laptop.id,
      quantity: 25,
      reserved: 5,
      available: 20,
      averageCost: 800.00,
      totalValue: 20000.00, // 25 * 800
      reorderPoint: 5,
      warehouseId: warehouse.id,
    },
  })

  const chairStock = await prisma.stockItem.upsert({
    where: { productId: chair.id },
    update: {},
    create: {
      productId: chair.id,
      quantity: 50,
      reserved: 10,
      available: 40,
      averageCost: 100.00,
      totalValue: 5000.00, // 50 * 100
      reorderPoint: 10,
      warehouseId: warehouse.id,
    },
  })

  const monitorStock = await prisma.stockItem.upsert({
    where: { productId: monitor.id },
    update: {},
    create: {
      productId: monitor.id,
      quantity: 15,
      reserved: 3,
      available: 12,
      averageCost: 120.00,
      totalValue: 1800.00, // 15 * 120
      reorderPoint: 3,
      warehouseId: warehouse.id,
    },
  })

  console.log('Demo data created successfully!')
  console.log('User:', user)
  console.log('Categories:', { electronics, furniture })
  console.log('Price List:', priceList)
  console.log('Warehouse:', warehouse)
  console.log('Products:', { laptop, chair, monitor })
  console.log('Stock Items:', { laptopStock, chairStock, monitorStock })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
