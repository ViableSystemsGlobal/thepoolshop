# EasyPanel Deployment Guide for E-commerce

## Domain Configuration

### 1. E-commerce Domain Setup (`thepoolshop.africa`)

When deploying on EasyPanel, you need to configure the domain routing. The application uses Next.js middleware to route between the e-commerce shop and admin panel based on the domain.

#### Option A: Using Domain-Based Routing (Recommended for Production)

1. **In EasyPanel Dashboard:**
   - Go to your application settings
   - Navigate to **Domains** section
   - Add the domain: `thepoolshop.africa`
   - Ensure SSL certificate is enabled (Let's Encrypt)

2. **Environment Variables:**
   Add these environment variables in EasyPanel:
   ```bash
   # Domains
   ECOMMERCE_DOMAIN=thepoolshop.africa
   ADMIN_DOMAIN=sms.thepoolshop.africa
   NEXT_PUBLIC_APP_URL=https://thepoolshop.africa
   
   # Paystack (for payment gateway)
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
   
   # Database
   DATABASE_URL=your_database_url
   
   # NextAuth
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://sms.thepoolshop.africa
   ```

3. **Configure Webhook URL in Paystack:**
   - Go to Paystack Dashboard → Settings → Webhooks
   - Add webhook URL: `https://thepoolshop.africa/api/public/shop/payment/webhook`
   - Select event: `charge.success`

#### Option B: Using Port-Based Routing (For Development)

If you're using port-based routing for development:

1. **In EasyPanel:**
   - Create two separate applications or use port mapping
   - E-commerce: Port 3000 → `thepoolshop.africa`
   - Admin: Port 3001 → `sms.thepoolshop.africa`

2. **Environment Variables:**
   ```bash
   # Use port-based routing
   USE_PORT_ROUTING=true
   SHOP_PORT=3000
   ADMIN_PORT=3001
   ```

### 2. Admin Domain Setup (`sms.thepoolshop.africa`)

1. **In EasyPanel Dashboard:**
   - Go to your application settings
   - Navigate to **Domains** section
   - Add the domain: `sms.thepoolshop.africa`
   - Ensure SSL certificate is enabled

2. **Configure NEXTAUTH_URL:**
   ```bash
   NEXTAUTH_URL=https://sms.thepoolshop.africa
   ```

## Deployment Steps

### 1. Build Configuration

The application uses separate build directories for shop and admin to prevent conflicts. Make sure your build command handles this:

```bash
# Build for production
npm run build

# Or for development
npm run dev:shop  # Port 3000
npm run dev:admin # Port 3001
```

### 2. Database Migration

Before deploying, run database migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Environment Variables Checklist

Ensure all these are set in EasyPanel:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random secret for NextAuth
- [ ] `NEXTAUTH_URL` - Admin panel URL (https://sms.thepoolshop.africa)
- [ ] `NEXT_PUBLIC_APP_URL` - E-commerce URL (https://thepoolshop.africa)
- [ ] `ECOMMERCE_DOMAIN` - thepoolshop.africa
- [ ] `ADMIN_DOMAIN` - sms.thepoolshop.africa
- [ ] `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- [ ] `PAYSTACK_PUBLIC_KEY` - Your Paystack public key (optional, for frontend)

### 4. Middleware Configuration

The middleware (`src/middleware.ts`) automatically routes requests based on domain:

- `thepoolshop.africa` → E-commerce shop (`/shop`)
- `sms.thepoolshop.africa` → Admin dashboard (`/dashboard`)

No additional configuration needed if domains are correctly set.

## Domain DNS Configuration

### For `thepoolshop.africa`:

1. **Add A Record:**
   ```
   Type: A
   Name: @ (or thepoolshop)
   Value: [Your EasyPanel server IP]
   TTL: 3600
   ```

2. **Add CNAME for www (optional):**
   ```
   Type: CNAME
   Name: www
   Value: thepoolshop.africa
   TTL: 3600
   ```

### For `sms.thepoolshop.africa`:

1. **Add A Record:**
   ```
   Type: A
   Name: sms
   Value: [Your EasyPanel server IP]
   TTL: 3600
   ```

## Testing After Deployment

1. **Test E-commerce:**
   - Visit: `https://thepoolshop.africa`
   - Should redirect to `/shop`
   - Test product listing, cart, checkout

2. **Test Admin:**
   - Visit: `https://sms.thepoolshop.africa`
   - Should redirect to `/dashboard`
   - Test login and admin features

3. **Test Payment Gateway:**
   - Place a test order on e-commerce
   - Complete payment via Paystack
   - Verify webhook receives payment confirmation
   - Check admin payments page for payment record

## Troubleshooting

### Domain Not Routing Correctly

1. Check middleware is enabled in `next.config.js`
2. Verify environment variables are set correctly
3. Check DNS records are propagated (can take up to 48 hours)
4. Clear browser cache and cookies

### Payment Webhook Not Working

1. Verify webhook URL is correct in Paystack dashboard
2. Check webhook endpoint is accessible: `https://thepoolshop.africa/api/public/shop/payment/webhook`
3. Check server logs for webhook errors
4. Verify `PAYSTACK_SECRET_KEY` is correct

### Build Errors

1. Ensure Node.js version matches (check `package.json` engines)
2. Clear build cache: `rm -rf .next .next-shop .next-admin`
3. Reinstall dependencies: `npm ci`
4. Check for TypeScript errors: `npm run type-check`

## Additional Resources

- [EasyPanel Documentation](https://easypanel.io/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Paystack Webhook Documentation](https://paystack.com/docs/payments/webhooks/)

