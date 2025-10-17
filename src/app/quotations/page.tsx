"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { downloadQuotationAsPDF } from "@/lib/quotation-download";
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
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { SkeletonTableRow, SkeletonMetricCard } from "@/components/ui/skeleton-loading";
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
  Calendar,
  CheckSquare,
  Square
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
  updatedAt: string;
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
    name?: string;
    email?: string;
    phone?: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
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
  const { data: session, status } = useSession();
  const { success, error: showError } = useToast();
  const { getThemeClasses, customLogo } = useTheme();
  const theme = getThemeClasses();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [allQuotations, setAllQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sendQuoteModalOpen, setSendQuoteModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Bulk selection state
  const [selectedQuotations, setSelectedQuotations] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    type: 'danger'
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadQuotations(1);
      loadAllQuotationsForMetrics();
    }
  }, [statusFilter, status, session]);

  // Debounced search effect
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const timeoutId = setTimeout(() => {
        loadQuotations(1);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, status, session]);

  const loadAllQuotationsForMetrics = async () => {
    try {
      // Check if user is logged in
      if (status === 'loading' || !session?.user) {
        return;
      }
      
      // Fetch all quotations without pagination for metrics
      const params = new URLSearchParams({
        page: '1',
        limit: '1000' // Large limit to get all quotations
      });
      
      const response = await fetch(`/api/quotations?${params.toString()}`);
      
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
            name: q.distributor.businessName || 'Unknown Distributor'
          } : undefined,
          lead: q.lead ? {
            ...q.lead,
            name: q.lead.firstName && q.lead.lastName ? `${q.lead.firstName} ${q.lead.lastName}` : 'Unknown Lead'
          } : undefined,
        }));
        
        setAllQuotations(mappedQuotations);
      } else {
        console.error('Failed to load quotations for metrics:', response.status);
      }
    } catch (error) {
      console.error('Error loading all quotations for metrics:', error);
    }
  };

  const loadQuotations = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Check if user is logged in
      if (status === 'loading') {
        setIsLoading(false);
        return;
      }
      
      if (!session?.user) {
        showError("Please log in to view quotations");
        setIsLoading(false);
        return;
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await fetch(`/api/quotations?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update pagination data
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.pages || 1);
        setTotalItems(data.pagination?.total || 0);
        
        // Map quotations to include customer name from either account, distributor, or lead
        const mappedQuotations = (data.quotations || []).map((q: any) => ({
          ...q,
          account: q.account ? {
            ...q.account,
            name: q.account.name || 'Unknown Customer'
          } : undefined,
          distributor: q.distributor ? {
            ...q.distributor,
            name: q.distributor.businessName || 'Unknown Distributor'
          } : undefined,
          lead: q.lead ? {
            ...q.lead,
            name: q.lead.firstName && q.lead.lastName ? `${q.lead.firstName} ${q.lead.lastName}` : 'Unknown Lead'
          } : undefined
        }));
        
        setQuotations(mappedQuotations);
      } else {
        if (response.status === 401) {
          showError("Please log in to view quotations");
          window.location.href = '/auth/signin';
      } else {
        showError("Failed to load quotations");
        }
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
      showError("Failed to load quotations", "Network error or server unavailable");
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

  const handleStatusUpdate = async (quotation: Quotation, newStatus: string) => {
    try {
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: quotation.subject,
          status: newStatus
        }),
      });

      if (response.ok) {
        success("Status Updated", `Quotation ${quotation.number} status updated to ${newStatus}`);
        loadQuotations(currentPage);
        loadAllQuotationsForMetrics();
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to update status");
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError("Failed to update status");
    }
  };

  const handleDeleteQuotation = async (quotation: Quotation) => {
    showConfirmation(
      "Delete Quotation",
      `Are you sure you want to delete quotation ${quotation.number}?`,
      "Delete Quotation",
      async () => {
    try {
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
      });

      if (response.ok) {
        success(`Quotation ${quotation.number} deleted successfully`);
        loadQuotations(); // Reload the list
            closeConfirmation(); // Close the modal
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to delete quotation");
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      showError("Failed to delete quotation");
    }
      }
    );
  };

  const handleDownload = async (quotation: Quotation) => {
    await downloadQuotationAsPDF(quotation as any, customLogo || undefined, showError, success);
  };

  // Helper function to show confirmation modal
  const showConfirmation = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm,
      type
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Bulk selection functions
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedQuotations(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(filteredQuotations.map(q => q.id));
      setSelectedQuotations(allIds);
      setIsAllSelected(true);
    }
  };

  const handleSelectQuotation = (quotationId: string) => {
    const newSelected = new Set(selectedQuotations);
    if (newSelected.has(quotationId)) {
      newSelected.delete(quotationId);
    } else {
      newSelected.add(quotationId);
    }
    setSelectedQuotations(newSelected);
    setIsAllSelected(newSelected.size === filteredQuotations.length);
  };

  const handleBulkDelete = async () => {
    if (selectedQuotations.size === 0) return;
    
    showConfirmation(
      "Delete Multiple Quotations",
      `Are you sure you want to delete ${selectedQuotations.size} quotation(s)?`,
      "Delete All",
      async () => {
        try {
          const deletePromises = Array.from(selectedQuotations).map(id => 
            fetch(`/api/quotations/${id}`, {
              method: 'DELETE',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            })
          );

          const results = await Promise.all(deletePromises);
          const failed = results.filter(r => !r.ok).length;
          
          if (failed === 0) {
            success(`Successfully deleted ${selectedQuotations.size} quotation(s)`);
            setSelectedQuotations(new Set());
            setIsAllSelected(false);
            loadQuotations(currentPage);
            loadAllQuotationsForMetrics();
            closeConfirmation(); // Close the modal
          } else {
            showError(`Failed to delete ${failed} quotation(s)`);
          }
        } catch (error) {
          console.error('Error bulk deleting quotations:', error);
          showError("Failed to delete quotations");
        }
      }
    );
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedQuotations.size === 0) return;

    try {
      const updatePromises = Array.from(selectedQuotations).map(id => 
        fetch(`/api/quotations/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      const results = await Promise.all(updatePromises);
      const failed = results.filter(r => !r.ok).length;
      
      if (failed === 0) {
        success(`Successfully updated ${selectedQuotations.size} quotation(s) to ${newStatus}`);
        setSelectedQuotations(new Set());
        setIsAllSelected(false);
        loadQuotations(currentPage);
        loadAllQuotationsForMetrics();
      } else {
        showError(`Failed to update ${failed} quotation(s)`);
      }
    } catch (error) {
      console.error('Error bulk updating quotations:', error);
      showError("Failed to update quotations");
    }
  };

  // Since we're using backend pagination and filtering, we don't need client-side filtering
  const filteredQuotations = quotations;

  const stats = {
    total: allQuotations.length,
    draft: allQuotations.filter(q => q.status === 'DRAFT').length,
    sent: allQuotations.filter(q => q.status === 'SENT').length,
    accepted: allQuotations.filter(q => q.status === 'ACCEPTED').length,
    totalValue: Number(allQuotations.reduce((sum, q) => sum + q.total, 0).toFixed(2)),
  };

  // Remove the loading return - we'll show skeleton loading instead

  return (
    <>
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
            {isLoading ? (
              <>
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Quotations Table with Search */}
        <Card>
          {/* Search and Filters Header */}
          <CardContent className="p-4 border-b">
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

          {/* Bulk Actions */}
          {selectedQuotations.size > 0 && (
            <CardContent className="p-4 border-b bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedQuotations.size} quotation(s) selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('DRAFT')}>
                        <Clock className="h-4 w-4 mr-2" />
                        Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('SENT')}>
                        <Send className="h-4 w-4 mr-2" />
                        Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('ACCEPTED')}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accepted
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('REJECTED')}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedQuotations(new Set());
                      setIsAllSelected(false);
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          {/* Table Content */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-4 h-4"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
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
                      <td colSpan={8} className="px-6 py-12 text-center">
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
                  ) : isLoading ? (
                    // Show skeleton rows while loading
                    Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonTableRow key={index} />
                    ))
                  ) : (
                    filteredQuotations.map((quotation) => (
                      <tr 
                        key={quotation.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/quotations/${quotation.id}`)}
                      >
                        <td 
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleSelectQuotation(quotation.id)}
                            className="flex items-center justify-center w-4 h-4"
                          >
                            {selectedQuotations.has(quotation.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
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
                            {quotation.account?.name || quotation.distributor?.name || quotation.lead?.name || 'Unknown'}
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
                        <td 
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="focus:outline-none">
                          {getStatusBadge(quotation.status)}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, 'DRAFT')}>
                                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, 'SENT')}>
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Sent
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, 'ACCEPTED')}>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, 'REJECTED')}>
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Rejected
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, 'EXPIRED')}>
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                Expired
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} quotations
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadQuotations(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 
                      ? i + 1 
                      : currentPage >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : currentPage - 2 + i;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => loadQuotations(pageNum)}
                        className={currentPage === pageNum ? `bg-${theme.primary} hover:bg-${theme.primaryDark} text-white border-0` : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadQuotations(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText="Cancel"
        type={confirmationModal.type}
        isLoading={false}
      />
    </>
  );
}

