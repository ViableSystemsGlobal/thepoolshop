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

  console.log('Demo data created successfully!')
  console.log('User:', user)
  console.log('Categories:', { electronics, furniture })
  console.log('Price List:', priceList)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
