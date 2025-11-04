# 🧪 Complete System Testing Guide

A comprehensive step-by-step guide to test all features of the AdPools Group system.

---

## 📋 Pre-Testing Setup

### 1. Verify Development Environment
```bash
# Make sure you're in the project directory
cd /Users/nanasasu/Desktop/adpoolsgroup

# Check if database exists
ls -la prisma/dev.db

# Start the development server
npm run dev
```

### 2. Clear Browser Data (Recommended)
- Clear browser cache
- Open in incognito/private window
- Or use a fresh browser session

---

## 🔐 Phase 1: Authentication & Access Control

### Test 1.1: Login
- [ ] Navigate to `http://localhost:3000`
- [ ] Should redirect to `/auth/signin`
- [ ] Enter credentials:
  - **Email**: `admin@adpools.com`
  - **Password**: `admin123`
- [ ] Click "Sign In"
- [ ] Should redirect to `/dashboard`
- [ ] Sidebar should be visible

**Expected Result**: Successful login, dashboard loads

---

### Test 1.2: Invalid Credentials
- [ ] Logout (or clear session)
- [ ] Try login with wrong password
- [ ] Should show error message
- [ ] Should NOT redirect

**Expected Result**: Error message shown, stay on login page

---

### Test 1.3: Session Persistence
- [ ] Login successfully
- [ ] Refresh page (F5)
- [ ] Should stay logged in
- [ ] Close browser and reopen
- [ ] Navigate to `http://localhost:3000`
- [ ] Should auto-login if session valid

**Expected Result**: Session persists across refreshes

---

## 🎨 Phase 2: Theme & Appearance

### Test 2.1: Preset Color Selection
- [ ] Navigate to `/settings/appearance`
- [ ] See 8 preset color options
- [ ] Click on a preset color (e.g., Blue)
- [ ] Should save immediately
- [ ] Check sidebar - should update with new color
- [ ] Refresh page - color should persist

**Expected Result**: Theme changes immediately and persists

---

### Test 2.2: Custom Color Picker
- [ ] Still on `/settings/appearance`
- [ ] Scroll to "Custom Color" section
- [ ] Click on color picker input
- [ ] Select a custom color (e.g., `#FF5733`)
- [ ] Verify hex code updates in text field
- [ ] Click "Use Custom Color" button
- [ ] Should save to database
- [ ] Sidebar should update with custom color
- [ ] Check if custom color shows in sidebar navigation

**Expected Result**: Custom color saves and applies system-wide

---

### Test 2.3: Theme Preview Mode
- [ ] On `/settings/appearance`
- [ ] Click "Preview Changes" button
- [ ] Select a different color
- [ ] See preview update
- [ ] Click "Apply Changes" - should save
- [ ] OR click "Cancel Preview" - should revert

**Expected Result**: Preview mode works correctly

---

### Test 2.4: Navigation Visibility with Custom Colors
- [ ] Set a custom color
- [ ] Navigate to different pages (Dashboard, Products, etc.)
- [ ] Check sidebar - all navigation items should be visible
- [ ] "Home" should not disappear
- [ ] Inactive items should show in gray
- [ ] Active items should show with theme color background

**Expected Result**: All navigation items always visible, proper colors

---

## 📊 Phase 3: Dashboard

### Test 3.1: Dashboard Loads
- [ ] Navigate to `/dashboard` (or click "Home" in sidebar)
- [ ] Dashboard should load
- [ ] Should show metrics cards
- [ ] Should show AI recommendations section (if implemented)

**Expected Result**: Dashboard displays without errors

---

### Test 3.2: Dashboard Metrics
- [ ] Verify all metric cards display
- [ ] Check if numbers are correct
- [ ] Verify icons and colors match theme
- [ ] Check responsive layout (resize browser)

**Expected Result**: Metrics display correctly

---

## 🛍️ Phase 4: Products & Inventory

### Test 4.1: View Products
- [ ] Navigate to `/products`
- [ ] Products list should load
- [ ] Check pagination works
- [ ] Try filtering/searching (if available)
- [ ] Verify table displays correctly

**Expected Result**: Products page loads and displays data

---

### Test 4.2: Create Product
- [ ] On `/products` page
- [ ] Click "Add Product" or "+" button
- [ ] Fill in product form:
  - Name
  - SKU
  - Category
  - Price
  - Cost
  - Description (optional)
- [ ] Click "Save" or "Create"
- [ ] Should show success message
- [ ] New product should appear in list

**Expected Result**: Product created successfully

---

