"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { X, Calendar, DollarSign, Percent, Building2 } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  email?: string;
  type: string;
}

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const stageOptions = [
  { value: 'QUOTE_SENT', label: 'Quote Sent' },
  { value: 'QUOTE_REVIEWED', label: 'Quote Reviewed' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

export function AddOpportunityModal({ isOpen, onClose, onSave }: AddOpportunityModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    accountId: '',
    stage: 'QUOTE_SENT',
    value: '',
    probability: '25',
    closeDate: '',
    lostReason: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      // Reset form when modal opens
      setFormData({
        name: '',
        accountId: '',
        stage: 'QUOTE_SENT',
        value: '',
        probability: '25',
        closeDate: '',
        lostReason: '',
      });
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch('/api/accounts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    setFormData(prev => ({
      ...prev,
      accountId,
      name: selectedAccount?.name || prev.name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      showError('Error', 'Please select an account');
      return;
    }

    if (!formData.name.trim()) {
      showError('Error', 'Please enter an opportunity name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          accountId: formData.accountId,
          stage: formData.stage,
          value: formData.value ? parseFloat(formData.value) : null,
          probability: formData.probability ? parseInt(formData.probability) : 25,
          closeDate: formData.closeDate || null,
          lostReason: formData.lostReason || null,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        success('Opportunity created successfully');
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create opportunity');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to create opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Create New Opportunity</CardTitle>
            <CardDescription>
              Create an opportunity for an existing account
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Account Selection
              </h3>
              
              <div>
                <Label htmlFor="accountId">Account *</Label>
                {loadingAccounts ? (
                  <div className="px-3 py-2 border border-gray-300 rounded-md text-gray-500">
                    Loading accounts...
                  </div>
                ) : (
                  <select
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                  </select>
                )}
                {!loadingAccounts && accounts.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No accounts found. Please create an account first.
                  </p>
                )}
              </div>
            </div>

            {/* Opportunity Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Opportunity Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Opportunity Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={formData.accountId ? accounts.find(a => a.id === formData.accountId)?.name || 'Opportunity name' : 'Opportunity name'}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stage">Stage *</Label>
                  <select
                    id="stage"
                    value={formData.stage}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {stageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Opportunity Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Opportunity Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="value">Deal Value</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => handleInputChange('probability', e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="closeDate">Expected Close Date</Label>
                  <Input
                    id="closeDate"
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => handleInputChange('closeDate', e.target.value)}
                  />
                </div>
              </div>
              
              {formData.stage === 'LOST' && (
                <div>
                  <Label htmlFor="lostReason">Lost Reason</Label>
                  <Textarea
                    id="lostReason"
                    value={formData.lostReason}
                    onChange={(e) => handleInputChange('lostReason', e.target.value)}
                    rows={3}
                    placeholder="Explain why this opportunity was lost..."
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.accountId}
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                {isLoading ? 'Creating...' : 'Create Opportunity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

