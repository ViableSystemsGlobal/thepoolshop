# Ecommerce Integration Guide

## Overview
This guide documents the new ecommerce storefront integration with the existing Sales Management System. The ecommerce site allows customers to browse products, add them to cart, and complete purchases online, while all order management happens through the existing admin system.

## Domain Configuration

The system runs on two separate domains:

- **`thepoolshop.africa`** - Customer-facing ecommerce site (public, no login required)
- **`sms.thepoolshop.africa`** - Sales Management System / Admin panel (private, login required)

See [Domain Configuration Guide](./domain-configuration-guide.md) for detailed setup instructions.

## Architecture

### Frontend Structure
```
/shop                     - Public ecommerce site
├── /                    - Product catalog with filters
├── /products/[id]       - Product detail page  
├── /cart                - Shopping cart
└── /checkout            - Checkout flow
```

### API Structure
```
/api/public/shop         - Public ecommerce APIs
├── /products            - Product listing and details
├── /categories          - Product categories
├── /cart                - Cart management (session-based)
└── /checkout            - Order processing
```

## Key Features

### 1. Product Catalog
- Browse all active products from admin inventory
- Search and filter by category
- Sort by price, name, or newest
- Real-time stock availability from admin system
- Low stock warnings
- Discount display (original vs current price)

### 2. Shopping Cart
- Session-based cart (7-day persistence via cookies)
- Add/remove/update quantities
- Stock validation on each cart action
- Cart persists without login
- Automatic stock checking

### 3. Checkout Process
- Guest checkout (no account required)
- Customer information collection
- Shipping and billing addresses
- Multiple payment methods:
  - Cash on Delivery
  - Bank Transfer
  - Mobile Money
- Order notes/special instructions

### 4. Admin Integration
When a customer completes an order:
1. **Lead Creation**: Customer is added as a new lead in CRM
2. **Quotation**: Order creates a quotation record
3. **Invoice**: Automatically generates invoice from quotation  
4. **Stock Update**: Inventory levels are adjusted
5. **Stock Movements**: Movement records track the sale

## Database Integration

### Customer Data Flow
```
Customer Order → Lead (if new) → Quotation → Invoice → Stock Updates
```

### Key Models Used
- `Product` - Product catalog
- `Category` - Product categorization
- `StockItem` - Inventory levels
- `Lead` - Customer records
- `Quotation` - Order quotes
- `Invoice` - Order invoices
- `StockMovement` - Inventory tracking

## Session Management

### Cart Storage
- Uses HTTP-only cookies for security
- Cart ID: `cart_session` cookie (UUID)
- Cart Data: `cart_{id}` cookie (JSON)
- 7-day expiration
- Server-side validation on each request

## Security Considerations

1. **No Authentication Required**: Shop is public
2. **Session Security**: HTTP-only cookies prevent XSS
3. **Stock Validation**: Real-time checks prevent overselling
4. **Input Validation**: All user inputs validated
5. **Admin Isolation**: Shop uses separate `/api/public` endpoints

## Configuration

### Environment Variables
No additional environment variables needed - uses existing database connection.

### Currency
Default currency is GHS (Ghanaian Cedi). To change:
- Update `baseCurrency` in product creation
- Modify formatPrice functions in components

### Tax Rate
VAT is set at 12.5%. To modify:
- Update tax calculation in `/api/public/shop/cart/route.ts`
- Update tax calculation in `/api/public/shop/checkout/route.ts`

## Testing the Integration

### 1. Product Setup (Admin)
1. Login to admin system
2. Add products with prices and stock
3. Ensure products are marked as active
4. Assign categories

### 2. Shop Testing
1. Visit `/shop` to browse products
2. Use search and filters
3. Add products to cart
4. View cart at `/shop/cart`
5. Proceed to checkout
6. Complete test order

### 3. Verify in Admin
1. Check Leads section for new customer
2. View Quotations for order quote
3. Check Invoices for generated invoice
4. Verify stock levels updated
5. Review stock movements

## Customization

### Styling
- Components use Tailwind CSS
- Modify color scheme in component files
- Update layout in `/shop/layout.tsx`

### Features to Add
- Customer accounts/login
- Order history
- Wishlist/favorites
- Product reviews
- Email notifications
- Payment gateway integration
- Shipping calculations
- Coupon/discount codes

## Deployment Considerations

1. **Performance**
   - Consider caching product data
   - Implement pagination limits
   - Optimize image delivery

2. **Scalability**
   - Move cart to database for persistence
   - Add Redis for session management
   - Implement rate limiting

3. **SEO**
   - Add meta tags to product pages
   - Implement sitemap generation
   - Add structured data markup

## Troubleshooting

### Cart Not Persisting
- Check cookie settings in browser
- Verify `NODE_ENV` for secure cookie flag
- Check cookie size limits (4KB max)

### Stock Issues
- Verify products have stock items
- Check warehouse assignments
- Review stock movement logs

### Order Creation Fails
- Ensure admin user exists for system assignment
- Check lead email uniqueness
- Verify all required fields submitted

## API Reference

### GET /api/public/shop/products
Query parameters:
- `search` - Search term
- `category` - Category ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `sort` - Sort order (newest|price-asc|price-desc|name)

### POST /api/public/shop/products
Get single product details:
```json
{
  "productId": "product-id-here"
}
```

### GET /api/public/shop/cart
Returns current cart contents

### POST /api/public/shop/cart
Add item to cart:
```json
{
  "productId": "product-id",
  "quantity": 1
}
```

### PUT /api/public/shop/cart
Update quantity:
```json
{
  "productId": "product-id",
  "quantity": 2
}
```

### DELETE /api/public/shop/cart
Clear entire cart

### POST /api/public/shop/checkout
Process order:
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0244000000"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Accra",
    "region": "Greater Accra",
    "country": "Ghana"
  },
  "paymentMethod": "CASH",
  "notes": "Please call before delivery"
}
```

## Next Steps

1. **Payment Integration**: Connect with payment gateways (Paystack, Flutterwave)
2. **Customer Accounts**: Add registration and login
3. **Email Notifications**: Send order confirmations
4. **Mobile App**: Create React Native app using same APIs
5. **Analytics**: Add conversion tracking and analytics

## Support

For issues or questions about the ecommerce integration:
1. Check this documentation
2. Review the code in `/src/app/shop` and `/src/app/api/public/shop`
3. Check admin system logs for order processing issues
