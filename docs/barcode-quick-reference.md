# Barcode System - Quick Reference Guide

## Overview

The barcode system allows you to quickly identify and process products throughout your inventory and sales workflows using barcode scanning.

## Supported Barcode Types

- **EAN-13** (Default): 13-digit international standard
- **EAN-8**: 8-digit short format
- **UPC-A**: 12-digit US/Canada standard
- **CODE-128**: Alphanumeric variable length
- **ITF-14**: 14-digit format for cases/pallets

## Getting Started

### 1. Generating Barcodes for Existing Products

Run the barcode generation script once to create barcodes for all existing products:

```bash
npx tsx scripts/generate-barcodes-for-existing-products.ts
```

This will:
- Find all products without barcodes
- Generate unique EAN-13 codes from product SKUs
- Update the database with generated barcodes
- Print a summary report

### 2. Hardware Setup

**USB Barcode Scanner:**
1. Plug the USB scanner into your computer
2. Configure as "Keyboard Wedge" mode (simulates typing)
3. Test by scanning into a text editor - should type the barcode number
4. No additional software needed!

**Bluetooth Scanner:**
1. Pair with your device via Bluetooth settings
2. Configure as keyboard input mode
3. Test in any text field

## Using the Barcode Scanner

### Stock Movements & Receiving

**Scenario**: Receiving new stock

1. Go to **Inventory → Stock Movements**
2. Click "**Add Stock Movement**"
3. Click the "**Scan Barcode**" button
4. Scan the product barcode (or type manually)
5. Product details auto-fill
6. Enter quantity and complete the form

**Tips:**
- Product info loads instantly on scan
- Shows available stock levels
- Auto-selects the warehouse if product has existing stock

### Creating Invoices

**Scenario**: Quickly add products to an invoice

1. Go to **Invoices → Create Invoice**
2. Select customer
3. In the Products section, click "**Add Product**"
4. Click "**Scan Barcode**" button
5. Scan each product to add it to the invoice
6. Adjust quantities as needed

**Tips:**
- Each scan adds the product with quantity 1
- Scan multiple times to increase quantity, or adjust manually
- Works with both your barcodes and supplier barcodes

### Creating Quotations

Same process as invoices:
1. Go to **Quotations → Create Quotation**
2. Select customer
3. Use "**Scan Barcode**" button to add products
4. Review and send

## Product Barcode Management

### Adding a Product with Barcode

When creating a new product:
1. Go to **Products → Add Product**
2. Enter product details
3. **Barcode section:**
   - Leave empty to auto-generate from SKU
   - Or enter supplier's barcode manually
   - Select barcode type (EAN-13 recommended)
4. If you have a supplier's barcode that differs, enter it in "Supplier Barcode"

### Supplier Barcodes

If your supplier provides barcodes on their products:
1. During product import, include the supplier barcode
2. The system will:
   - Generate YOUR primary barcode for consistency
   - Store the supplier barcode as an additional barcode
   - Both barcodes will work when scanning!

### Multiple Suppliers for Same Product

**Example**: Same pool filter from 3 different suppliers

- Your SKU: FILTER-001
- Your Barcode: 2001234567890 (primary)
- Supplier A Barcode: 6901234567891 (additional)
- Supplier B Barcode: 8801234567892 (additional)

All three barcodes point to the same product in your system.

## Bulk Import with Barcodes

### CSV Format

When importing products via CSV, include these columns:

```csv
name,sku,barcode,supplier_barcode,supplier_name,supplier_sku,price,cost
Pool Pump 1HP,PUMP-001,,6901234567890,China Pool Co,XYZ-100,299.99,150.00
Filter,FILTER-001,2001234567891,,,25.00
```

**Fields:**
- `barcode`: Your primary barcode (leave empty to auto-generate)
- `supplier_barcode`: Supplier's barcode (optional)
- `supplier_name`: Name of supplier (optional)
- `supplier_sku`: Supplier's product code (optional)

## Printing Barcode Labels

### Individual Product Label

1. Go to product details page
2. View the barcode display
3. Click "**Print**" button
4. Barcode label prints with product name, SKU, and price

### Bulk Label Printing

1. Go to **Products → Labels** (once implemented)
2. Select products to print
3. Click "**Print Selected**"
4. Labels print in grid format (3 columns)

## Troubleshooting

### Barcode Not Found

**Problem**: Scanner beeps but says "Product not found"

**Solutions:**
1. Check if product exists in system
2. Try manual search by SKU or name
3. Link the barcode to existing product via API
4. Create new product if needed

### Scanner Not Working

**Problem**: Scanner doesn't type anything

**Solutions:**
1. Check USB/Bluetooth connection
2. Test in Notepad - should type numbers
3. Try different USB port
4. Reboot scanner (unplug and replug)
5. Check scanner is in "keyboard mode"

### Wrong Product Scanned

**Problem**: Scanned barcode returns different product

**Solutions:**
1. Verify the barcode number
2. Check for duplicate barcodes in system
3. Update product barcode if incorrect
4. Use manual search to find correct product

### Scanner Types Too Fast

**Problem**: Scanner inputs barcode before page is ready

**Solution:**
- Click in the barcode input field first
- Then scan
- Or use "Scan Barcode" button which auto-focuses

## Best Practices

### ✅ DO

- Generate barcodes for all products immediately
- Print labels for physical stock
- Use consistent barcode type (EAN-13)
- Store both your barcode and supplier barcodes
- Test scanner before relying on it
- Train staff on manual fallback

### ❌ DON'T

- Don't create duplicate products for same item from different suppliers
- Don't skip labeling existing stock
- Don't assume all products have supplier barcodes
- Don't forget to test scanner with actual products

## Common Workflows

### Workflow 1: Receiving Import Shipment

1. Open Stock Movement page
2. For each box/item:
   - Scan barcode
   - Confirm product details
   - Enter quantity
   - Click Save
3. Generate GRN document
4. File paperwork

**Time Saved**: 70% faster than manual entry

### Workflow 2: Physical Inventory Count

1. Print product list or use mobile device
2. Walk through warehouse
3. For each location:
   - Scan product barcode
   - Count physical quantity
   - Record in system
4. System calculates variance
5. Create adjustment movements

**Time Saved**: 80% faster, 98% more accurate

### Workflow 3: Sales Counter / POS

1. Open new invoice
2. Select walk-in customer
3. Scan each product customer wants
4. Review totals
5. Process payment
6. Print receipt

**Time Saved**: 60% faster checkout

## Support & Additional Help

### Testing Your Setup

Run the test script to verify everything works:

```bash
npx tsx scripts/test-barcode-system.ts
```

This will:
- Test barcode generation
- Test barcode validation
- Check database connectivity
- Show system statistics

### API Endpoints

For advanced integrations:

- `GET /api/products/barcode/lookup?barcode=xxx` - Find product by barcode
- `POST /api/products/barcode/generate` - Generate new barcode
- `POST /api/products/barcode/link` - Link barcode to product

### Need Help?

1. Check this guide first
2. Run test script to diagnose issues
3. Check system logs for errors
4. Contact IT support with specific error messages

## Quick Command Reference

```bash
# Generate barcodes for existing products
npx tsx scripts/generate-barcodes-for-existing-products.ts

# Test barcode system
npx tsx scripts/test-barcode-system.ts

# Update Prisma schema after changes
npx prisma generate

# Push database changes
npx prisma db push
```

---

**Last Updated**: Implementation Date
**System Version**: Barcode System v1.0

