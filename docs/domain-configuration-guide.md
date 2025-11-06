# Domain Configuration Guide

## Overview

The POOLSHOP system is configured to run on two separate domains:

- **`thepoolshop.africa`** - Customer-facing ecommerce site (public)
- **`sms.thepoolshop.africa`** - Sales Management System / Admin panel (private)

### Development: Port-Based Routing

For local development, the system uses port-based routing:
- **Port 3000** - Ecommerce (`http://localhost:3000`)
- **Port 3001** - Admin (`http://localhost:3001`)

See [Port Configuration Guide](./port-configuration.md) for details.

## Domain Setup

### 1. DNS Configuration

Configure your DNS records:

```
# Main domain (Ecommerce)
thepoolshop.africa          A        [Your Server IP]
www.thepoolshop.africa      A        [Your Server IP]

# Admin subdomain
sms.thepoolshop.africa      A        [Your Server IP]
```

### 2. SSL Certificates

Both domains should have SSL certificates:
- Use Let's Encrypt or your preferred SSL provider
- Configure certificates for:
  - `thepoolshop.africa`
  - `www.thepoolshop.africa`
  - `sms.thepoolshop.africa`

### 3. Server Configuration (Nginx/Apache)

#### Nginx Example Configuration

```nginx
# Main domain - Ecommerce
server {
    listen 80;
    listen [::]:80;
    server_name thepoolshop.africa www.thepoolshop.africa;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name thepoolshop.africa www.thepoolshop.africa;
    
    ssl_certificate /path/to/thepoolshop.africa.crt;
    ssl_certificate_key /path/to/thepoolshop.africa.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin subdomain - Sales Management System
server {
    listen 80;
    listen [::]:80;
    server_name sms.thepoolshop.africa;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sms.thepoolshop.africa;
    
    ssl_certificate /path/to/sms.thepoolshop.africa.crt;
    ssl_certificate_key /path/to/sms.thepoolshop.africa.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Environment Variables

Update your `.env` file:

```env
# Application URLs
NEXT_PUBLIC_ECOMMERCE_URL=https://thepoolshop.africa
NEXT_PUBLIC_ADMIN_URL=https://sms.thepoolshop.africa

# Database (shared)
DATABASE_URL=postgresql://...

# Session/Cookie settings
NEXTAUTH_URL=https://sms.thepoolshop.africa
NEXTAUTH_SECRET=your-secret-key

# Cookie domain for cross-subdomain sessions (if needed)
NEXT_PUBLIC_COOKIE_DOMAIN=.thepoolshop.africa
```

## How It Works

### Domain-Based Routing

The middleware (`src/middleware.ts`) automatically detects which domain is being accessed:

1. **Admin Domain** (`sms.thepoolshop.africa`):
   - Routes to `/dashboard` if logged in
   - Routes to `/auth/signin` if not logged in
   - Blocks access to `/shop` routes
   - Shows admin layout (sidebar, navigation)

2. **Main Domain** (`thepoolshop.africa`):
   - Root (`/`) redirects to `/shop`
   - Shows customer-facing ecommerce site
   - Blocks access to admin routes (`/dashboard`, `/crm`, etc.)
   - Uses standalone shop layout (no admin sidebar)

### Shared Resources

Both domains share:
- **Database**: Same Prisma database
- **API Routes**: Accessible from both domains
- **Product Data**: Admin manages products, ecommerce displays them
- **Orders**: Ecommerce creates orders, admin manages them

### Separate Interfaces

- **Admin (`sms.thepoolshop.africa`)**:
  - Product management
  - Inventory control
  - Order processing
  - Customer management
  - Reports and analytics

- **Ecommerce (`thepoolshop.africa`)**:
  - Product browsing
  - Shopping cart
  - Checkout
  - Order placement

## Development Setup

### Local Development

For local development, you can simulate domains using `/etc/hosts`:

```bash
# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 thepoolshop.local
127.0.0.1 sms.thepoolshop.local
```

Then access:
- `http://thepoolshop.local:3000` - Ecommerce
- `http://sms.thepoolshop.local:3000` - Admin

Or use the default localhost:
- `http://localhost:3000/shop` - Ecommerce (manual)
- `http://localhost:3000/dashboard` - Admin (manual)

## Testing Domains

### Test Ecommerce Site
1. Visit: `https://thepoolshop.africa`
2. Should automatically redirect to `/shop`
3. Browse products, add to cart, checkout

### Test Admin System
1. Visit: `https://sms.thepoolshop.africa`
2. Should redirect to `/auth/signin` or `/dashboard` (if logged in)
3. Manage products, view orders, etc.

## Security Considerations

1. **Cookie Settings**: 
   - Admin cookies should be domain-specific (`.sms.thepoolshop.africa`)
   - Shop cookies should be domain-specific (`thepoolshop.africa`)
   - No cross-domain cookie sharing needed

2. **CORS**: 
   - API routes accessible from both domains
   - Configure CORS if needed for external API access

3. **Session Management**:
   - Admin sessions only valid on admin domain
   - Shop cart sessions only valid on main domain
   - Separate session storage

## Troubleshooting

### Domain Not Routing Correctly

1. Check middleware is active: `src/middleware.ts`
2. Verify hostname detection in browser console
3. Check server logs for routing decisions

### Admin Routes Accessible on Main Domain

- Middleware should block this automatically
- Check if middleware is running correctly
- Verify domain detection logic

### Shop Routes Accessible on Admin Domain

- Middleware redirects `/shop` to `/dashboard` on admin domain
- Check redirect logic in middleware

### Session/Cookie Issues

- Ensure cookies are domain-specific
- Check browser console for cookie errors
- Verify `NEXTAUTH_URL` matches admin domain

## Deployment Checklist

- [ ] DNS records configured
- [ ] SSL certificates installed
- [ ] Server proxy configured (Nginx/Apache)
- [ ] Environment variables set
- [ ] Domain routing tested
- [ ] Admin system accessible on `sms.thepoolshop.africa`
- [ ] Ecommerce accessible on `thepoolshop.africa`
- [ ] Orders flow from ecommerce to admin
- [ ] Cookies work correctly on each domain
- [ ] SSL certificates valid and auto-renewing

## Next Steps

1. Configure DNS records
2. Set up SSL certificates
3. Deploy to production server
4. Test both domains
5. Monitor for any routing issues
6. Set up domain-specific monitoring/analytics
