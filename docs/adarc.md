consolidated PRD for your generic, single-tenant, Stripe-inspired sales & distribution system. It merges everything we’ve aligned on: Stripe UI/UX, live documents (quote/proforma/invoice) with right-side preview, proforma-first controls, SMTP email + pluggable SMS (incl. Deywuro), CRM/DRM/Sales/Inventory/Agents/Admin, optional POS, and assistive AI.


0) Document Control

Product: AD Pools SM (Generic Sales & Distribution System)

Owner: Systems Architect

Version: v1.0 (MVP)

Repository: https://github.com/ViableSystemsGlobal/adpoolsgroup

Audience: Founders, Product, Engineering, Sales, Inventory, Finance, Ops

1) Vision & Goals

Vision: A practical, single-tenant system any product business can use to sell, fulfill, and get paid—with a Stripe-grade UX and assistive AI.

Goals

Unify operations: CRM, DRM, Sales (order-to-cash), Inventory, Product Mgmt, Communication, Agents, Admin; POS optional.

Increase adoption: Stripe-style UI, 2-click workflows, auto-logging, live document preview, “Top 5 actions today.”

Improve cash: Proforma → Payment/Credit → Release to Warehouse enforcement; automated reminders; DSO visibility.

Protect stock value: reservations with TTL, Pick/Pack/Check with barcode + second checker, capacity guardrails.

Stay generic & safe: configurable catalog/price lists/terms; single-tenant isolation; RBAC/ABAC; approvals; audit.


2) Scope

In: Product Mgmt, CRM, DRM, Sales, Inventory, Communication (SMTP + SMS adapters incl. Deywuro), Sales Agent Mgmt, Admin; POS (optional); assistive AI (lead scoring, quote optimizer, inventory alerts); live documents with split-screen preview and shared compute.


3) Personas

Retail Sales Exec (walk-in & direct)

Project Sales Exec (quotations, milestones, proformas)

Distributor RM (agreements, bulk orders)

Inventory/Warehouse (reserve, pick, pack, dispatch, POD)

Finance Officer (invoices, payments, reminders, aging/DSO)

Sales Manager (approvals, targets, team view)

Comms Manager (templates, provider health, DLQ)

Executive (cross-module KPIs, weekly digest)

Admin (users, roles, approvals config, settings)

4) Key Concepts

Business Unit (business_unit): retail | projects | wholesale (configurable).

Sales Channel (channel): direct | distributor | pos.

State Machines for documents; ABAC by owner/team/territory/business_unit/channel.

Live Documents: left form, right preview tabs (PDF | Email | Public page), one compute engine for totals.

5) UI/UX (Stripe-Inspired)

App shell: left sidebar (modules) + top bar (global search, test mode, notifications, help, user menu).

List pages: dense, filter pills, zebra rows, status badges, bulk actions.

Detail pages: header (title + human ID + status + actions), Recent activity timeline, line items, right “Details” column (ID, created, terms, customer, metadata).

Create/Edit: right drawer/sheet; never lose context.

Wizards: Guided Selling; Proforma issuance.

Accessibility: keyboard nav, high contrast, ARIA roles, skeleton loaders.

Branding: per-tenant logo + accent color; PDFs styled to match.

6) Modules & Requirements (very detailed)
6.1 Product Management (Core Catalog)

Purpose: One source of truth for items, price lists, bundles.

Entities

Product (SKU, name, description, images, category_id, attributes JSON, uom_base/uom_sell, active)

Category (tree)

Variant/ProductAttribute (size, color, material, etc.)

PriceList (name, channel, currency, effective_from/to)

PriceListItem (product_id, unit_price, overrides)

Bundle & BundleItem (kit composition)

Workflows

Create/edit product (attach to one/more price lists).

Manage variants & attributes; (v1.1) compatibility rules for look-alikes.

Create bundles (e.g., “Starter Kit”) and add in one click to quotes/orders.

Acceptance

Product searchable <150ms (P95) for ≤5k SKUs.

Add bundle to a quote in ≤3 clicks.

6.2 CRM (Direct Customers)

Purpose: Lead → Quote → Proforma → Order; reminders baked in.

Entities

Lead, Account (company/individual/project), Contact

Opportunity (stages: New → Qualified → Proposal/Quotation → Negotiation → Won/Lost)

Quotation & QuotationLine

