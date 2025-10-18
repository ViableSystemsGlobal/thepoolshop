# 🎯 Commission System - User Guide

## Overview

The automatic commission system creates, tracks, and manages sales commissions for agents based on paid invoices. It intelligently handles both single-agent and team deals with flexible commission rates and approval workflows.

---

## 📊 How It Works

### Automatic Commission Creation

When an invoice is marked as **PAID**, the system automatically:

1. **Detects agents** associated with the invoice
2. **Calculates commissions** based on configuration
3. **Creates commission records** with PENDING status
4. **Logs the action** in the audit trail

### Agent Detection Logic

The system detects agents in the following order:

#### Scenario 1: Explicitly Assigned Agents (Team Deal)
- **When**: Multiple agents are assigned to an invoice via `AgentInvoice` table
- **Commission**: Uses **system-wide rate** (default 10%), split equally among agents
- **Example**: 3 agents on a GH₵1,000 invoice with 10% system rate
  - Each agent gets: GH₵1,000 × (10% ÷ 3) = GH₵33.33

#### Scenario 2: Invoice Owner is Agent (Solo Deal)
- **When**: Invoice owner (`ownerId`) is an active agent
- **Commission**: Uses agent's **personal commission rate**
- **Example**: Agent with 15% rate on GH₵1,000 invoice
  - Agent gets: GH₵1,000 × 15% = GH₵150

#### Scenario 3: No Agent Found
- **When**: Invoice owner is not an agent AND no agents assigned
- **Commission**: None created (expected behavior)

---

## ⚙️ Configuration

### System Settings

Access these in **Settings > System Settings** (or via database):

| Setting | Default | Description |
|---------|---------|-------------|
| `commission_enabled` | `true` | Enable/disable automatic commission creation |
| `commission_system_rate` | `10` | Default commission % for team deals |
| `commission_calculation_type` | `REVENUE` | Calculate on REVENUE (total) or PROFIT (total - costs) |
| `commission_min_invoice_amount` | `0` | Minimum invoice total to qualify for commission |

### Per-Agent Settings

Each agent has a `commissionRate` field (in their agent profile):
- Used for **single-agent deals**
- Can be different for each agent (e.g., senior agents get 15%, junior get 10%)
- Set when creating/editing an agent

---

## 🔄 Commission Workflow

### Status Flow

```
PENDING → APPROVED → PAID
   ↓          ↓
CANCELLED  CANCELLED
```

#### 1. PENDING (Auto-created)
- ✅ Automatically created when invoice is paid
- ⏳ Awaiting manager approval
- 🔒 Cannot be paid yet

#### 2. APPROVED (Manager Action)
- ✅ Manager reviews and approves commission
- 💰 Ready for payment
- 📊 Included in payout calculations

#### 3. PAID (Finance Action)
- ✅ Commission has been paid to agent
- 📅 `paidDate` is recorded
- ✔️ Complete

#### CANCELLED (Any Time)
- ❌ Commission rejected or cancelled
- 📝 Reason should be provided

---

## 💼 Usage Examples

### Example 1: Single Agent Solo Sale

**Setup:**
- Agent: John Doe (AG-0002) with 12% commission rate
- Invoice: INV-001 for GH₵5,000
- Owner: John Doe