### Test 4.3: Edit Product
- [ ] Find a product in the list
- [ ] Click "Edit" or product name
- [ ] Change some fields
- [ ] Save changes
- [ ] Verify changes reflect in list

**Expected Result**: Product updates correctly

---

### Test 4.4: Barcode System
- [ ] Create or edit a product
- [ ] Check "Generate Barcode" option
- [ ] Save product
- [ ] Verify barcode appears
- [ ] Try barcode scanner (if available)
- [ ] Test barcode lookup functionality

**Expected Result**: Barcodes generate and work correctly

---

### Test 4.5: Stock Management
- [ ] Navigate to inventory/stock page
- [ ] View current stock levels
- [ ] Test stock movements:
  - Add stock
  - Remove stock
  - Adjust stock
- [ ] Verify stock updates correctly

**Expected Result**: Stock management works

---

## 👥 Phase 5: CRM (Customer Relationship Management)

### Test 5.1: Leads Management
- [ ] Navigate to `/crm/leads`
- [ ] View leads list
- [ ] Create a new lead:
  - Name
  - Email/Phone
  - Company
  - Status
  - Source
- [ ] Save lead
- [ ] Verify lead appears in list

**Expected Result**: Leads CRUD operations work

---

### Test 5.2: Opportunities
- [ ] Navigate to `/crm/opportunities`
- [ ] View opportunities list
- [ ] Create a new opportunity:
  - Link to lead/account
  - Amount
  - Stage
  - Close date
- [ ] Update opportunity stage
- [ ] Verify value calculations

**Expected Result**: Opportunities track correctly

---

### Test 5.3: Accounts
- [ ] Navigate to `/crm/accounts`
- [ ] View accounts list
- [ ] Create a new account
- [ ] Add contacts to account
- [ ] View account details

**Expected Result**: Account management works

---

## 🤝 Phase 6: DRM (Distributor Relationship Management)

### Test 6.1: Distributors
- [ ] Navigate to `/drm/distributors`
- [ ] View distributors list
- [ ] Create a new distributor:
  - Company name
  - Contact info
  - Territory
  - Credit limit
- [ ] Edit distributor details

**Expected Result**: Distributor management works

---

### Test 6.2: Distributor Leads
- [ ] Navigate to `/drm/distributor-leads`
- [ ] View distributor leads
- [ ] Create new distributor lead
- [ ] Convert lead to distributor

**Expected Result**: Distributor lead workflow works

---

## 💰 Phase 7: Sales & Orders

### Test 7.1: Create Quotation
- [ ] Navigate to `/quotations`
- [ ] Click "Create Quotation"
- [ ] Select customer
- [ ] Add products:
  - Select product
  - Enter quantity
  - Verify price
- [ ] Calculate totals
- [ ] Save quotation
- [ ] Verify quotation number generated

**Expected Result**: Quotation creates successfully

---

### Test 7.2: Convert Quotation to Invoice
- [ ] Find a quotation
- [ ] Click "Convert to Invoice" (if available)
- [ ] OR manually create invoice from quotation
- [ ] Verify products and amounts transferred
- [ ] Check invoice number generated

**Expected Result**: Quotation conversion works

---

### Test 7.3: Create Order
- [ ] Navigate to `/orders` or `/sales/orders`
- [ ] Create new order
- [ ] Select customer/distributor
- [ ] Add products
- [ ] Process order
- [ ] Verify stock deduction (if implemented)

**Expected Result**: Order processing works

---

### Test 7.4: Payments
- [ ] Navigate to payments section
- [ ] Record a payment:
  - Select invoice
  - Enter amount
  - Select payment method
- [ ] Verify payment recorded
- [ ] Check invoice payment status updates

**Expected Result**: Payment recording works

---

## ⚙️ Phase 8: Settings & Configuration

### Test 8.1: System Settings
- [ ] Navigate to `/settings/system`
- [ ] Verify "Appearance & Theme" link works
- [ ] Check other quick links (Branding, Notifications, etc.)
- [ ] Test company logo upload
- [ ] Verify logo appears in sidebar

**Expected Result**: System settings accessible and functional

---

### Test 8.2: User Management
- [ ] Navigate to `/settings/users`
- [ ] View users list
- [ ] Create a new user:
  - Name
  - Email
  - Role
  - Password
- [ ] Edit user permissions
- [ ] Verify user can login with new credentials

**Expected Result**: User management works

---

### Test 8.3: Role Management
- [ ] Navigate to `/settings/roles`
- [ ] View roles list
- [ ] Create or edit a role
- [ ] Assign permissions/abilities
- [ ] Verify role appears in user assignment

**Expected Result**: Role management works

---

