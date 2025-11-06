# Port Configuration Guide

## Overview

The system can run on two separate ports for better separation:

- **Port 3000** - Ecommerce (Shop) - `http://localhost:3000`
- **Port 3001** - Admin (Sales Management System) - `http://localhost:3001`

## Development Setup

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Ecommerce:**
```bash
npm run dev:shop
```
Access at: `http://localhost:3000`

**Terminal 2 - Admin:**
```bash
npm run dev:admin
```
Access at: `http://localhost:3001`

### Option 2: Run One at a Time

**Ecommerce only:**
```bash
npm run dev:shop
```

**Admin only:**
```bash
npm run dev:admin
```

## How It Works

The middleware automatically detects the port and routes accordingly:

- **Port 3000** → Ecommerce routes (`/shop`)
  - Blocks admin routes
  - Redirects `/` to `/shop`

- **Port 3001** → Admin routes (`/dashboard`, `/crm`, etc.)
  - Blocks shop routes
  - Redirects `/` to `/dashboard` or `/auth/signin`

## Production Setup

### With Separate Ports

In production, you can run both on different ports and configure your reverse proxy:

**Nginx Configuration:**
```nginx
# Ecommerce (Port 3000)
upstream shop {
    server localhost:3000;
}

# Admin (Port 3001)
upstream admin {
    server localhost:3001;
}

# Main domain → Ecommerce
server {
    listen 443 ssl;
    server_name thepoolshop.africa;
    
    location / {
        proxy_pass http://shop;
    }
}

# Admin subdomain → Admin
server {
    listen 443 ssl;
    server_name sms.thepoolshop.africa;
    
    location / {
        proxy_pass http://admin;
    }
}
```

### With Same Port (Domain-Based Routing)

Alternatively, run a single instance on one port and use domain-based routing (middleware handles this automatically).

## Benefits of Separate Ports

1. **Clear Separation**: Easier to identify which service is running
2. **Independent Scaling**: Can scale shop and admin independently
3. **Easier Debugging**: Separate logs and processes
4. **Development Flexibility**: Test one without affecting the other
5. **Future Microservices**: Easier to split into separate services later

## Environment Variables

Both services share the same database, but you can set different environment variables:

```env
# Shared
DATABASE_URL=postgresql://...

# Ecommerce (Port 3000)
NEXT_PUBLIC_APP_MODE=shop
PORT=3000

# Admin (Port 3001)
NEXT_PUBLIC_APP_MODE=admin
PORT=3001
NEXTAUTH_URL=http://localhost:3001
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Can't Access Routes

- Check you're accessing the correct port
- Verify middleware is detecting the port correctly
- Check browser console for errors

### Both Servers Need Same Database

Both instances connect to the same database, so:
- Products added in admin appear in shop
- Orders from shop appear in admin
- All data is shared

## Testing

1. **Start both servers:**
   ```bash
   # Terminal 1
   npm run dev:shop
   
   # Terminal 2
   npm run dev:admin
   ```

2. **Test Ecommerce:**
   - Visit: `http://localhost:3000`
   - Should redirect to `/shop`
   - Browse products, add to cart

3. **Test Admin:**
   - Visit: `http://localhost:3001`
   - Should redirect to `/dashboard` or `/auth/signin`
   - Login and manage products

4. **Verify Separation:**
   - Try accessing `/dashboard` on port 3000 → Should redirect to `/shop`
   - Try accessing `/shop` on port 3001 → Should redirect to `/dashboard`
