'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';

interface Invoice {
  id: string;
  number: string;
  total: number;
  amountPaid: number;
  amountDue: number;
}

interface InvoiceAllocation {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  maxAmount: number;
  notes?: string;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: string;
  accountName: string;
  preSelectedInvoice?: Invoice; // Optional: pre-select an invoice
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'CHECK', label: 'Check' }
];

export function AddPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  accountId,
  accountName,
  preSelectedInvoice
}: AddPaymentModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    method: 'CASH',
    reference: '',
    notes: '',
  });

  const [allocations, setAllocations] = useState<InvoiceAllocation[]>([]);

  useEffect(() => {
    if (isOpen && accountId) {
      loadUnpaidInvoices();
    }
  }, [isOpen, accountId]);

  useEffect(() => {
    // Pre-select invoice if provided
    if (preSelectedInvoice && allocations.length === 0) {
      setAllocations([{
        invoiceId: preSelectedInvoice.id,
        invoiceNumber: preSelectedInvoice.number,
        amount: preSelectedInvoice.amountDue,
        maxAmount: preSelectedInvoice.amountDue
      }]);
      setFormData(prev => ({
        ...prev,
        amount: preSelectedInvoice.amountDue.toString()
      }));
    }
  }, [preSelectedInvoice, allocations.length]);

  const loadUnpaidInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await fetch(`/api/invoices?accountId=${accountId}&paymentStatus=UNPAID,PARTIALLY_PAID`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        console.error('Failed to load invoices');
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // For amount fields, enforce 2 decimal places
    if (field === 'amount') {
      // Remove any non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      // If it contains a decimal point, limit to 2 decimal places
      if (numericValue.includes('.')) {
        const [integer, decimal] = numericValue.split('.');
        const limitedDecimal = decimal ? decimal.substring(0, 2) : '';
        const finalValue = integer + (limitedDecimal ? '.' + limitedDecimal : '');
        setFormData(prev => ({ ...prev, [field]: finalValue }));
      } else {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addAllocation = () => {
    const availableInvoices = invoices.filter(
      invoice => !allocations.some(alloc => alloc.invoiceId === invoice.id)
    );

    if (availableInvoices.length === 0) {
      error('No more unpaid invoices available');
      return;
    }

    const firstAvailable = availableInvoices[0];
    setAllocations(prev => [...prev, {
      invoiceId: firstAvailable.id,
      invoiceNumber: firstAvailable.number,
      amount: Math.min(firstAvailable.amountDue, parseFloat(formData.amount) || 0),
      maxAmount: firstAvailable.amountDue
    }]);
  };

  const removeAllocation = (index: number) => {
    setAllocations(prev => prev.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: string, value: string | number) => {
    // For amount fields, enforce 2 decimal places
    if (field === 'amount' && typeof value === 'string') {
      // Remove any non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      // If it contains a decimal point, limit to 2 decimal places
      if (numericValue.includes('.')) {
        const [integer, decimal] = numericValue.split('.');
        const limitedDecimal = decimal ? decimal.substring(0, 2) : '';
        const finalValue = parseFloat(integer + (limitedDecimal ? '.' + limitedDecimal : ''));
        setAllocations(prev => prev.map((alloc, i) => 
          i === index ? { ...alloc, [field]: finalValue } : alloc
        ));
      } else {
        const finalValue = parseFloat(numericValue) || 0;
        setAllocations(prev => prev.map((alloc, i) => 
          i === index ? { ...alloc, [field]: finalValue } : alloc
        ));
      }
    } else {
      setAllocations(prev => prev.map((alloc, i) => 
        i === index ? { ...alloc, [field]: value } : alloc
      ));
    }
  };

  const getTotalAllocated = () => {
    return allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  };

  const getUnallocatedAmount = () => {
    const paymentAmount = parseFloat(formData.amount) || 0;
    return paymentAmount - getTotalAllocated();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentAmount = parseFloat(formData.amount);
      
      if (!paymentAmount || paymentAmount <= 0) {
        error('Please enter a valid payment amount');
        return;
      }

      const totalAllocated = getTotalAllocated();
      if (totalAllocated > paymentAmount) {
        error('Total allocated amount cannot exceed payment amount');
        return;
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountId,
          amount: paymentAmount,
          method: formData.method,
          reference: formData.reference || null,
          notes: formData.notes || null,
          invoiceAllocations: allocations.map(alloc => ({
            invoiceId: alloc.invoiceId,
            amount: alloc.amount,
            notes: alloc.notes || null
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record payment');
      }

      const payment = await response.json();
      success(`Payment ${payment.number} recorded successfully!`);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        method: 'CASH',
        reference: '',
        notes: '',
      });
      setAllocations([]);
    } catch (err) {
      console.error('Error recording payment:', err);
      error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Record Payment</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
            <p className="text-gray-700">{accountName}</p>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <select
                id="method"
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="reference">Reference/Transaction ID</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              placeholder="e.g., Bank reference, Mobile money transaction ID"
            />
          </div>

          {/* Invoice Allocations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Allocate to Invoices</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAllocation}
                disabled={loadingInvoices || invoices.length === allocations.length}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Invoice
              </Button>
            </div>

            {loadingInvoices ? (
              <div className="text-center py-4 text-gray-500">Loading invoices...</div>
            ) : allocations.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No invoice allocations added.</p>
                <p className="text-sm">Payment will be recorded as unallocated credit.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allocations.map((allocation, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <select
                        value={allocation.invoiceId}
                        onChange={(e) => {
                          const selectedInvoice = invoices.find(inv => inv.id === e.target.value);
                          if (selectedInvoice) {
                            updateAllocation(index, 'invoiceId', selectedInvoice.id);
                            updateAllocation(index, 'invoiceNumber', selectedInvoice.number);
                            updateAllocation(index, 'maxAmount', selectedInvoice.amountDue);
                            updateAllocation(index, 'amount', Math.min(allocation.amount, selectedInvoice.amountDue));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {invoices
                          .filter(invoice => 
                            invoice.id === allocation.invoiceId || 
                            !allocations.some(alloc => alloc.invoiceId === invoice.id)
                          )
                          .map(invoice => (
                            <option key={invoice.id} value={invoice.id}>
                              {invoice.number} - Due: GH₵{invoice.amountDue.toFixed(2)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={allocation.maxAmount}
                        value={allocation.amount}
                        onChange={(e) => updateAllocation(index, 'amount', e.target.value)}
                        placeholder="Amount"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllocation(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {/* Allocation Summary */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span>GH₵{parseFloat(formData.amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allocated:</span>
                    <span>GH₵{getTotalAllocated().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Unallocated:</span>
                    <span className={getUnallocatedAmount() < 0 ? 'text-red-600' : 'text-green-600'}>
                      GH₵{getUnallocatedAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes about this payment..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={loading || !formData.amount || parseFloat(formData.amount) <= 0}
              className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
