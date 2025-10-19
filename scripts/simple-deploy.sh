#!/bin/bash

# Simple deployment script that uses node directly
# Run with: bash scripts/simple-deploy.sh

echo "🚀 Starting deployment setup..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1/3: Generating Prisma Client..."
node ./node_modules/prisma/build/index.js generate
if [ $? -eq 0 ]; then
  echo "✅ Prisma Client generated successfully!"
  echo ""
else
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi

# Step 2: Deploy migrations
echo "🔄 Step 2/3: Deploying database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy
if [ $? -eq 0 ]; then
  echo "✅ Migrations deployed successfully!"
  echo ""
else
  echo "❌ Failed to deploy migrations"
  exit 1
fi

# Step 3: Seed database
echo "🌱 Step 3/3: Seeding database..."
node ./node_modules/tsx/dist/cli.mjs scripts/seed-postgres.ts
if [ $? -eq 0 ]; then
  echo "✅ Database seeded successfully!"
  echo ""
else
  echo "❌ Failed to seed database"
  exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "You can now login with:"
echo "  Email: admin@adpools.com"
echo "  Password: admin123"
echo ""
echo "⚠️  Remember to change the admin password after first login!"
echo ""

