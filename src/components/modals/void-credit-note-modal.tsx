'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Ban,
} from 'lucide-react';

interface VoidCreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  creditNoteId: string;
  creditNoteNumber: string;
  hasApplications: boolean;
}

export function VoidCreditNoteModal({
  isOpen,
  onClose,
  onSuccess,
  creditNoteId,
  creditNoteNumber,
  hasApplications,
}: VoidCreditNoteModalProps) {
  const { success, error: showError } = useToast();
  const { getThemeColor } = useTheme();

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      showError('Please provide a reason for voiding this credit note');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/credit-notes/${creditNoteId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      if (response.ok) {
        success(`Credit note ${creditNoteNumber} has been voided successfully`);
        onSuccess();
        onClose();
        setReason('');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to void credit note');
      }
    } catch (err) {
      console.error('Error voiding credit note:', err);
      showError('Failed to void credit note');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Void Credit Note
          </DialogTitle>
          <DialogDescription>
            This action will permanently void credit note {creditNoteNumber}.
            {hasApplications && (
              <span className="block mt-2 text-orange-600 font-medium">
                ⚠️ This credit note has been applied to invoices. Voiding will reverse all applications.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Voiding *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for voiding this credit note..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Ban className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Warning:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• This action cannot be undone</li>
                  <li>• The credit note will be marked as void</li>
                  {hasApplications && (
                    <li>• All applications will be reversed</li>
                  )}
                  <li>• Invoice amounts will be adjusted accordingly</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              variant="destructive"
            >
              {loading ? 'Voiding...' : 'Void Credit Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
