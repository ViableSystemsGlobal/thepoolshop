# 🚀 Comprehensive Deployment Guide

**Last Updated:** November 5, 2025  
**Based on:** Production deployment challenges and solutions

This guide covers all challenges encountered during deployment and provides step-by-step solutions to prevent them from recurring.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Verification Checklist](#verification-checklist)
8. [Rollback Procedures](#rollback-procedures)

---

## 🔍 Pre-Deployment Checklist

### ✅ Code Repository

- [ ] All code changes committed to git
- [ ] Code pushed to both remotes (`origin` and `vssalesystem`)
- [ ] No uncommitted changes
- [ ] All migrations are in `prisma/migrations/` directory

### ✅ Database Schema

- [ ] Prisma schema uses PostgreSQL (`provider = "postgresql"`)
- [ ] All migrations are created and tested locally
- [ ] No missing columns in schema vs migrations
- [ ] All foreign key relationships are defined

### ✅ Environment Variables

- [ ] `DATABASE_URL` configured for PostgreSQL
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` generated (32+ characters)
- [ ] All required environment variables documented

### ✅ Build Verification

- [ ] Application builds successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors (or configured to ignore during build)
- [ ] All dependencies installed

---

## 🗄️ Database Setup

### Critical: Database Provider Configuration

**⚠️ IMPORTANT:** The Prisma schema MUST use PostgreSQL, not SQLite.

**File:** `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  // ✅ MUST be postgresql
  url      = env("DATABASE_URL")
}
```

**❌ Common Mistake:** Using `provider = "sqlite"` in production causes:
- `PrismaClientInitializationError`
- Database connection failures
- Migration errors

### Database Migration Strategy

#### Step 1: Verify All Migrations Exist

Before deploying, ensure all required migrations are present:

```bash
# Check migrations directory
ls -la prisma/migrations/

# Required migrations:
# - 20251019221510_init/ (initial schema)
# - 20251105120000_add_price_list_id_to_quotations/
# - 20251105130000_add_supplier_id_to_stock_movements/
# - 20251105140000_create_suppliers_table/
# - 20251105150000_add_currency_fields_to_quotation_lines/
```

#### Step 2: Test Migrations Locally

```bash
# Set up local PostgreSQL for testing
export DATABASE_URL="postgresql://user:password@localhost:5432/test_db"

# Run migrations
npx prisma migrate deploy

# Verify schema matches database
npx prisma db pull
npx prisma generate
```

#### Step 3: Required Migrations Checklist

Ensure these migrations exist and are in order:

1. **Initial Migration** (`20251019221510_init`)
   - Creates all base tables
   - Sets up relationships

2. **Price List ID** (`20251105120000_add_price_list_id_to_quotations`)
   - Adds `priceListId` to `quotations` table
   - Required for quotation creation

3. **Supplier ID** (`20251105130000_add_supplier_id_to_stock_movements`)
   - Creates `suppliers` table if missing
   - Creates `SupplierStatus` enum
   - Adds `supplierId` to `stock_movements` table

4. **Suppliers Table** (`20251105140000_create_suppliers_table`)
   - Standalone migration to ensure suppliers table exists
   - Required for supplier management

5. **Currency Fields** (`20251105150000_add_currency_fields_to_quotation_lines`)
   - Adds `unitPriceCurrency` to `quotation_lines`
   - Adds `fxRateUsed` to `quotation_lines`
   - Adds `priceListIdUsed` to `quotation_lines`

### Migration Execution Order

**⚠️ CRITICAL:** Run migrations in this exact order:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. If migrations failed, mark as resolved
npx prisma migrate resolve --applied <migration-name>

# 3. Deploy all pending migrations
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate

# 5. Verify database schema
npx prisma db pull
```

---

## 🔐 Environment Configuration

### Required Environment Variables

**File:** `.env` or Easy Panel Environment Variables

```env
# Database - PostgreSQL (CRITICAL: Must be PostgreSQL, not SQLite)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<generate-32-char-secret>"

# Optional: Email Configuration
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USERNAME=""
SMTP_PASSWORD=""
SMTP_FROM_ADDRESS="noreply@yourdomain.com"

# Optional: SMS Configuration
SMS_PROVIDER=""
SMS_API_KEY=""
SMS_FROM_NUMBER=""

# Optional: AI Configuration
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""

# Optional: Google Maps
GOOGLE_MAPS_API_KEY=""
```

### Generate NextAuth Secret

```bash
# Generate a secure secret
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

**Example Output:**
```
k5prOOB4Xrtk5RglbKDxvaK7VflPKj7V0Ep6LQw+0NU=
```

### Environment Variable Verification

```bash
# On production server
echo $DATABASE_URL
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# Verify PostgreSQL connection string format
# Should start with: postgresql://
# NOT: file:./dev.db
```

---

## 🚀 Deployment Steps

### Step 1: SSH into Production Server

```bash
ssh user@your-server
cd /path/to/your/app
```

### Step 2: Pull Latest Code

```bash
# Pull from main branch
git pull origin main

# Verify all files are updated
git status
```

### Step 3: Install Dependencies

```bash
# Install/update dependencies
npm install

# Or if using pnpm
pnpm install
```

### Step 4: Verify Database Connection

```bash
# Test database connection
npx prisma db pull

# If successful, you'll see database schema
# If fails, check DATABASE_URL
```

### Step 5: Generate Prisma Client

```bash
# Generate Prisma Client with latest schema
npx prisma generate

# Verify generation was successful
# Should see: "Generated Prisma Client"
```

### Step 6: Run Database Migrations

**⚠️ CRITICAL STEP:** This is where most issues occur.

```bash
# Check migration status first
npx prisma migrate status

# If migrations failed previously, resolve them
npx prisma migrate resolve --applied <migration-name>

# Deploy all pending migrations
npx prisma migrate deploy

# Verify migrations were applied
npx prisma migrate status
```

**Expected Output:**
```
✅ All migrations have been successfully applied.
```

### Step 7: Restore Roles and Abilities (CRITICAL)

**⚠️ IMPORTANT:** After database reset or initial setup, roles and abilities must be restored.

```bash
# Run the restore script
node scripts/restore-roles-and-abilities.js
```

**What this does:**
- Creates all 100+ abilities (permissions)
- Creates SUPER_ADMIN role with all abilities
- Assigns SUPER_ADMIN role to admin user
- Ensures access control works properly

**Expected Output:**
```
🔐 Restoring Roles and Abilities...
📋 Step 1: Creating all abilities...
✅ Created/updated 100+ abilities
📋 Step 2: Creating SUPER_ADMIN role...
✅ SUPER_ADMIN role created/updated
📋 Step 3: Assigning all abilities to SUPER_ADMIN role...
✅ Assigned 100+ abilities to SUPER_ADMIN role
📋 Step 4: Setting up admin user...
✅ Updated admin user: admin@adpools.com
📋 Step 5: Assigning SUPER_ADMIN role to admin user...
✅ SUPER_ADMIN role assigned to admin user
🎉 Roles and abilities restored successfully!
```

### Step 8: Build Application

```bash
# Build for production
npm run build

# Verify build was successful
# Should see: "✓ Compiled successfully"
```

### Step 9: Restart Application

```bash
# If using PM2
pm2 restart all

# Or restart through Easy Panel dashboard
# Or if using systemd
sudo systemctl restart your-app
```

### Step 10: Verify Deployment

```bash
# Check application logs
pm2 logs

# Or check Easy Panel logs
# Look for any errors or warnings
```

---

## ✅ Post-Deployment Setup

### 1. Create Admin User (if not exists)

```bash
# Run admin user creation script
node scripts/reset-admin-password.js
```

**Credentials:**
- Email: `admin@adpools.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change password after first login!

### 2. Restore Roles and Abilities

```bash
# Run roles restoration (if not done in Step 7)
node scripts/restore-roles-and-abilities.js
```

### 3. Verify Database Schema

Check that all required tables and columns exist:

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Verify critical tables exist:
# - users
# - roles
# - abilities
# - role_abilities
# - user_role_assignments
# - quotations
# - quotation_lines
# - stock_movements
# - suppliers

# Check critical columns
\d quotations
\d quotation_lines
\d stock_movements
\d suppliers

# Exit
\q
```

### 4. Test Core Functionality

#### Test 1: Login
1. Visit application URL
2. Login with `admin@adpools.com` / `admin123`
3. Should see dashboard

#### Test 2: View Quotations
1. Navigate to `/quotations`
2. Should load without 500 errors
3. Should see all quotations (if SUPER_ADMIN)

#### Test 3: Create Quotation
1. Click "Create Quotation"
2. Fill in form
3. Add product lines
4. Submit
5. Should create successfully

#### Test 4: Create Supplier
1. Navigate to `/inventory/suppliers`
2. Click "Add Supplier"
3. Fill in form
4. Submit
5. Should create successfully

#### Test 5: Create Stock Movement
1. Navigate to `/inventory/stock-movements`
2. Click "Add Stock Movement"
3. Select product
4. Select "RECEIPT" type
5. Should see "Supplier" dropdown
6. Fill in form and submit
7. Should create successfully

#### Test 6: Super Admin Access
1. Logout and login again
2. Navigate to Settings
3. Should see all settings pages:
   - Users
   - Roles
   - Product Settings
   - Currency Settings
   - Business Settings
   - Google Maps
   - Credit Monitoring
   - Backup Settings
   - System Settings
   - Notifications
   - Notification Templates
   - Lead Sources
   - AI Settings

---

## 🚨 Common Issues & Solutions

### Issue 1: Missing Database Columns

**Error:** `The column 'table_name.column_name' does not exist in the current database`

**Cause:** Migration not run or migration failed

**Solution:**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. If migration failed, resolve it
npx prisma migrate resolve --applied <migration-name>

# 3. Run migrations again
npx prisma migrate deploy

# 4. Regenerate Prisma Client
npx prisma generate

# 5. Restart application
pm2 restart all
```

**Prevention:** Always verify migrations before deployment

---

### Issue 2: Database Provider Mismatch

**Error:** `PrismaClientInitializationError: Error validating datasource db: the URL must start with the protocol file:`

**Cause:** Schema uses SQLite but production uses PostgreSQL

**Solution:**
1. Verify `prisma/schema.prisma` has `provider = "postgresql"`
2. Regenerate Prisma Client: `npx prisma generate`
3. Restart application

**Prevention:** Always verify schema provider before deployment

---

### Issue 3: Missing Tables

**Error:** `relation "table_name" does not exist`

**Cause:** Migration didn't create the table

**Solution:**
```bash
# 1. Check if migration exists for the table
ls prisma/migrations/

# 2. If missing, create migration
npx prisma migrate dev --name create_missing_table --create-only

# 3. Review migration file
cat prisma/migrations/[timestamp]_create_missing_table/migration.sql

# 4. Deploy migration
npx prisma migrate deploy
```

**Prevention:** Test all migrations locally before deployment

---

### Issue 4: Super Admin Can't Access Modules

**Error:** User is SUPER_ADMIN but can't see CRM, DRM, or Settings pages

**Cause:** Roles and abilities not restored after database reset

**Solution:**
```bash
# Run restore script
node scripts/restore-roles-and-abilities.js

# Logout and login again
# Access should be restored
```

**Prevention:** Always run restore script after database reset

---

### Issue 5: Prerendering Errors

**Error:** `Turbopack Error: Expression expected` or prerendering errors for authenticated pages

**Cause:** Next.js trying to prerender pages that require authentication

**Solution:**
Ensure layout files exist with dynamic rendering config:

**Files that must exist:**
- `src/app/crm/layout.tsx`
- `src/app/drm/layout.tsx`
- `src/app/products/layout.tsx`
- `src/app/crm/accounts/layout.tsx`
- `src/app/crm/leads/layout.tsx`
- `src/app/crm/contacts/layout.tsx`
- `src/app/crm/opportunities/layout.tsx`

**Each layout should have:**
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**Prevention:** Always create layout files for authenticated routes

---

### Issue 6: Missing Upload Directories

**Error:** `File not found at: /app/uploads/...`

**Cause:** Upload directories don't exist or files were deleted

**Solution:**
```bash
# Create upload directories
mkdir -p /app/uploads/branding
mkdir -p /app/uploads/warehouses
mkdir -p /app/uploads/products
mkdir -p /app/uploads/leads
mkdir -p /app/uploads/tasks
mkdir -p /app/uploads/distributors

# Set permissions
chmod -R 755 /app/uploads
```

**Prevention:** Upload directories are created automatically by API routes, but ensure they persist

---

### Issue 7: Authentication Errors

**Error:** `Unauthorized` or `session.user.id is undefined`

**Cause:** Incorrect session user ID access

**Solution:**
All API routes should use:
```typescript
const userId = (session.user as any).id;
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Prevention:** Use consistent pattern for session access across all API routes

---

### Issue 8: Quotations API 500 Error

**Error:** `Failed to fetch quotations` or 500 error

**Cause:** Missing authentication or incorrect filtering

**Solution:**
1. Ensure GET endpoint has authentication
2. Ensure Super Admin role check is implemented
3. Ensure PostgreSQL search uses `mode: 'insensitive'`

**Prevention:** Test all API endpoints before deployment

---

### Issue 9: Supplier Creation Fails

**Error:** `The table public.suppliers does not exist`

**Cause:** Suppliers table migration not run

**Solution:**
```bash
# Run suppliers table migration
npx prisma migrate deploy

# Verify table exists
psql $DATABASE_URL -c "\dt suppliers"
```

**Prevention:** Ensure all migrations are in order and run successfully

---

### Issue 10: Stock Movement Missing Supplier Field

**Error:** No supplier dropdown in stock movement modal

**Cause:** Supplier field not added to form

**Solution:**
- Already fixed in code
- Ensure latest code is deployed
- Ensure suppliers table exists (see Issue 9)

**Prevention:** Test all forms before deployment

---

## 🔍 Verification Checklist

### Database Verification

- [ ] All migrations applied successfully
- [ ] All tables exist (users, roles, abilities, quotations, etc.)
- [ ] All required columns exist:
  - [ ] `quotations.priceListId`
  - [ ] `stock_movements.supplierId`
  - [ ] `quotation_lines.unitPriceCurrency`
  - [ ] `quotation_lines.fxRateUsed`
  - [ ] `quotation_lines.priceListIdUsed`
- [ ] Suppliers table exists
- [ ] Foreign keys are properly set up

### Application Verification

- [ ] Application starts without errors
- [ ] No build errors
- [ ] All API routes respond correctly
- [ ] Authentication works
- [ ] Super Admin can access all modules
- [ ] Quotations can be created
- [ ] Suppliers can be created
- [ ] Stock movements can be created with supplier selection

### Functionality Verification

- [ ] Login works
- [ ] Dashboard loads
- [ ] Quotations page loads
- [ ] Quotation creation works
- [ ] Supplier creation works
- [ ] Stock movement creation works
- [ ] Supplier selection appears in stock movement modal
- [ ] Settings pages are accessible (Super Admin)

---

## 🔄 Rollback Procedures

### If Deployment Fails

#### Option 1: Rollback Code

```bash
# Revert to previous commit
git log --oneline -10  # Find previous good commit
git reset --hard <commit-hash>
git push origin main --force
pm2 restart all
```

#### Option 2: Rollback Migrations

```bash
# Check migration history
npx prisma migrate status

# If migration failed, mark as rolled back
npx prisma migrate resolve --rolled-back <migration-name>

# Fix the migration file
# Then redeploy
npx prisma migrate deploy
```

#### Option 3: Database Reset (Last Resort)

**⚠️ WARNING:** This will delete all data!

```bash
# Only if absolutely necessary
node scripts/reset-database.js

# Then restore roles and abilities
node scripts/restore-roles-and-abilities.js

# Restart application
pm2 restart all
```

---

## 📝 Deployment Scripts

### Complete Deployment Script

Create `scripts/deploy-complete.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

async function deploy() {
  console.log('🚀 Starting complete deployment...\n');

  try {
    // Step 1: Pull latest code
    console.log('📥 Step 1: Pulling latest code...');
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('✅ Code pulled\n');

    // Step 2: Install dependencies
    console.log('📦 Step 2: Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');

    // Step 3: Generate Prisma Client
    console.log('🔧 Step 3: Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated\n');

    // Step 4: Run migrations
    console.log('🗄️  Step 4: Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied\n');

    // Step 5: Restore roles and abilities
    console.log('🔐 Step 5: Restoring roles and abilities...');
    execSync('node scripts/restore-roles-and-abilities.js', { stdio: 'inherit' });
    console.log('✅ Roles and abilities restored\n');

    // Step 6: Build application
    console.log('🏗️  Step 6: Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built\n');

    console.log('🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application (pm2 restart all)');
    console.log('2. Test the application');
    console.log('3. Verify all functionality');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n💡 Check the error above and fix it before continuing');
    process.exit(1);
  }
}

deploy();
```

**Usage:**
```bash
chmod +x scripts/deploy-complete.js
node scripts/deploy-complete.js
```

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Pull latest code
git pull origin main

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Restore roles and abilities
node scripts/restore-roles-and-abilities.js

# Build application
npm run build

# Restart application
pm2 restart all

# Check application logs
pm2 logs

# Check migration status
npx prisma migrate status

# Verify database connection
npx prisma db pull
```

### Essential Scripts

- `scripts/restore-roles-and-abilities.js` - Restore roles and abilities
- `scripts/reset-database.js` - Reset database (use with caution)
- `scripts/run-migrations.js` - Run migrations safely
- `scripts/reset-admin-password.js` - Reset admin password

---

## 📚 Additional Resources

- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

---

## ✅ Final Checklist Before Deployment

- [ ] All code committed and pushed
- [ ] Prisma schema uses PostgreSQL
- [ ] All migrations exist and are in order
- [ ] Environment variables configured
- [ ] NEXTAUTH_SECRET generated
- [ ] Database connection tested
- [ ] Migrations tested locally
- [ ] Build successful locally
- [ ] All scripts are executable
- [ ] Documentation reviewed

---

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check application logs: `pm2 logs`
2. Check database logs
3. Verify environment variables
4. Check migration status: `npx prisma migrate status`
5. Review error messages carefully
6. Check Prisma schema matches database

---

**Remember:** Always test migrations and builds locally before deploying to production!

