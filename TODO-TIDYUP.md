# 🧹 Pre-Ecommerce Cleanup & Implementation Checklist

## 🔴 **CRITICAL FIXES** (Must Fix Before Production)

### 1. **Linter Error**
- **File**: `src/lib/stock-reservation-service.ts:207`
- **Issue**: Type `'OUT'` is not assignable to type `StockMovementType`
- **Fix**: Change to proper enum value `StockMovementType.SALE` or similar
- **Priority**: HIGH - Blocks compilation

### 2. **Temporary Authentication Skips** 
**⚠️ SECURITY RISK - All APIs exposed without auth**

**Files with TEMPORARY auth skips:**
- `src/app/api/invoices/route.ts` (2 instances)
- `src/app/api/invoices/[id]/route.ts` (3 instances)
- `src/app/api/quotations/route.ts` (1 instance)
- `src/app/api/quotations/[id]/route.ts` (4 instances)
- `src/app/api/customers/search/route.ts` (1 instance)
- `src/app/api/leads/route.ts` (2 instances)
- `src/app/api/reports/route.ts` (1 instance)
- `src/app/api/settings/company/route.ts` (2 instances)
- `src/app/api/agents/route.ts` (2 instances)
- `src/app/api/agents/[id]/route.ts` (3 instances)
- `src/app/api/commissions/route.ts` (2 instances)
- `src/app/api/commissions/[id]/route.ts` (3 instances)
- `src/app/api/dashboard/route.ts` (1 instance)
- `src/app/api/shortcuts/route.ts` (1 instance)

**Action Required**: Uncomment authentication checks and remove hardcoded user IDs

### 3. **Hardcoded User IDs**
**Files using hardcoded user ID `'cmgxgoy9w00008z2z4ajxyw47'`:**
- `src/app/api/quotations/route.ts:114`
- `src/app/api/quotations/[id]/route.ts:99, 380`
- `src/app/api/invoices/route.ts:349`
- `src/app/api/customers/search/route.ts:19`
- `src/app/api/leads/route.ts:21, 115`

**Action Required**: Replace with session-based user ID extraction

---

## 🟡 **MISSING FEATURES** (Complete Implementation)

### 4. **Missing `/templates` Page**
- **Issue**: Sidebar navigation includes "Templates" link (`/templates`) but page doesn't exist
- **Location**: `src/components/layout/sidebar.tsx:122`
- **Options**: 
  - Create the page OR
  - Remove from sidebar navigation
- **Note**: Notification templates and Task templates exist separately under Settings

### 5. **Incomplete Features - TODOs**
**High Priority:**
- `src/app/invoices/page.tsx:296` - "TODO: Implement convert from quotation"
- `src/app/crm/leads/page.tsx:537` - "TODO: Implement import functionality"

**Medium Priority (DRM Module):**
- `src/app/drm/routes-mapping/page.tsx`:
  - Line 693: `onClick: () => {/* TODO: Edit route */}`
  - Line 698: `onClick: () => {/* TODO: Start route */}`
  - Line 703: `onClick: () => {/* TODO: Delete route */}`
  - Line 762: `onClick: () => {/* TODO: View driver details */}`
  - Line 767: `onClick: () => {/* TODO: Edit driver */}`
  - Line 772: `onClick: () => {/* TODO: View driver routes */}`
  - Line 777: `onClick: () => {/* TODO: Delete driver */}`

---

## 🟢 **CODE QUALITY & MAINTENANCE**

### 6. **Uncommitted Changes**
**Modified files not staged:**
- `prisma/schema.prisma`
- Multiple API route files
- Multiple page components
- UI components

**Action**: Review, test, and commit or create proper PR

### 7. **Commented Out Audit Logging**
**Files:**
- `src/app/api/users/route.ts:181` - "Log audit trail (temporarily disabled)"
- `src/app/api/users/[id]/route.ts:84` - "Log audit trail (temporarily disabled)"
- `src/app/api/users/[id]/toggle-status/route.ts:41` - "Log audit trail (temporarily disabled)"

**Action**: Re-enable or remove if not needed

### 8. **Temporary Code Patterns**
**Files with TODO comments:**
- `src/app/api/quotations/route.ts:10` - "TODO: Add proper authentication if needed"
- `src/app/api/users/route.ts:176` - "TODO: Send invitation email if requested"
- `src/app/drm/distributors/page.tsx:506` - "TODO: Performance"

---

## 📋 **IMPLEMENTATION PRIORITY**

### **Phase 1: Critical Security Fixes** (1-2 days)
1. ✅ Fix linter error
2. ✅ Remove all temporary authentication skips
3. ✅ Replace hardcoded user IDs

### **Phase 2: Missing Features** (2-3 days)
4. ✅ Resolve `/templates` page issue
5. ✅ Implement convert quotation to invoice
6. ✅ Implement leads import functionality

### **Phase 3: Code Cleanup** (1 day)
7. ✅ Review and commit changes
8. ✅ Clean up TODO comments
9. ✅ Re-enable or remove audit logging

### **Phase 4: DRM Features** (Optional - 3-5 days)
10. ⚠️ Implement route management features
11. ⚠️ Implement driver management features

---

## 🔍 **QUICK WINS**

1. **Fix Linter Error** (5 minutes)
   ```typescript
   // Change line 207 in stock-reservation-service.ts
   type: 'OUT'  // ❌ Wrong
   type: StockMovementType.SALE  // ✅ Correct
   ```

2. **Remove Auth Skip Pattern** (30 minutes)
   ```typescript
   // Find all instances of:
   // TEMPORARY: Skip authentication for testing
   // Replace with proper auth check
   ```

3. **Remove Hardcoded User ID** (30 minutes)
   ```typescript
   // Find all instances of:
   const userId = 'cmgxgoy9w00008z2z4ajxyw47';
   // Replace with:
   const session = await getServerSession(authOptions);
   const userId = (session?.user as any)?.id;
   ```

---

## 📊 **STATISTICS**

- **Total Files with Auth Skips**: 13 files
- **Total Auth Skip Instances**: ~25 instances
- **Hardcoded User IDs**: 5 instances
- **Missing Features**: 9 TODO items
- **Linter Errors**: 1

---

## ✅ **READY FOR ECOMMERCE?**

**Before starting ecommerce development:**
- [ ] All linter errors fixed
- [ ] All authentication properly implemented
- [ ] No hardcoded user IDs
- [ ] Critical missing features completed or documented
- [ ] Code committed to version control
- [ ] Test suite passes (if exists)

---

**Estimated Time to Complete Cleanup**: 4-6 days

**Recommended Approach**: Fix Phase 1 items immediately, then decide if Phase 2-4 are blockers for ecommerce or can be done in parallel.

