'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { formatCurrency } from '@/lib/utils';
import { ApplyCreditNoteModal } from '@/components/modals/apply-credit-note-modal';
import { VoidCreditNoteModal } from '@/components/modals/void-credit-note-modal';
import {
  ArrowLeft,
  FileDown,
  User,
  Building,
  UserCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Ban,
  CreditCard,
  Plus,
} from 'lucide-react';

interface CreditNoteDetail {
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
    amountDue: number;
    issueDate: string;
    dueDate: string;
  };
  account?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  distributor?: {
    id: string;
    businessName: string;
    email: string;
    phone?: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  voider?: {
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
    appliedByUser: {
      name: string;
      email: string;
    };
    invoice: {
      number: string;
      subject: string;
    };
  }>;
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

export default function CreditNoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { getThemeColor } = useTheme();

  const [creditNote, setCreditNote] = useState<CreditNoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('GHS');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCreditNoteDetails();
      fetchCurrencySettings();
    }
  }, [id]);

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

  const fetchCreditNoteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/credit-notes/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Credit note not found.');
        } else {
          const errData = await response.json();
          setError(errData.error || 'Failed to fetch credit note details.');
        }
        return;
      }
      const data = await response.json();
      setCreditNote(data);
    } catch (err) {
      console.error('Error fetching credit note details:', err);
      setError('An unexpected error occurred.');
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
      <Badge className={styles[status] || styles.PENDING}>
        {STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PARTIALLY_APPLIED':
        return <AlertCircle className="h-4 w-4" />;
      case 'FULLY_APPLIED':
        return <CheckCircle className="h-4 w-4" />;
      case 'VOID':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCustomerName = (creditNote: CreditNoteDetail) => {
    if (creditNote.account) return creditNote.account.name;
    if (creditNote.distributor) return creditNote.distributor.businessName;
    if (creditNote.lead) return `${creditNote.lead.firstName} ${creditNote.lead.lastName}`;
    return 'N/A';
  };

  const getCustomerIcon = (creditNote: CreditNoteDetail) => {
    if (creditNote.account) return <Building className="h-4 w-4" />;
    if (creditNote.distributor) return <Building className="h-4 w-4" />;
    if (creditNote.lead) return <User className="h-4 w-4" />;
    return <UserCheck className="h-4 w-4" />;
  };

  const getCustomerEmail = (creditNote: CreditNoteDetail) => {
    if (creditNote.account) return creditNote.account.email;
    if (creditNote.distributor) return creditNote.distributor.email;
    if (creditNote.lead) return creditNote.lead.email;
    return 'N/A';
  };

  const getCustomerPhone = (creditNote: CreditNoteDetail) => {
    if (creditNote.account) return creditNote.account.phone;
    if (creditNote.distributor) return creditNote.distributor.phone;
    if (creditNote.lead) return creditNote.lead.phone;
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading credit note details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  if (!creditNote) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No credit note data available.</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Credit Notes
        </Button>
        <div className="flex items-center gap-2">
          {creditNote.status === 'PENDING' && (
            <Button
              onClick={() => router.push(`/credit-notes/${creditNote.id}/edit`)}
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
              className="hover:opacity-90"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
          {(creditNote.status === 'PENDING' || creditNote.status === 'PARTIALLY_APPLIED') && (
            <Button
              onClick={() => setShowApplyModal(true)}
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" /> Apply to Invoice
            </Button>
          )}
          {creditNote.status !== 'VOID' && (
            <Button
              variant="destructive"
              onClick={() => setShowVoidModal(true)}
            >
              <Ban className="h-4 w-4 mr-2" /> Void
            </Button>
          )}
        </div>
      </div>

      {/* Credit Note Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-6 w-6" style={{ color: getThemeColor() }} />
            Credit Note: {creditNote.number}
            {getStatusBadge(creditNote.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Credit Note Information</h3>
            <div className="space-y-2">
              <p><strong>Number:</strong> {creditNote.number}</p>
              <p><strong>Status:</strong> {getStatusIcon(creditNote.status)} {STATUS_LABELS[creditNote.status]}</p>
              <p><strong>Issue Date:</strong> {new Date(creditNote.issueDate).toLocaleDateString()}</p>
              {creditNote.appliedDate && (
                <p><strong>Applied Date:</strong> {new Date(creditNote.appliedDate).toLocaleDateString()}</p>
              )}
              {creditNote.voidedDate && (
                <p><strong>Voided Date:</strong> {new Date(creditNote.voidedDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Amount Information</h3>
            <div className="space-y-2">
              <p><strong>Credit Amount:</strong> {formatCurrency(creditNote.amount, currency)}</p>
              <p><strong>Applied Amount:</strong> {formatCurrency(creditNote.appliedAmount, currency)}</p>
              <p><strong>Remaining Amount:</strong> {formatCurrency(creditNote.remainingAmount, currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCustomerIcon(creditNote)}
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {getCustomerName(creditNote)}</p>
              <p><strong>Email:</strong> {getCustomerEmail(creditNote)}</p>
              <p><strong>Phone:</strong> {getCustomerPhone(creditNote) || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Type:</strong> {
                creditNote.account ? 'Account' :
                creditNote.distributor ? 'Distributor' :
                creditNote.lead ? 'Lead' : 'Unknown'
              }</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Invoice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" style={{ color: getThemeColor() }} />
            Related Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Invoice Number:</strong> {creditNote.invoice.number}</p>
              <p><strong>Subject:</strong> {creditNote.invoice.subject}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(creditNote.invoice.total, currency)}</p>
            </div>
            <div>
              <p><strong>Issue Date:</strong> {new Date(creditNote.invoice.issueDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> {new Date(creditNote.invoice.dueDate).toLocaleDateString()}</p>
              <p><strong>Amount Due:</strong> {formatCurrency(creditNote.invoice.amountDue, currency)}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/invoices/${creditNote.invoice.id}`)}
            >
              View Invoice Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reason and Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" style={{ color: getThemeColor() }} />
            Reason & Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Reason:</strong> {REASON_LABELS[creditNote.reason] || creditNote.reason}</p>
          </div>
          {creditNote.reasonDetails && (
            <div>
              <p><strong>Reason Details:</strong></p>
              <p className="text-gray-700 whitespace-pre-wrap">{creditNote.reasonDetails}</p>
            </div>
          )}
          {creditNote.notes && (
            <div>
              <p><strong>Notes:</strong></p>
              <p className="text-gray-700 whitespace-pre-wrap">{creditNote.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications */}
      {creditNote.applications && creditNote.applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" style={{ color: getThemeColor() }} />
              Credit Applications ({creditNote.applications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied To Invoice
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Applied
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditNote.applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.invoice.number}</p>
                          <p className="text-sm text-gray-500">{application.invoice.subject}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(application.amount, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.appliedByUser.name}</p>
                          <p className="text-sm text-gray-500">{application.appliedByUser.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {application.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owner Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" style={{ color: getThemeColor() }} />
            Ownership Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Created By:</strong> {creditNote.owner.name}</p>
              <p><strong>Email:</strong> {creditNote.owner.email}</p>
            </div>
            {creditNote.voider && (
              <div>
                <p><strong>Voided By:</strong> {creditNote.voider.name}</p>
                <p><strong>Email:</strong> {creditNote.voider.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Apply Credit Note Modal */}
      {creditNote && (
        <ApplyCreditNoteModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            fetchCreditNoteDetails();
            setShowApplyModal(false);
          }}
          creditNoteId={creditNote.id}
          creditNoteNumber={creditNote.number}
          remainingAmount={creditNote.remainingAmount}
          currency={currency}
        />
      )}

      {/* Void Credit Note Modal */}
      {creditNote && (
        <VoidCreditNoteModal
          isOpen={showVoidModal}
          onClose={() => setShowVoidModal(false)}
          onSuccess={() => {
            fetchCreditNoteDetails();
            setShowVoidModal(false);
          }}
          creditNoteId={creditNote.id}
          creditNoteNumber={creditNote.number}
          hasApplications={creditNote.applications.length > 0}
        />
      )}
    </div>
  );
}
