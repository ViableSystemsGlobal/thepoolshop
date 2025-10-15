'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReturnStatus, ReturnReason } from '@prisma/client';

interface Return {
  id: string;
  number: string;
  reason: ReturnReason;
  status: ReturnStatus;
  subtotal: number;
  tax: number;
  total: number;
  refundAmount: number;
  refundMethod?: string;
  notes?: string;
  createdAt: string;
  account: {
    id: string;
    name: string;
  };
  salesOrder: {
    id: string;
    number: string;
  };
  creator: {
    id: string;
    name: string;
  };
  lines: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    reason?: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
}

interface EditReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  returnData: Return;
}

export function EditReturnModal({
  isOpen,
  onClose,
  onSuccess,
  returnData,
}: EditReturnModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: returnData.status,
    refundAmount: returnData.refundAmount.toString(),
    refundMethod: returnData.refundMethod || '',
    notes: returnData.notes || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        status: returnData.status,
        refundAmount: returnData.refundAmount.toString(),
        refundMethod: returnData.refundMethod || '',
        notes: returnData.notes || '',
      });
    }
  }, [isOpen, returnData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/returns/${returnData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          refundAmount: parseFloat(formData.refundAmount) || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update return');
      }

      success('Return updated successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error updating return:', err);
      error(err instanceof Error ? err.message : 'Failed to update return');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableStatuses = Object.values(ReturnStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Return - {returnData.number}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Information (Read-only) */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Return Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Return Number:</span>
                <p className="text-gray-900">{returnData.number}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <p className="text-gray-900">{returnData.account.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sales Order:</span>
                <p className="text-gray-900">{returnData.salesOrder.number}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Reason:</span>
                <p className="text-gray-900">{returnData.reason.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Amount:</span>
                <p className="text-gray-900">{formatCurrency(returnData.total)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-900">{formatDate(returnData.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created By:</span>
                <p className="text-gray-900">{returnData.creator.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Items:</span>
                <p className="text-gray-900">{returnData.lines.length} item{returnData.lines.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as ReturnStatus)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                required
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0"
                max={returnData.total}
                value={formData.refundAmount}
                onChange={(e) => handleChange('refundAmount', e.target.value)}
                placeholder="0.00"
                className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
              />
              <p className="text-xs text-gray-500 mt-1">Max: {formatCurrency(returnData.total)}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="refundMethod">Refund Method</Label>
            <select
              id="refundMethod"
              value={formData.refundMethod}
              onChange={(e) => handleChange('refundMethod', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
            >
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="credit_note">Credit Note</option>
              <option value="store_credit">Store Credit</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Any additional notes about this return..."
              className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
            />
          </div>

          {/* Return Items (Read-only) */}
          <div>
            <h3 className="text-lg font-medium mb-4">Return Items</h3>
            <div className="space-y-3">
              {returnData.lines.map((line) => (
                <div key={line.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Product:</span>
                      <p className="text-gray-900">{line.product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {line.product.sku}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Quantity:</span>
                      <p className="text-gray-900">{line.quantity}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Unit Price:</span>
                      <p className="text-gray-900">{formatCurrency(line.unitPrice)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total:</span>
                      <p className="text-gray-900 font-medium">{formatCurrency(line.lineTotal)}</p>
                    </div>
                  </div>
                  {line.reason && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-900 text-sm">{line.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