**Process:**
1. Invoice created by John Doe
2. Customer pays GH₵5,000
3. Invoice status → PAID
4. ✅ **Commission auto-created:**
   - Agent: John Doe
   - Base: GH₵5,000
   - Rate: 12% (John's personal rate)
   - Amount: GH₵600
   - Status: PENDING

### Example 2: Team Deal (3 Agents)

**Setup:**
- Agents: Alice, Bob, Charlie
- Invoice: INV-002 for GH₵10,000
- System rate: 10%
- Assigned via AgentInvoice table

**Process:**
1. Invoice created
2. 3 agents assigned to invoice
3. Customer pays GH₵10,000
4. Invoice status → PAID
5. ✅ **3 Commissions auto-created:**
   - Alice: GH₵10,000 × 3.33% = GH₵333.33 (PENDING)
   - Bob: GH₵10,000 × 3.33% = GH₵333.33 (PENDING)
   - Charlie: GH₵10,000 × 3.33% = GH₵333.33 (PENDING)

### Example 3: Custom Split Percentages

**Setup:**
- Primary Agent: Sarah (60% of system rate)
- Support Agent 1: Mike (20% of system rate)
- Support Agent 2: Lisa (20% of system rate)
- Invoice: INV-003 for GH₵8,000
- System rate: 10%

**Process:**
1. Invoice created
2. Agents assigned with custom splits:
   - Sarah: 6% (60% of 10%)
   - Mike: 2% (20% of 10%)
   - Lisa: 2% (20% of 10%)
3. Customer pays GH₵8,000
4. Invoice status → PAID
5. ✅ **3 Commissions auto-created:**
   - Sarah: GH₵8,000 × 6% = GH₵480 (PENDING)
   - Mike: GH₵8,000 × 2% = GH₵160 (PENDING)
   - Lisa: GH₵8,000 × 2% = GH₵160 (PENDING)

---

## 🖥️ User Interface

### Commissions Page (`/commissions`)

**Features:**
- View all commissions with filtering
- **Approve** button for PENDING commissions
- **Mark Paid** button for APPROVED commissions
- Status badges (PENDING, APPROVED, PAID)
- Search and filter by agent, status, type

**Actions:**

| Status | Available Actions |
|--------|------------------|
| PENDING | 🔵 **Approve** - Move to APPROVED status |
| APPROVED | 🟢 **Mark Paid** - Record as PAID |
| PAID | ✅ Completed - No actions needed |

### Agent Reports (`/reports` → Agents Tab)

**View:**
- Total commissions (all statuses)
- Pending commissions (awaiting approval)
- Paid commissions (completed)
- Top performing agents
- Commissions by status (chart)
- Monthly commission trends

---

## 🔧 API Endpoints

### Auto-Commission Creation
- **Trigger**: Automatically when invoice `paymentStatus` → `PAID`
- **Service**: `CommissionService.createCommissionsForInvoice()`

### Manual Actions

#### Approve Commission
```typescript
POST /api/commissions/[id]/approve
Body: { reason?: string }
```

#### Mark as Paid
```typescript
POST /api/commissions/[id]/mark-paid
Body: { paidDate?: string, reason?: string }
```

#### Preview Commissions
```typescript
// In code
await CommissionService.previewCommissions(invoiceId)
```

#### Assign Agents to Invoice
```typescript
// In code
await CommissionService.assignAgentsToInvoice(invoiceId, [
  { agentId: 'xxx', role: 'PRIMARY', splitPercent: 60 },
  { agentId: 'yyy', role: 'SUPPORT', splitPercent: 40 }
])
```

---

## 📋 Database Schema

### AgentInvoice (Junction Table)
```typescript
{
  id: string
  agentId: string        // Agent assigned
  invoiceId: string      // Invoice
  role: 'PRIMARY' | 'SUPPORT' | 'CONSULTANT'
  splitPercent?: number  // Custom split (optional)
}
```

### Commission
```typescript
{
  id: string
  agentId: string
  invoiceId?: string
  commissionType: 'SALES' | 'QUOTA_BONUS' | ...
  calculationType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  baseAmount: number     // Revenue or profit base
  commissionRate: number // Percentage rate
  commissionAmount: number // Final amount
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  approvedBy?: string
  approvedAt?: DateTime
  paidDate?: DateTime
  notes?: string
}
```

### CommissionAudit (Audit Trail)
```typescript
{
  id: string
  commissionId: string
  action: string         // CREATED, APPROVED, PAID, etc.
  previousStatus?: CommissionStatus
  newStatus?: CommissionStatus
  previousAmount?: number
  newAmount?: number
  performedBy: string    // User who performed action
  reason?: string
  notes?: string
  createdAt: DateTime
}
```

---

## 🛠️ Maintenance Scripts

### Test Commission System
```bash
npx tsx scripts/test-commission-system.ts
```
Shows current state, settings, and previews commissions for paid invoices.

### Backfill Existing Invoices
```bash
npx tsx scripts/backfill-commissions.ts
```
Creates commissions for all existing paid invoices that don't have them.

### Seed Commission Settings
```bash
npx tsx scripts/seed-commission-settings.ts
```
Initializes system settings with defaults.

---

## 💡 Best Practices

### For Single Agents
1. ✅ Set each agent's personal `commissionRate` appropriately
2. ✅ Invoice owner should be the agent (automatic detection)
3. ✅ No need to manually assign agents

### For Team Deals
1. ✅ Create invoice as usual
2. ✅ Use `AgentInvoice` to assign multiple agents
3. ✅ Optionally set custom `splitPercent` for each agent
4. ✅ System will split the system rate appropriately

### For Approval
1. ✅ Review PENDING commissions regularly
2. ✅ Verify invoice is truly paid before approving
3. ✅ Add notes/reason when rejecting
4. ✅ Only mark as PAID when payment is actually made to agent

---

## 🔍 Audit Trail

Every commission action is logged in `CommissionAudit`:
- Who performed the action
- When it was performed
- Previous and new status/amounts
- Reason provided
- Additional notes

**View Audit Trail:**
- Via database: `SELECT * FROM commission_audits WHERE commissionId = 'xxx'`
- Future: Can add to UI for transparency

---

## ⚠️ Important Notes

1. **No Duplicate Commissions**: System checks if commission already exists before creating
2. **Only on PAID**: Commissions only created when invoice is fully paid, not partially paid
3. **Agent Must Be Active**: Inactive/terminated agents don't get commissions
4. **Minimum Amount**: Invoices below `commission_min_invoice_amount` don't get commissions
5. **Can Be Disabled**: Set `commission_enabled` to `false` to stop auto-creation

---

## 🚀 Future Enhancements

Potential features to add:
- [ ] Commission tiers (higher % for exceeding targets)
- [ ] Different rates per product category
- [ ] Commission on quotations (when accepted)
- [ ] Commission on orders (when fulfilled)
- [ ] Bulk approval of commissions
- [ ] Commission reports export
- [ ] Agent commission dashboard
- [ ] Email notifications on commission creation/approval

---

## 📞 Support

For issues or questions about the commission system:
1. Check audit logs for commission history
2. Review system settings for configuration
3. Test with the test script to verify setup
4. Check agent status and rates

---

**Last Updated:** October 18, 2025
**Version:** 1.0.0

