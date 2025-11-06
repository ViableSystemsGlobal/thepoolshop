# 🚀 Production Setup Guide - EasyPanel

## ⚠️ CRITICAL: Database Setup

Your login is failing because the production database needs to be set up. Follow these steps **exactly**:

---

## Step 1: Update Environment Variables

In EasyPanel, go to your app settings → Environment Variables and ensure these are set:

```bash
# Database (PostgreSQL - should already be set by EasyPanel)
DATABASE_URL=postgres://...your-postgres-url...

# NextAuth - CRITICAL for authentication
NEXTAUTH_URL=https://sms.thepoolshop.africa
NEXTAUTH_SECRET=k5prOOB4Xrtk5RglbKDxvaK7VflPKj7V0Ep6LQw+0NU=

# Domains
ECOMMERCE_DOMAIN=thepoolshop.africa
ADMIN_DOMAIN=sms.thepoolshop.africa
NEXT_PUBLIC_APP_URL=https://thepoolshop.africa

# Paystack (for e-commerce payments)
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

---

## Step 2: Run Database Migrations & Seed

### Option A: Using EasyPanel Terminal (Recommended)

1. **Open Terminal** in EasyPanel (click the terminal icon on your app)

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed Database with Admin User:**
   ```bash
   npx tsx scripts/deploy-seed.ts
   ```

### Option B: Using Manual Commands

If `npx` doesn't work:
```bash
node ./node_modules/prisma/build/index.js generate
node ./node_modules/prisma/build/index.js migrate deploy
node ./node_modules/tsx/dist/cli.mjs scripts/deploy-seed.ts
```

---

## Step 3: Verify & Login

### What the seed script creates:
- ✅ Admin user with password
- ✅ Default currencies (USD, GHS)
- ✅ Exchange rates (USD → GHS)
- ✅ Pool equipment categories
- ✅ Main warehouse
- ✅ System settings (branding, tax rate, etc.)

### Login Credentials:
```
Email: admin@thepoolshop.africa
Password: admin123
```

### Login URLs:
- **Admin/Management System:** https://sms.thepoolshop.africa
- **E-commerce Shop:** https://thepoolshop.africa

---

## Step 4: Post-Login Setup

### 1. Change Admin Password
1. Go to Settings → Profile
2. Change password from `admin123` to something secure

### 2. Configure Company Settings
1. Go to Settings → Company
2. Upload your logo
3. Set your company details

### 3. Add Products
1. Go to Inventory → Products
2. Add your pool equipment products

### 4. Configure Paystack (if using online payments)
1. Update `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` in environment variables
2. Set webhook URL in Paystack dashboard: `https://thepoolshop.africa/api/public/shop/payment/webhook`

---

## Troubleshooting

### ❌ "401 Unauthorized" on login
**Cause:** Database not seeded or NEXTAUTH_SECRET mismatch

**Fix:**
1. Verify `NEXTAUTH_URL=https://sms.thepoolshop.africa` (no trailing slash!)
2. Verify `NEXTAUTH_SECRET` matches the one used during build
3. Run seed script: `npx tsx scripts/deploy-seed.ts`
4. Restart the application in EasyPanel

### ❌ "Database connection error"
**Cause:** DATABASE_URL incorrect or database not accessible

**Fix:**
1. Check `DATABASE_URL` in environment variables
2. Ensure PostgreSQL database is running in EasyPanel
3. Test connection: `npx prisma db push`

### ❌ "Cannot find module 'bcryptjs'"
**Cause:** Dependencies not installed

**Fix:**
```bash
npm install
npm run build
```
Then restart the app

### ❌ "Prisma Client not generated"
**Fix:**
```bash
npx prisma generate
```
Then restart the app

---

## Security Checklist

Before going live:
- [ ] Changed admin password from `admin123`
- [ ] Updated `NEXTAUTH_SECRET` to a secure random value
- [ ] Verified `NEXTAUTH_URL` matches your domain exactly
- [ ] SSL certificates active on both domains
- [ ] Paystack webhook configured (if using payments)
- [ ] Database backups enabled in EasyPanel

---

## Need Help?

If you're still getting 401 errors:
1. Check EasyPanel logs (click "Logs" in your app)
2. Look for authentication errors
3. Verify all environment variables are set correctly
4. Try logging out and clearing browser cookies
5. Restart the application in EasyPanel

