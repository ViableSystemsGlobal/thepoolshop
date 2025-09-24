'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface CreditApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: {
    id: string;
    businessName: string;
    firstName: string;
    lastName: string;
    currentCreditLimit?: number;
    currentCreditUsed?: number;
  };
  onApprovalComplete: () => void;
}

interface CreditSettings {
  managerLimit: number;
  directorLimit: number;
  superAdminLimit: number;
  defaultTerms: string;
}

export default function CreditApprovalModal({
  isOpen,
  onClose,
  distributor,
  onApprovalComplete
}: CreditApprovalModalProps) {
  const { data: session } = useSession();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [creditSettings, setCreditSettings] = useState<CreditSettings | null>(null);
  const [formData, setFormData] = useState({
    newCreditLimit: '',
    creditTerms: '',
    reason: '',
    notes: ''
  });

  // Load credit settings
  const loadCreditSettings = async () => {
    try {
      const response = await fetch('/api/settings/credit', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCreditSettings(data.data);
        setFormData(prev => ({
          ...prev,
          creditTerms: data.data.defaultTerms || 'Net 30'
        }));
      }
    } catch (err) {
      console.error('Error loading credit settings:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCreditSettings();
      // Set default credit limit based on current limit or default
      const currentLimit = distributor.currentCreditLimit || 2000;
      setFormData(prev => ({
        ...prev,
        newCreditLimit: currentLimit.toString()
      }));
    }
  }, [isOpen, distributor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newLimit = parseFloat(formData.newCreditLimit);
      const currentLimit = distributor.currentCreditLimit || 0;
      
      // Validate credit limit
      if (newLimit < 0) {
        error('Credit limit cannot be negative');
        return;
      }

      if (newLimit === currentLimit) {
        error('New credit limit must be different from current limit');
        return;
      }

      // Check approval authority (this would be done on the backend)
      const response = await fetch(`/api/drm/distributors/${distributor.id}/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newCreditLimit: newLimit,
          creditTerms: formData.creditTerms,
          reason: formData.reason,
          notes: formData.notes,
          action: newLimit > currentLimit ? 'INCREASE' : 'DECREASE'
        })
      });

      if (response.ok) {
        const data = await response.json();
        success(data.message || 'Credit limit updated successfully');
        onApprovalComplete();
        onClose();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to update credit limit');
      }
    } catch (err) {
      console.error('Error updating credit limit:', err);
      error('Error updating credit limit');
    } finally {
      setLoading(false);
    }
  };

  const getApprovalLevel = (amount: number) => {
    if (!creditSettings) return 'Unknown';
    
    if (amount <= creditSettings.managerLimit) return 'Manager';
    if (amount <= creditSettings.directorLimit) return 'Director';
    if (amount <= creditSettings.superAdminLimit) return 'Super Admin';
    return 'Board Approval Required';
  };

  const getApprovalColor = (amount: number) => {
    if (!creditSettings) return 'text-gray-600';
    
    if (amount <= creditSettings.managerLimit) return 'text-green-600';
    if (amount <= creditSettings.directorLimit) return 'text-blue-600';
    if (amount <= creditSettings.superAdminLimit) return 'text-purple-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  const currentLimit = distributor.currentCreditLimit || 0;
  const newLimit = parseFloat(formData.newCreditLimit) || 0;
  const changeAmount = newLimit - currentLimit;
  const changePercentage = currentLimit > 0 ? ((changeAmount / currentLimit) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Credit Limit Approval</h2>
                <p className="text-sm text-gray-600">{distributor.businessName}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Current Credit Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                GHS {currentLimit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Current Limit</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                GHS {distributor.currentCreditUsed?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600">Credit Used</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                GHS {(currentLimit - (distributor.currentCreditUsed || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Available Credit</p>
            </div>
          </div>

          {/* Approval Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Credit Limit */}
            <div>
              <Label htmlFor="newCreditLimit" className="text-sm font-medium">
                New Credit Limit (GHS)
              </Label>
              <Input
                id="newCreditLimit"
                type="number"
                value={formData.newCreditLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, newCreditLimit: e.target.value }))}
                placeholder="Enter new credit limit"
                min="0"
                step="100"
                required
                className="mt-1"
              />
            </div>

            {/* Credit Terms */}
            <div>
              <Label htmlFor="creditTerms" className="text-sm font-medium">
                Payment Terms
              </Label>
              <Input
                id="creditTerms"
                value={formData.creditTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, creditTerms: e.target.value }))}
                placeholder="e.g., Net 30, Net 60"
                required
                className="mt-1"
              />
            </div>

            {/* Change Summary */}
            {newLimit !== currentLimit && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">Change Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Change Amount:</span>
                    <span className={`ml-2 font-medium ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {changeAmount >= 0 ? '+' : ''}GHS {Math.abs(changeAmount).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Change %:</span>
                    <span className={`ml-2 font-medium ${changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Approval Required:</span>
                    <span className={`ml-2 font-medium ${getApprovalColor(newLimit)}`}>
                      {getApprovalLevel(newLimit)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Change *
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why this credit limit change is necessary..."
                rows={3}
                required
                className="mt-1"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information or conditions..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Approval Info */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Approval Information</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>This credit limit change will be recorded with your approval.</p>
                <p>Approval level: <span className="font-medium">{getApprovalLevel(newLimit)}</span></p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Credit Limit
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