Activity (auto-logged sends/changes)

Workflows

Convert Lead → Opp; AI lead score + “Top 5 actions.”

Create Quotation (guided selling; auto price from list; AI discount suggestion; over-threshold → approval).

Send via SMTP/SMS; reminders T+2/T+7/T+14.

Generate Proforma from quote; convert to SO only after payment or credit approval.

Acceptance

Can’t “Release to Warehouse” until proforma paid/credit-approved.

Quote-to-Proforma issuance in ≤2 minutes for typical basket.

6.3 DRM (Distributor Relationship Management)

Purpose: Manage distributor terms and bulk orders.

Entities

DistributorAccount (extends Account)

DistributorAgreement (tier, base_discount, credit_days, price_list_id)

DRMOrder (alias of Sales Order with channel=distributor)

Workflows

Onboard distributor; apply agreement (auto terms/pricing).

Create bulk order; exceptions (extra discount/credit) require approval.

At-risk distributors (inactivity/frequency) flagged; simple restock suggestions.

Acceptance

Agreement pricing/terms auto-applied; partial deliveries supported.

6.4 Sales (Order → Delivery → Invoice → Payment)

Purpose: Clean order-to-cash with proforma-first control.

States

Proforma: draft → sent → paid | credit_approved → cancelled

Sales Order: draft → awaiting_payment/credit → ready_to_pick → dispatched → completed → cancelled

Delivery Note: draft → released → pod_received

Invoice: draft → posted → partially_paid → paid → void

Entities

Proforma, SalesOrder, SalesOrderLine, DeliveryNote, DeliveryLine, Invoice, InvoiceLine, Payment, PaymentAllocation, Return, CreditNote

Workflows

Create SO from CRM/DRM; proforma-first: block release before payment/credit-approval.

Partial deliveries; each Delivery Note can produce an invoice (delivery-based billing).

POD capture (upload photo/scan) to close delivery.

Payments allocate across invoices; automate overdue reminders D+3/D+7; DSO dashboard.

Public links:

Proforma/Invoice: /pay/{token} (pay/settle instructions)

Quotation: /quote/{token} (accept/request change)

Acceptance

No stock move without a released Delivery Note.

POD required to complete delivery.

Allocations across invoices supported.

Approval required for over-discount or credit overrides.

6.5 Inventory (Stock That Never Lies)

Purpose: Accurate stock with minimal admin & strong guardrails.

Entities

Warehouse, StockItem (product_id x warehouse_id, qty_on_hand)

StockReservation (sales_order_line_id, qty, expires_at)

StockMove (IN/OUT/ADJ, reason, linked_id)

Workflows

Create reservation when SO is ready (or proforma paid). TTL auto-release (notify owner).

Pick/Pack/Check: barcode scan, product image, warn on look-alikes; second checker on high-risk SKUs.

Delivery posting triggers StockMove(OUT); returns create StockMove(IN).

Low-stock alerts; simple restock suggestions.

Capacity board: orders queued vs picking/dispatch capacity (red/amber/green).

Acceptance

Reservation expiry returns stock automatically.

Barcode mismatch blocks dispatch.

Capacity board visible by day; prevents over-promising.

6.6 Communication (SMTP Email + Pluggable SMS)

Purpose: Reliable, centralized messaging.

Email

SMTP (host, port, secure, user, pass, from).

Preview tab shows final email; can send test to self.

SMS (adapter pattern)

Providers: Deywuro, Twilio, Hubtel, Africa’s Talking (switch by .env).

Deywuro driver params: username, password, destination (comma-separated), source (≤11 chars), message.

All sends logged with provider status; retries with backoff; DLQ page for failures.

Templates (Handlebars)

quote_sent, quote_reminder_t2/t7/t14, proforma_sent, invoice_posted, invoice_overdue_d3/d7, delivery_scheduled, delivery_dispatched

Acceptance

Switch SMS providers via config only; no code changes.

Every send is audited and linked to the entity.

6.7 Sales Agent Management

Purpose: Motivation & visibility.

Entities

SalesAgent (user_id, territory_id), Target, CommissionRule, Commission

Workflows

Monthly targets; commission calc by channel/SKU or flat %.

Agent dashboard: earned vs target; leaderboards; weekly summary.

Acceptance

Commission CSV export for Finance.

Agent sees real-time progress.

