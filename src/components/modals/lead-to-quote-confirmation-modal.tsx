'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2, User, FileText, ArrowRight } from 'lucide-react';

interface LeadToQuoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leadData: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
}

export default function LeadToQuoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  leadData
}: LeadToQuoteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error creating quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const accountName = leadData.company || `${leadData.name} (Individual)`;
  const contactName = leadData.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Create Quote from Lead
          </DialogTitle>
          <DialogDescription>
            This action will create the necessary CRM records and convert the lead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">What will be created:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-amber-700">
                <Building2 className="h-4 w-4" />
                <span><strong>Account:</strong> {accountName}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <User className="h-4 w-4" />
                <span><strong>Contact:</strong> {contactName}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <FileText className="h-4 w-4" />
                <span><strong>Quote:</strong> Quotation for {contactName}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Lead Status:</h4>
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <span>Lead: {leadData.name}</span>
              <ArrowRight className="h-4 w-4" />
              <span>Opportunity: {leadData.name}</span>
            </div>
            <p className="text-blue-600 text-xs mt-1">
              The lead will be converted to an opportunity and moved to the CRM pipeline.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
