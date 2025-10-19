# Post-Deployment Checklist

## ✅ Deployment Successful!

Your application is now deployed on Hostinger Easy Panel. Follow these steps to complete the setup:

## Step 1: Run Database Migrations

Open the terminal in Hostinger Easy Panel and run:

### Option 1: Using the deployment script (Recommended)
```bash
node scripts/deploy-migrations.js
```

### Option 2: Using bash script
```bash
bash scripts/simple-deploy.sh
```

### Option 3: Manual commands (if npx doesn't work)
```bash
# Generate Prisma Client
node ./node_modules/prisma/build/index.js generate

# Deploy database migrations
node ./node_modules/prisma/build/index.js migrate deploy

# Seed the database with initial data
node ./node_modules/tsx/dist/cli.mjs scripts/seed-postgres.ts
```

**What this does:**
- Creates all database tables (users, products, orders, invoices, etc.)
- Sets up relationships and constraints
- Creates default data:
  - Admin user: `admin@adpools.com` / `admin123`
  - Default currencies (USD, GHS)
  - Sample categories
  - Main warehouse
  - System settings (branding, colors, etc.)

## Step 2: Verify Environment Variables

Make sure these are set in Hostinger Easy Panel:

### Required Variables:
- ✅ `DATABASE_URL` - PostgreSQL connection string (should already be set)
- ✅ `NEXTAUTH_URL` - Your application URL (e.g., `https://yourdomain.com`)
- ✅ `NEXTAUTH_SECRET` - Random 32-character secret

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 3: Test Your Application

### Access the Login Page
1. Visit your deployed URL
2. You should see the login page with your company branding

### Login with Admin Credentials
```
Email: admin@adpools.com
Password: admin123
```

### Test Core Features:
- ✅ Dashboard loads correctly
- ✅ Products page displays
- ✅ Orders can be created
- ✅ Inventory management works
- ✅ CRM module is visible (if you're SUPER_ADMIN)
- ✅ Settings page accessible

## Step 4: Configure Your Domain (Optional)

If you want to use a custom domain:

1. **In Hostinger Easy Panel:**
   - Go to your application settings
   - Add your custom domain
   - Note the provided DNS records

2. **In Your Domain Registrar:**
   - Add the DNS records provided by Hostinger
   - Wait for DNS propagation (can take up to 24 hours)

3. **Update Environment Variable:**
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   ```

## Step 5: Security Setup

### Change Default Admin Password
1. Login as admin
2. Go to Settings → Users
3. Change the admin password immediately

### Update Branding
1. Go to Settings → Company
2. Upload your logo
3. Set your company colors
4. Update company information

## Step 6: Create Additional Users

1. Go to Settings → Users
2. Create user accounts for your team
3. Assign appropriate roles:
   - `SUPER_ADMIN` - Full system access
   - `ADMIN` - Administrative access
   - `SALES_MANAGER` - Sales and orders
   - `SALES_REP` - Limited sales access
   - `WAREHOUSE_MANAGER` - Inventory management
   - `ACCOUNTANT` - Financial access

## Troubleshooting

### Issue: "Database connection failed"
**Solution:** Check that your `DATABASE_URL` is correct and the database service is running.

### Issue: "Login doesn't work"
**Solution:** 
1. Verify `NEXTAUTH_URL` matches your actual domain
2. Verify `NEXTAUTH_SECRET` is set
3. Check browser console for errors

### Issue: "Pages not loading"
**Solution:**
1. Check application logs in Hostinger Easy Panel
2. Verify all environment variables are set
3. Restart the application

### Issue: "Images not uploading"
**Solution:** Ensure the `/uploads` directory has write permissions.

## Next Steps

### Set Up Data
1. **Add Products:** Go to Products → Add Product
2. **Add Customers:** Go to CRM → Accounts/Contacts
3. **Add Warehouses:** Go to Settings → Warehouses
4. **Configure Categories:** Go to Settings → Categories

### Configure Settings
1. **Payment Settings:** Settings → Payments
2. **Email/SMS:** Settings → Communication
3. **Inventory Settings:** Settings → Inventory
4. **Credit Terms:** Settings → Credit

### Train Your Team
1. Create user accounts
2. Share login credentials
3. Show them the dashboard
4. Explain key features

## Support

If you encounter any issues:
1. Check the application logs in Hostinger Easy Panel
2. Review the error messages
3. Check the documentation in `/docs`
4. Verify all environment variables are correct

## Important Notes

⚠️ **Security Reminders:**
- Change the default admin password immediately
- Use strong passwords for all accounts
- Regularly backup your database
- Keep your `NEXTAUTH_SECRET` secure
- Never commit `.env` files to git

🎉 **Congratulations!**
Your AdPools Group application is now live and ready to use!

