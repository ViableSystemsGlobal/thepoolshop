'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileDown,
  X,
  Search,
  User,
  Building,
  UserCheck,
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  subject: string;
  total: number;
  amountDue: number;
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
}

interface CreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId?: string; // Pre-select an invoice if provided
}

const REASON_OPTIONS = [
  { value: 'RETURN', label: 'Product Return' },
  { value: 'DAMAGED_GOODS', label: 'Damaged Goods' },
  { value: 'PRICING_ERROR', label: 'Pricing Error' },
  { value: 'BILLING_ERROR', label: 'Billing Error' },
  { value: 'GOODWILL_GESTURE', label: 'Goodwill Gesture' },
  { value: 'DISCOUNT_ADJUSTMENT', label: 'Discount Adjustment' },
  { value: 'DUPLICATE_INVOICE', label: 'Duplicate Invoice' },
  { value: 'PARTIAL_DELIVERY', label: 'Partial Delivery' },
  { value: 'QUALITY_ISSUE', label: 'Quality Issue' },
  { value: 'OTHER', label: 'Other' },
];

export function CreditNoteModal({ isOpen, onClose, onSuccess, invoiceId }: CreditNoteModalProps) {
  const { success, error: showError } = useToast();
  const { getThemeColor } = useTheme();

  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [currency, setCurrency] = useState('GHS');

  // Form data
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    reason: '',
    reasonDetails: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
      fetchCurrencySettings();
      
      // Pre-select invoice if provided
      if (invoiceId) {
        setFormData(prev => ({ ...prev, invoiceId }));
        fetchInvoiceDetails(invoiceId);
      }
    } else {
      // Reset form when modal closes
      setFormData({
        invoiceId: '',
        amount: '',
        reason: '',
        reasonDetails: '',
        notes: '',
      });
      setSelectedInvoice(null);
      setInvoiceSearch('');
      setShowInvoiceSearch(false);
    }
  }, [isOpen, invoiceId]);

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

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices?limit=100');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchInvoiceDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (response.ok) {
        const invoice = await response.json();
        setSelectedInvoice(invoice);
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
    }
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData(prev => ({ ...prev, invoiceId: invoice.id }));
    setShowInvoiceSearch(false);
    setInvoiceSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) {
      showError('Please select an invoice');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (!formData.reason) {
      showError('Please select a reason');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount > selectedInvoice.amountDue) {
      showError('Credit amount cannot exceed the invoice amount due');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/credit-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: formData.invoiceId,
          amount: amount,
          reason: formData.reason,
          reasonDetails: formData.reasonDetails || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        success('Credit note created successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to create credit note');
      }
    } catch (err) {
      console.error('Error creating credit note:', err);
      showError('Failed to create credit note');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = invoiceSearch.toLowerCase();
    return (
      invoice.number.toLowerCase().includes(searchLower) ||
      invoice.subject?.toLowerCase().includes(searchLower) ||
      invoice.account?.name.toLowerCase().includes(searchLower) ||
      invoice.distributor?.businessName.toLowerCase().includes(searchLower) ||
      `${invoice.lead?.firstName} ${invoice.lead?.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  const getCustomerName = (invoice: Invoice) => {
    if (invoice.account) return invoice.account.name;
    if (invoice.distributor) return invoice.distributor.businessName;
    if (invoice.lead) return `${invoice.lead.firstName} ${invoice.lead.lastName}`;
    return 'N/A';
  };

  const getCustomerIcon = (invoice: Invoice) => {
    if (invoice.account) return <Building className="h-4 w-4" />;
    if (invoice.distributor) return <Building className="h-4 w-4" />;
    if (invoice.lead) return <User className="h-4 w-4" />;
    return <UserCheck className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" style={{ color: getThemeColor() }} />
            Create Credit Note
          </DialogTitle>
          <DialogDescription>
            Create a new credit note for an invoice. The credit amount cannot exceed the invoice amount due.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice *</Label>
            {selectedInvoice ? (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCustomerIcon(selectedInvoice)}
                    <div>
                      <p className="font-medium text-gray-900">{selectedInvoice.number}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.subject}</p>
                      <p className="text-sm text-gray-500">
                        Customer: {getCustomerName(selectedInvoice)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount Due: {formatCurrency(selectedInvoice.amountDue, currency)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedInvoice(null);
                      setFormData(prev => ({ ...prev, invoiceId: '' }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search invoices by number, subject, or customer..."
                    value={invoiceSearch}
                    onChange={(e) => {
                      setInvoiceSearch(e.target.value);
                      setShowInvoiceSearch(true);
                    }}
                    onFocus={() => setShowInvoiceSearch(true)}
                    className="pl-10"
                  />
                </div>
                
                {showInvoiceSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredInvoices.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No invoices found
                      </div>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <button
                          key={invoice.id}
                          type="button"
                          onClick={() => handleInvoiceSelect(invoice)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {getCustomerIcon(invoice)}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{invoice.number}</p>
                              <p className="text-sm text-gray-600">{invoice.subject}</p>
                              <p className="text-sm text-gray-500">
                                {getCustomerName(invoice)} • Due: {formatCurrency(invoice.amountDue, currency)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Credit Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Credit Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency === 'GHS' ? 'GH₵' : currency}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={selectedInvoice?.amountDue || undefined}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-12"
                required
              />
            </div>
            {selectedInvoice && (
              <p className="text-sm text-gray-500">
                Maximum: {formatCurrency(selectedInvoice.amountDue, currency)}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <select
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select a reason</option>
              {REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Details */}
          <div className="space-y-2">
            <Label htmlFor="reasonDetails">Reason Details</Label>
            <Textarea
              id="reasonDetails"
              placeholder="Provide additional details about the reason for this credit note..."
              value={formData.reasonDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, reasonDetails: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or comments..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedInvoice || !formData.amount || !formData.reason}
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
            >
              {loading ? 'Creating...' : 'Create Credit Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
