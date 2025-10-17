"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { X, Calendar, DollarSign, Percent, Building2, User, Mail, Phone } from 'lucide-react';

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  value?: number;
  probability?: number;
  closeDate?: string;
  wonDate?: string;
  lostReason?: string;
  accountId?: string;
  leadId?: string;
  ownerId: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  account?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  quotations: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

interface EditOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onSave: () => void;
}

const stageOptions = [
  { value: 'QUOTE_SENT', label: 'Quote Sent' },
  { value: 'QUOTE_REVIEWED', label: 'Quote Reviewed' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

export function EditOpportunityModal({ isOpen, onClose, opportunity, onSave }: EditOpportunityModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    stage: 'QUOTE_SENT',
    value: '',
    probability: '',
    closeDate: '',
    lostReason: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name || '',
        stage: opportunity.stage || 'QUOTE_SENT',
        value: opportunity.value?.toString() || '',
        probability: opportunity.probability?.toString() || '',
        closeDate: opportunity.closeDate ? 
          new Date(opportunity.closeDate).toISOString().split('T')[0] : '',
        lostReason: opportunity.lostReason || '',
      });
    }
  }, [opportunity]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opportunity) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          stage: formData.stage,
          value: formData.value ? parseFloat(formData.value) : null,
          probability: formData.probability ? parseInt(formData.probability) : null,
          closeDate: formData.closeDate || null,
          lostReason: formData.lostReason || null,
        }),
      });

      if (response.ok) {
        success('Opportunity updated successfully');
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update opportunity');
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
      showError('Error', 'Failed to update opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Edit Opportunity</CardTitle>
            <CardDescription>
              Update the opportunity details and status
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
                    placeholder="0"
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
                disabled={isLoading}
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}