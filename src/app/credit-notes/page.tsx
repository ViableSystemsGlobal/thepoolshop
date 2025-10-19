'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { formatCurrency } from '@/lib/utils';
import { CreditNoteModal } from '@/components/modals/credit-note-modal';
import {
  FileDown,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface CreditNote {
  id: string;
  number: string;
  invoiceId: string;
  amount: number;
  appliedAmount: number;
  remainingAmount: number;
  reason: string;
  reasonDetails?: string;
  notes?: string;
  status: string;
  issueDate: string;
  appliedDate?: string;
  voidedDate?: string;
  invoice: {
    id: string;
    number: string;
    subject: string;
    total: number;
  };
  account?: {
    id: string;
    name: string;
    email: string;
  };
  distributor?: {
    id: string;
    businessName: string;
    email: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  applications: Array<{
    id: string;
    invoiceId: string;
    amount: number;
    appliedAt: string;
    notes?: string;
  }>;
}

interface Metrics {
  totalAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  pendingCount: number;
  partiallyAppliedCount: number;
  fullyAppliedCount: number;
  voidCount: number;
}

const REASON_LABELS: Record<string, string> = {
  RETURN: 'Product Return',
  DAMAGED_GOODS: 'Damaged Goods',
  PRICING_ERROR: 'Pricing Error',
  BILLING_ERROR: 'Billing Error',
  GOODWILL_GESTURE: 'Goodwill Gesture',
  DISCOUNT_ADJUSTMENT: 'Discount Adjustment',
  DUPLICATE_INVOICE: 'Duplicate Invoice',
  PARTIAL_DELIVERY: 'Partial Delivery',
  QUALITY_ISSUE: 'Quality Issue',
  OTHER: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PARTIALLY_APPLIED: 'Partially Applied',
  FULLY_APPLIED: 'Fully Applied',
  VOID: 'Void',
};

export default function CreditNotesPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { getThemeColor } = useTheme();

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalAmount: 0,
    appliedAmount: 0,
    remainingAmount: 0,
    pendingCount: 0,
    partiallyAppliedCount: 0,
    fullyAppliedCount: 0,
    voidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCreditNotes();
    fetchCurrencySettings();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [statusFilter]);

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

  const loadCreditNotes = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/credit-notes', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());

      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setCreditNotes(data.creditNotes || []);
        setTotalCount(data.total || 0);
        setMetrics(data.metrics || {});
      } else {
        showError('Failed to load credit notes');
      }
    } catch (err) {
      console.error('Error loading credit notes:', err);
      showError('Failed to load credit notes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIALLY_APPLIED: 'bg-blue-100 text-blue-800',
      FULLY_APPLIED: 'bg-green-100 text-green-800',
      VOID: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  };

  const getCustomerName = (creditNote: CreditNote) => {
    if (creditNote.account) {
      return creditNote.account.name;
    }
    if (creditNote.distributor) {
      return creditNote.distributor.businessName;
    }
    if (creditNote.lead) {
      return `${creditNote.lead.firstName} ${creditNote.lead.lastName}`;
    }
    return 'N/A';
  };

  // Filter credit notes by search term
  const filteredCreditNotes = creditNotes.filter((cn) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cn.number.toLowerCase().includes(searchLower) ||
      cn.invoice.number.toLowerCase().includes(searchLower) ||
      getCustomerName(cn).toLowerCase().includes(searchLower) ||
      REASON_LABELS[cn.reason]?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
          <p className="text-gray-500 mt-1">Manage and track credit notes issued to customers</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{ backgroundColor: getThemeColor(), color: 'white' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Credit Note
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Credit Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.totalAmount, currency)}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getThemeColor()}20` }}
              >
                <DollarSign className="h-6 w-6" style={{ color: getThemeColor() }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applied Amount</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(metrics.appliedAmount, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.fullyAppliedCount} fully applied
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining Amount</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(metrics.remainingAmount, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.pendingCount + metrics.partiallyAppliedCount} active
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Void Credit Notes</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{metrics.voidCount}</p>
                <p className="text-xs text-gray-500 mt-1">Cancelled credits</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Notes List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by credit note number, invoice number, customer, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_APPLIED">Partially Applied</option>
                <option value="FULLY_APPLIED">Fully Applied</option>
                <option value="VOID">Void</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Note #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredCreditNotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <FileDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter
                          ? 'No credit notes match your filters'
                          : 'No credit notes yet'}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        style={{ backgroundColor: getThemeColor(), color: 'white' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Credit Note
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredCreditNotes.map((creditNote) => (
                    <tr
                      key={creditNote.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/credit-notes/${creditNote.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileDown className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{creditNote.number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{creditNote.invoice.number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getCustomerName(creditNote)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{REASON_LABELS[creditNote.reason] || creditNote.reason}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(creditNote.amount, currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-orange-600">
                          {formatCurrency(creditNote.remainingAmount, currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(creditNote.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(creditNote.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/credit-notes/${creditNote.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredCreditNotes.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} credit notes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
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
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Credit Note Modal */}
      <CreditNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadCreditNotes();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