6.8 POS (Optional)

Purpose: Fast walk-in sales.

Features

Quick search / barcode scanning; tax/discount lines; tenders (cash/card/MoMo).

Receipt print + email/SMS receipt; immediate stock deduction; end-of-day summary.

POS order creates normal SO/Invoice/Payment + StockMove.

Acceptance

POS flow fits the same reports and stock as normal Sales.

6.9 Admin (Users, Roles, Approvals, Audit)

Purpose: Safety & governance.

RBAC Roles

admin, sales_manager, sales_rep, distributor_rm, inventory_manager, finance_officer, comms_manager, executive_viewer, auditor

ABAC

Record guards on owner_user_id, team_id, territory_id, business_unit, channel, status.

Approvals

Over-discount, credit overrides, stock adjustments beyond tolerance, cancel posted invoice.

Settings

Branding, SMTP, SMS provider keys, discount thresholds, credit policy, reservation TTL, capacity parameters, feature flags (POS, WhatsApp, portal).


Audit

Immutable log for every write & send (who/what/before/after/IP/UA).

Acceptance

Sensitive actions blocked pending approval; traceable in audit.

7) Live Documents (Stripe-style editor)
UX

Split screen: left form; right tabs → Document PDF | Email | Public page.

Live preview updates as you type (debounced).

Buttons: Send, Download PDF, Copy link, Resend, Void/Mark paid.

Single Compute Engine (one source of truth)

8) 1-Week Development Plan (Emergency Delivery)

Given the 1-week constraint, this plan focuses on delivering a functional prototype that demonstrates core value.

8.1 Technology Stack (Simplified)

Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
Backend: Next.js API routes + Prisma ORM
Database: PostgreSQL (Supabase/PlanetScale)
Authentication: NextAuth.js
Email: Resend/SendGrid
PDF: @react-pdf/renderer
Deployment: Vercel

8.2 1-Week MVP Scope

IN (Week 1):
- Basic Product Management (Products, Categories, Price Lists)
- Simple CRM (Leads, Accounts, Contacts)
- Quotation System with live preview
- Basic Proforma generation
- Simple Inventory tracking
- Email sending (SMTP)
- Basic Admin (Users, Roles)
- Stripe-inspired UI

OUT (Week 1):
- Advanced inventory (reservations, barcode scanning)
- DRM module
- POS system
- AI features
- SMS integration
- Complex approval workflows
- Advanced reporting
- Public payment links
- Multi-tenant isolation
- Audit trails
- State machines

8.3 Day-by-Day Plan

Day 1: Foundation & Setup
- Next.js project setup
- Authentication (NextAuth.js)
- Basic UI components
- Database schema design

Day 2: Product Management
- Product CRUD operations
- Category management
- Price list functionality
- Basic search

Day 3: CRM Foundation
- Lead/Account/Contact management
- Customer list/detail pages
- Basic activity logging

Day 4: Quotation System
- Quotation creation form
- Live document preview (split-screen)
- PDF generation
- Quotation management

Day 5: Proforma & Email
- Proforma generation from quotations
- SMTP email sending
- Email templates
- Complete sales workflow

Day 6: Inventory & Polish
- Basic stock tracking
- Stock updates on sales
- UI/UX polish
- Validation and error handling

Day 7: Testing & Deployment
- Comprehensive testing
- Bug fixes
- Vercel deployment
- Demo data creation
- Final polish

8.4 Success Criteria (Week 1)

- Complete Lead → Quote → Proforma → Email workflow
- Live document preview working
- Email delivery functional
- Basic inventory tracking
- Stripe-inspired UI implemented
- Deployed and accessible
- Demo-ready with sample data

8.5 Technical Shortcuts

- Use shadcn/ui for rapid UI development
- Client-side PDF generation
- Simple database schema (no complex relationships)
- Basic forms with React Hook Form
- Minimal error handling
- No comprehensive testing
- Hardcoded configuration values
- Single-tenant architecture (no isolation)

8.6 Post-Week 1 Roadmap

Week 2-3: Advanced Features
- SMS integration
- Advanced inventory management
- DRM module
- Approval workflows

Week 4-6: Production Features
- Multi-tenant isolation
- Audit trails
- State machines
- Advanced reporting
- POS system

Week 7-8: AI & Optimization
- AI features
- Performance optimization
- Security hardening
- Production deployment