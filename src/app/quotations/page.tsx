"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { SendQuoteModal } from "../../components/modals/send-quote-modal";
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Mail,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MoreVertical,
  Calendar
} from "lucide-react";
import Link from "next/link";

interface Quotation {
  id: string;
  number: string;
  subject: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  total: number;
  subtotal: number;
  tax: number;
  taxInclusive?: boolean;
  notes?: string;
  validUntil: string;
  createdAt: string;
  customerType?: 'STANDARD' | 'CREDIT';
  account: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  distributor?: {
    id: string;
    businessName: string;
    email?: string;
    phone?: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  lines?: Array<{
    id: string;
    productId?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
    taxes?: Array<{
      name: string;
      rate: number;
      amount: number;
    }>;
    product?: {
      id: string;
      name: string;
      sku?: string;
    };
    productName?: string;
    sku?: string;
    description?: string;
  }>;
  owner: {
    id: string;
    name: string;
  };
}

export default function QuotationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error: showError } = useToast();
  const { getThemeClasses, customLogo } = useTheme();
  const theme = getThemeClasses();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sendQuoteModalOpen, setSendQuoteModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/quotations');
      
      if (response.ok) {
        const data = await response.json();
        
        // Map quotations to include customer name from either account or distributor
        const mappedQuotations = (data.quotations || []).map((q: any) => ({
          ...q,
          account: q.account ? {
            ...q.account,
            name: q.account.name || 'Unknown Customer'
          } : undefined,
          distributor: q.distributor ? {
            ...q.distributor,
            businessName: q.distributor.businessName || 'Unknown Customer'
          } : undefined
        }));
        
        setQuotations(mappedQuotations);
      } else {
        showError("Failed to load quotations");
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
      showError("Failed to load quotations");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      SENT: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      EXPIRED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expired' },
    };
    const badge = badges[status as keyof typeof badges] || badges.DRAFT;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const handleSendQuote = async (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSendQuoteModalOpen(true);
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: quotation.subject,
          quotationId: quotation.id,
          accountId: quotation.account?.id || null,
          distributorId: quotation.distributor?.id || null,
          leadId: quotation.lead?.id || null,
          customerType: quotation.customerType || 'STANDARD',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          paymentTerms: 'Net 30',
          notes: quotation.notes,
          taxInclusive: quotation.taxInclusive || false,
          lines: quotation.lines?.map(line => ({
            productId: line.productId,
            productName: line.productName,
            sku: line.sku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxes: line.taxes || [],
          })) || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        success(`Quotation ${quotation.number} converted to invoice ${data.invoice.number} successfully!`);
        // Optionally redirect to the new invoice
        router.push(`/invoices/${data.invoice.id}`);
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to convert quotation to invoice");
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
      showError("Failed to convert quotation to invoice");
    }
  };

  const handleDeleteQuotation = async (quotation: Quotation) => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success(`Quotation ${quotation.number} deleted successfully`);
        loadQuotations(); // Reload the list
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to delete quotation");
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      showError("Failed to delete quotation");
    }
  };

  const handleDownload = async (quotation: Quotation) => {
    try {
      // Create a new window with the quotation content formatted for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        showError("Unable to open print window. Please check your popup blocker.");
        return;
      }

      // Get quotation details
      const customerName = quotation.account?.name || 
                          quotation.distributor?.businessName || 
                          (quotation.lead ? `${quotation.lead.firstName} ${quotation.lead.lastName}`.trim() : '') ||
                          'No customer';
      const customerEmail = quotation.account?.email || quotation.distributor?.email || quotation.lead?.email || '';
      const customerPhone = quotation.account?.phone || quotation.distributor?.phone || quotation.lead?.phone || '';
      
      
      
      // Calculate if discount column should be shown
      const hasDiscounts = quotation.lines?.some(line => line.discount > 0) || false;
      
      // Create the HTML content matching the preview layout exactly
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quotation ${quotation.number}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .company-header {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo {
              height: 64px;
              width: auto;
              margin: 0 auto 16px;
              display: block;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #111;
              margin-bottom: 4px;
            }
            .document-subtitle {
              font-size: 14px;
              color: #6b7280;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 24px;
              margin-bottom: 32px;
            }
            .info-label {
              font-size: 12px;
              font-weight: 500;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.025em;
              margin-bottom: 4px;
            }
            .info-value {
              font-weight: 600;
              color: #111;
            }
            .info-sub {
              font-size: 14px;
              color: #6b7280;
              margin-top: 8px;
            }
            .info-sub-label {
              font-size: 12px;
              font-weight: 500;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.025em;
              margin-bottom: 4px;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 2px 10px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
            }
            .status-draft { background-color: #f3f4f6; color: #374151; }
            .status-sent { background-color: #dbeafe; color: #1e40af; }
            .status-accepted { background-color: #d1fae5; color: #065f46; }
            .status-rejected { background-color: #fee2e2; color: #991b1b; }
            .status-expired { background-color: #fed7aa; color: #9a3412; }
            
            .items-section {
              margin-bottom: 32px;
            }
            .items-label {
              font-size: 12px;
              font-weight: 500;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .table-container {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .table-header {
              background-color: #f9fafb;
              display: grid;
              grid-template-columns: ${hasDiscounts ? '1fr 4fr 1fr 2fr 2fr 2fr' : '1fr 4fr 1fr 2fr 2fr'};
              gap: 8px;
              padding: 8px 12px;
            }
            .table-header-cell {
              font-size: 12px;
              font-weight: 500;
              color: #374151;
              text-transform: uppercase;
            }
            .table-body {
              max-height: none;
              overflow: visible;
            }
            .table-row {
              display: grid;
              grid-template-columns: ${hasDiscounts ? '1fr 4fr 1fr 2fr 2fr 2fr' : '1fr 4fr 1fr 2fr 2fr'};
              gap: 8px;
              padding: 8px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 12px;
            }
            .table-row:last-child {
              border-bottom: none;
            }
            .table-row:nth-child(even) {
              background-color: #f9fafb;
            }
            .table-row:nth-child(odd) {
              background-color: white;
            }
            .row-number { color: #6b7280; }
            .row-description {
              font-weight: 500;
              color: #111;
            }
            .row-sku {
              font-size: 12px;
              color: #6b7280;
              margin-top: 2px;
            }
            .row-amount {
              font-weight: 500;
              color: #111;
            }
            .row-discount {
              font-weight: 500;
              color: #059669;
            }
            .row-discount-dash {
              color: #9ca3af;
            }
            .row-other { color: #6b7280; }
            
            .totals-section {
              border-top: 1px solid #e5e7eb;
              padding-top: 16px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
            }
            .total-final {
              font-weight: bold;
              font-size: 18px;
              border-top: 1px solid #e5e7eb;
              margin-top: 8px;
              padding-top: 16px;
            }
            .total-label { color: #6b7280; }
            .total-value { font-weight: 500; }
            .total-discount { color: #059669; }
            .total-black { color: #111; }
            
            .notes-section {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
            }
            .notes-title {
              font-weight: 500;
              color: #111;
              margin-bottom: 8px;
            }
            .notes-content {
              font-size: 14px;
              color: #6b7280;
              white-space: pre-wrap;
            }
            
            @media print {
              body { margin: 0; padding: 15px; }
              .company-header { page-break-after: avoid; }
              .table-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <!-- Company Header -->
          <div class="company-header">
            ${customLogo ? `<img src="${customLogo}" alt="Company Logo" class="logo" />` : ''}
            <div class="company-name">${quotation.subject || 'Untitled Quotation'}</div>
            <div class="document-subtitle">${quotation.number}</div>
          </div>

          <!-- Document Info Grid -->
          <div class="info-grid">
            <div>
              <div class="info-label">QUOTATION</div>
              <div class="info-value">${quotation.number}</div>
              <div class="info-sub">
                <div class="info-sub-label">Valid Until</div>
                <div>${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'No expiry'}</div>
              </div>
            </div>
            <div>
              <div class="info-label">DATE</div>
              <div class="info-value">${new Date(quotation.createdAt).toLocaleDateString()}</div>
              <div class="info-sub">
                <div class="info-sub-label">Status</div>
                <div>
                  <span class="status-badge status-${quotation.status.toLowerCase()}">
                    ${quotation.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div class="info-label">Bill To</div>
              <div class="info-value">${customerName}</div>
              <div class="info-sub">
                <div>${customerEmail}</div>
                <div>${customerPhone}</div>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="items-section">
            <div class="items-label">Items</div>
            ${quotation.lines && quotation.lines.length > 0 ? `
              <div class="table-container">
                <div class="table-header">
                  <div class="table-header-cell">#</div>
                  <div class="table-header-cell">Description</div>
                  <div class="table-header-cell">Qty</div>
                  <div class="table-header-cell">Unit Price</div>
                  ${hasDiscounts ? '<div class="table-header-cell">Discount</div>' : ''}
                  <div class="table-header-cell">Amount</div>
                </div>
                <div class="table-body">
                  ${quotation.lines.map((line: any, index: number) => `
                    <div class="table-row">
                      <div class="row-number">${index + 1}</div>
                      <div class="row-description">
                        ${line.product?.name || line.productName || `Item ${index + 1}`}
                        ${line.product?.sku || line.sku ? `<div class="row-sku">SKU: ${line.product?.sku || line.sku}</div>` : ''}
                        ${line.description ? `<div class="row-sku">${line.description}</div>` : ''}
                      </div>
                      <div class="row-other">${line.quantity}</div>
                      <div class="row-other">GH₵${line.unitPrice.toFixed(2)}</div>
                      ${hasDiscounts ? `
                        <div class="${line.discount > 0 ? 'row-discount' : 'row-discount-dash'}">
                          ${line.discount > 0 ? `${line.discount}%` : '-'}
                        </div>
                      ` : ''}
                      <div class="row-amount">GH₵${line.lineTotal.toFixed(2)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div style="text-align: center; padding: 16px; color: #9ca3af; font-style: italic;">
                No items added
              </div>
            `}
          </div>

          <!-- Totals Section -->
          <div class="totals-section">
            ${!quotation.taxInclusive ? `
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">GH₵${quotation.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Tax:</span>
                <span class="total-value">GH₵${quotation.tax.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>${quotation.taxInclusive ? 'Total (Tax Inclusive):' : 'Total:'}</span>
              <span class="total-black">GH₵${quotation.total.toFixed(2)}</span>
            </div>
          </div>

          ${quotation.notes ? `
            <div class="notes-section">
              <div class="notes-title">Notes</div>
              <div class="notes-content">${quotation.notes}</div>
            </div>
          ` : ''}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      success("Quotation ready for download/printing");
    } catch (error) {
      console.error('Error downloading quotation:', error);
      showError("Failed to download quotation");
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'DRAFT').length,
    sent: quotations.filter(q => q.status === 'SENT').length,
    accepted: quotations.filter(q => q.status === 'ACCEPTED').length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotations...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600">Create and manage sales quotations</p>
          </div>
          <Link href="/quotations/create">
            <Button className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Button>
          </Link>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side (2/3) */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Quotation Management AI"
              subtitle="Your intelligent assistant for sales optimization"
              recommendations={[
                {
                  id: '1',
                  title: 'Quick Response',
                  description: `${stats.sent} quotes awaiting customer response - follow up within 48 hours`,
                  priority: 'high',
                  completed: false
                },
                {
                  id: '2',
                  title: 'Convert to Invoice',
                  description: `${stats.accepted} accepted quotes ready to convert to invoices`,
                  priority: 'high',
                  completed: false
                },
                {
                  id: '3',
                  title: 'Pipeline Value',
                  description: `Total pipeline value: GH₵${stats.totalValue.toLocaleString()} - maintain momentum`,
                  priority: 'medium',
                  completed: false
                }
              ]}
              onRecommendationComplete={(id) => console.log('Completed:', id)}
            />
          </div>

          {/* Metrics Cards - Right Side (1/3, 2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                </div>
                <Send className="h-8 w-8 text-blue-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className={`text-2xl font-bold text-${theme.primary}`}>GH₵{stats.totalValue.toLocaleString()}</p>
                </div>
                <FileText className={`h-8 w-8 text-${theme.primary}`} />
              </div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}`}
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm mb-4">
                          {searchTerm || statusFilter !== "ALL" 
                            ? "No quotations match your filters" 
                            : "No quotations yet"}
                        </p>
                        <Link href="/quotations/create">
                          <Button size="sm" className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Quotation
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{quotation.number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{quotation.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quotation.account?.name || quotation.distributor?.businessName || (quotation.lead ? `${quotation.lead.firstName} ${quotation.lead.lastName}` : 'Unknown')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            GH₵{quotation.total.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(quotation.validUntil).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(quotation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/quotations/${quotation.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/quotations/${quotation.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDownload(quotation)}
                              title="Download as PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleSendQuote(quotation)}
                              title="Send quote via email/SMS"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleConvertToInvoice(quotation)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Convert to Invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteQuotation(quotation)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Quote Modal */}
      {selectedQuotation && (
        <SendQuoteModal
          isOpen={sendQuoteModalOpen}
          onClose={() => {
            setSendQuoteModalOpen(false);
            setSelectedQuotation(null);
          }}
          quotation={selectedQuotation}
        />
      )}
    </MainLayout>
  );
}

