"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { SendInvoiceModal } from "../../components/modals/send-invoice-modal";
import { SkeletonTable, SkeletonMetricCard } from "@/components/ui/skeleton";
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
  DollarSign,
  TrendingUp,
  AlertCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  number: string;
  subject: string;
  status: 'DRAFT' | 'SENT' | 'OVERDUE' | 'VOID';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  total: number;
  amountPaid: number;
  amountDue: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  taxInclusive?: boolean;
  notes?: string;
  account?: {
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
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }>;
  owner: {
    id: string;
    name: string;
  };
}

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendInvoiceModalOpen, setSendInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currency, setCurrency] = useState('GHS');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalValue: 0,
    overdueAmount: 0,
    paidThisMonth: 0,
  });

  // Read URL parameters on mount
  useEffect(() => {
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    if (status) {
      setStatusFilter(status);
    }
    if (paymentStatus) {
      setPaymentStatusFilter(paymentStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    loadInvoices();
    fetchCurrencySettings();
  }, [statusFilter, paymentStatusFilter, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [statusFilter, paymentStatusFilter]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm]);

  const fetchCurrencySettings = async () => {
    try {
      const response = await fetch('/api/settings/currency');
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.baseCurrency || 'GHS');
      }
    } catch (err) {
      console.error('Error fetching currency settings:', err);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/invoices', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      if (paymentStatusFilter) {
        url.searchParams.append('paymentStatus', paymentStatusFilter);
      }
      
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalCount(data.total || 0);
        
        // Calculate stats from all invoices data
        const allInvoices = data.allInvoices || data.invoices || [];
        const totalInvoices = allInvoices.length;
        const totalValue = allInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
        const overdueAmount = allInvoices.filter((inv: Invoice) => 
          inv.status === 'OVERDUE' && inv.paymentStatus !== 'PAID'
        ).reduce((sum: number, inv: Invoice) => sum + inv.amountDue, 0);
        const paidThisMonth = allInvoices.filter((inv: Invoice) => 
          inv.paymentStatus === 'PAID' && 
          new Date(inv.paidDate || inv.issueDate).getMonth() === new Date().getMonth()
        ).reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
        
        setStats({
          totalInvoices,
          totalValue,
          overdueAmount,
          paidThisMonth,
        });
      } else {
        showError("Failed to load invoices");
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      showError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.account?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.distributor?.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.lead ? `${invoice.lead.firstName} ${invoice.lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) : false)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (paymentStatusFilter) {
      filtered = filtered.filter(invoice => invoice.paymentStatus === paymentStatusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
      OVERDUE: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
      VOID: { label: 'Void', className: 'bg-gray-100 text-gray-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      UNPAID: { label: 'Unpaid', className: 'bg-red-100 text-red-800' },
      PARTIALLY_PAID: { label: 'Partially Paid', className: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.UNPAID;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const isOverdueUnpaid = (invoice: Invoice) => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const isOverdue = dueDate < today;
    const isUnpaid = invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID';
    return isOverdue && isUnpaid;
  };

  const getInvoiceRowClassName = (invoice: Invoice) => {
    if (isOverdueUnpaid(invoice)) {
      return "bg-red-50 hover:bg-red-100 cursor-pointer transition-colors";
    }
    return "hover:bg-gray-50 cursor-pointer transition-colors";
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSendInvoiceModalOpen(true);
  };

  const handleConvertFromQuotation = async (invoice: Invoice) => {
    try {
      // TODO: Implement convert from quotation
      success(`Converting from quotation...`);
      // For now, just show a success message
      // Later we'll implement the actual conversion logic
    } catch (error) {
      console.error('Error converting from quotation:', error);
      showError("Failed to convert from quotation");
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success(`Invoice ${invoice.number} deleted successfully`);
        loadInvoices(); // Reload the list
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to delete invoice");
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showError("Failed to delete invoice");
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      // Create a new window with the invoice content formatted for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        showError("Unable to open print window. Please check your popup blocker.");
        return;
      }

      // Fetch the PDF content from our API
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (response.ok) {
        const htmlContent = await response.text();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
        
        success("Invoice ready for download/printing");
      } else {
        showError("Failed to generate invoice PDF");
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showError("Failed to download invoice");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Manage your customer invoices and payments</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/invoices/create">
              <Button className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side (2/3) */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Invoice Management AI"
              subtitle="Your intelligent assistant for payment optimization"
              recommendations={[
                {
                  id: '1',
                  title: "Follow up on overdue invoices",
                  description: `${stats.overdueAmount > 0 ? `${formatCurrency(stats.overdueAmount, currency)} in overdue amounts` : 'No overdue invoices'}`,
                  priority: stats.overdueAmount > 0 ? 'high' : 'low',
                  completed: false
                },
                {
                  id: '2',
                  title: "Payment reminders",
                  description: "Send payment reminders to customers with outstanding balances",
                  priority: 'medium',
                  completed: false
                },
                {
                  id: '3',
                  title: "Monthly summary",
                  description: `Total revenue this month: ${formatCurrency(stats.paidThisMonth, currency)}`,
                  priority: 'low',
                  completed: false
                }
              ]}
              onRecommendationComplete={(id) => {
                console.log('Recommendation completed:', id);
              }}
            />
          </div>

          {/* Metrics Cards - Right Side (1/3, 2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className={`text-2xl font-bold text-${theme.primary}`}>{formatCurrency(stats.totalValue, currency)}</p>
                </div>
                <DollarSign className={`h-8 w-8 text-${theme.primary}`} />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount, currency)}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid This Month</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidThisMonth, currency)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
            </Card>
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
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
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="OVERDUE">Overdue</option>
                <option value="VOID">Void</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}`}
              >
                <option value="">All Payment Statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-500 mb-4">
                          {searchTerm || statusFilter || paymentStatusFilter
                            ? "No invoices match your filters" 
                            : "No invoices yet"}
                        </p>
                        <Link href="/invoices/create">
                          <Button size="sm" className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Invoice
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr 
                        key={invoice.id} 
                        className={getInvoiceRowClassName(invoice)}
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{invoice.number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{invoice.subject}</div>
                          <div className="text-sm text-gray-500">
                            {invoice.account?.name || invoice.distributor?.businessName || (invoice.lead ? `${invoice.lead.firstName} ${invoice.lead.lastName}` : 'Unknown')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.total, currency)}
                          </div>
                          {invoice.amountDue > 0 && (
                            <div className="text-sm text-red-600">
                              Due: {formatCurrency(invoice.amountDue, currency)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(invoice.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              title="View invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                              title="Edit invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDownload(invoice)}
                              title="Download as PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleSendInvoice(invoice)}
                              title="Send invoice via email/SMS"
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
                                <DropdownMenuItem onClick={() => handleConvertFromQuotation(invoice)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteInvoice(invoice)}
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
            {!loading && filteredInvoices.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} invoices
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        const totalPages = Math.ceil(totalCount / itemsPerPage);
                        return page === 1 || 
                               page === totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center gap-1">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Button
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-10"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Invoice Modal */}
        {selectedInvoice && (
          <SendInvoiceModal
            isOpen={sendInvoiceModalOpen}
            onClose={() => {
              setSendInvoiceModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
        )}
      </div>
    </>
  );
}