### Test 8.4: Notification Settings
- [ ] Navigate to `/settings/notifications`
- [ ] Configure SMS settings (if applicable)
- [ ] Configure Email/SMTP settings
- [ ] Test SMS sending (if configured)
- [ ] Test Email sending (if configured)

**Expected Result**: Notification configuration works

---

### Test 8.5: Product Settings
- [ ] Navigate to `/settings/products`
- [ ] Manage categories
- [ ] Manage units of measure
- [ ] Configure price lists

**Expected Result**: Product settings functional

---

## 📧 Phase 9: Notifications & Communications

### Test 9.1: Notification Templates
- [ ] Navigate to `/settings/notification-templates`
- [ ] View templates
- [ ] Create/edit template
- [ ] Test template preview

**Expected Result**: Templates work correctly

---

### Test 9.2: Task Templates
- [ ] Navigate to `/settings/task-templates`
- [ ] View templates
- [ ] Create task template with checklists
- [ ] Use template to create task

**Expected Result**: Task templates work

---

## 📦 Phase 10: Inventory Operations

### Test 10.1: Stock Movements
- [ ] Navigate to inventory stock movements
- [ ] Record a stock movement:
  - Select product
  - Select warehouse
  - Enter quantity
  - Select type (Receipt/Adjustment/etc.)
- [ ] Verify stock levels update

**Expected Result**: Stock movements record and update correctly

---

### Test 10.2: Warehouse Management
- [ ] Navigate to warehouses section
- [ ] View warehouses list
- [ ] Create/edit warehouse
- [ ] View warehouse inventory
- [ ] Check stock levels per warehouse

**Expected Result**: Warehouse management works

---

### Test 10.3: Physical Count/Stocktake
- [ ] Navigate to stocktake section
- [ ] Create stocktake session
- [ ] Count items
- [ ] Complete stocktake
- [ ] Verify adjustments made

**Expected Result**: Stocktake process works

---

## 🔍 Phase 11: Search & Navigation

### Test 11.1: Global Search
- [ ] Use search bar in header
- [ ] Search for products
- [ ] Search for customers
- [ ] Search for orders
- [ ] Verify results display

**Expected Result**: Search functionality works

---

### Test 11.2: Sidebar Navigation
- [ ] Test all sidebar links:
  - Home
  - CRM (Leads, Opportunities, Accounts, Contacts)
  - DRM (Distributors, Routes, etc.)
  - Sales (Orders, Quotations, Invoices)
  - Products
  - Inventory
  - Settings
- [ ] Verify active state highlighting
- [ ] Check dropdowns expand/collapse
- [ ] Test on mobile/responsive view

**Expected Result**: All navigation works, active states correct

---

### Test 11.3: Breadcrumbs (if implemented)
- [ ] Navigate to nested pages
- [ ] Verify breadcrumbs show correct path
- [ ] Test clicking breadcrumb links

**Expected Result**: Breadcrumbs work correctly

---

## 🔄 Phase 12: Data Operations

### Test 12.1: Data Export
- [ ] Navigate to any list page (Products, Leads, etc.)
- [ ] Look for export button (CSV/Excel)
- [ ] Export data
- [ ] Verify file downloads
- [ ] Open file and verify data

**Expected Result**: Export functionality works

---

### Test 12.2: Data Import
- [ ] Navigate to appropriate page
- [ ] Look for import functionality
- [ ] Download template
- [ ] Fill template with data
- [ ] Upload template
- [ ] Verify data imported

**Expected Result**: Import functionality works

---

### Test 12.3: Bulk Operations
- [ ] Select multiple items (if multi-select available)
- [ ] Perform bulk action (delete, update, etc.)
- [ ] Verify action applies to all selected

**Expected Result**: Bulk operations work

---

## 🛡️ Phase 13: Security & Permissions

### Test 13.1: Role-Based Access
- [ ] Create user with limited role
- [ ] Login as that user
- [ ] Verify user only sees permitted pages
- [ ] Try accessing restricted pages directly via URL
- [ ] Should be blocked or redirected

**Expected Result**: Role-based access control works

---

### Test 13.2: API Authentication
- [ ] Open browser DevTools → Network tab
- [ ] Perform actions that call APIs
- [ ] Check API requests include auth tokens
- [ ] Try accessing API directly without auth
- [ ] Should return 401 Unauthorized

**Expected Result**: API authentication enforced

---

## 🐛 Phase 14: Error Handling

### Test 14.1: Validation Errors
- [ ] Try submitting forms with invalid data
- [ ] Verify validation messages appear
- [ ] Check that invalid data not saved

**Expected Result**: Form validation works

---

