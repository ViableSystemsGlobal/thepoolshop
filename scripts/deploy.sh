#!/bin/bash

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
npx tsx scripts/seed-postgres.ts

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Deployment completed successfully!"