### Test 14.2: Network Errors
- [ ] Disconnect internet (or use DevTools to simulate)
- [ ] Try performing actions
- [ ] Verify error messages shown
- [ ] Check system doesn't crash

**Expected Result**: Graceful error handling

---

### Test 14.3: 404 Pages
- [ ] Navigate to non-existent URL
- [ ] Should show 404 page
- [ ] Check page allows navigation back

**Expected Result**: 404 handling works

---

## 📱 Phase 15: Responsive Design

### Test 15.1: Mobile View
- [ ] Resize browser to mobile size (375px width)
- [ ] Check sidebar collapses/responsive
- [ ] Test navigation on mobile
- [ ] Verify tables scroll horizontally
- [ ] Check forms are usable

**Expected Result**: Mobile responsive design works

---

### Test 15.2: Tablet View
- [ ] Resize to tablet size (768px)
- [ ] Verify layout adapts
- [ ] Check grid layouts adjust

**Expected Result**: Tablet view works

---

### Test 15.3: Desktop View
- [ ] Test on full desktop (1920px+)
- [ ] Verify no horizontal scrolling
- [ ] Check content doesn't stretch too wide

**Expected Result**: Desktop layout optimal

---

## ⚡ Phase 16: Performance

### Test 16.1: Page Load Times
- [ ] Open DevTools → Network tab
- [ ] Navigate to major pages
- [ ] Check load times
- [ ] Verify no slow queries

**Expected Result**: Pages load reasonably fast (< 3s)

---

### Test 16.2: Large Data Sets
- [ ] Create/view many records (100+)
- [ ] Verify pagination works
- [ ] Check no performance degradation
- [ ] Test search/filter with large datasets

**Expected Result**: Handles large datasets well

---

## 🔗 Phase 17: Integrations (If Applicable)

### Test 17.1: Google Maps
- [ ] Navigate to `/settings/google-maps`
- [ ] Configure API key
- [ ] Test map display
- [ ] Test location picker (if available)

**Expected Result**: Google Maps integration works

---

### Test 17.2: SMS/Email
- [ ] Configure SMS/Email in settings
- [ ] Send test message
- [ ] Verify delivery

**Expected Result**: Communications work

---

## ✅ Phase 18: Final Checklist

### Critical Functions
- [ ] Login/Logout works
- [ ] Theme colors save and persist
- [ ] Navigation always visible (no disappearing items)
- [ ] Core CRUD operations work (Create, Read, Update, Delete)
- [ ] Forms submit and validate correctly
- [ ] Data persists after refresh
- [ ] No console errors
- [ ] No build errors

### User Experience
- [ ] All buttons responsive
- [ ] Loading states show during async operations
- [ ] Success/Error messages display correctly
- [ ] Navigation is intuitive
- [ ] Search works
- [ ] Responsive design works

### Data Integrity
- [ ] Created records appear in lists
- [ ] Updates save correctly
- [ ] Deletions remove records
- [ ] Related data updates (e.g., stock when order created)

---

## 🐛 Known Issues to Watch For

Based on TODO-TIDYUP.md, be aware of:
- Templates page might be missing (check sidebar link)
- Some TODO comments in code (check console)
- DRM route management features may be incomplete

---

## 📝 Testing Notes Template

```
Date: __________
Tester: __________
Environment: Development / Production

Issues Found:
1. [Description] - [Severity: Critical/High/Medium/Low]
2. [Description] - [Severity: Critical/High/Medium/Low]

Passed Tests: ___ / ___
Failed Tests: ___ / ___

Overall Status: ✅ Pass / ⚠️ Issues Found / ❌ Critical Issues
```

---

## 🚀 Quick Test Script

For a quick smoke test, focus on these critical paths:

1. ✅ Login
2. ✅ Change theme color (preset and custom)
3. ✅ Navigate sidebar (verify no disappearing items)
4. ✅ Create a product
5. ✅ Create a lead
6. ✅ Create a quotation
7. ✅ View dashboard

If all 7 pass, core system is working!

---

## 📞 Support & Debugging

### Common Issues:
1. **Theme not applying**: Clear browser cache, check `/api/settings/branding` returns correct data
2. **Navigation items missing**: Check custom color styling, verify `isCustomColor` logic
3. **API errors**: Check browser console, verify authentication
4. **Data not saving**: Check network tab, verify API responses

### Debug Commands:
```bash
# Check database
npx prisma studio

# Run migrations
npx prisma migrate dev

# Check logs
# Check browser console
# Check terminal where npm run dev is running
```

---

**Last Updated**: After theme customization fixes
**Next Review**: After e-commerce implementation

