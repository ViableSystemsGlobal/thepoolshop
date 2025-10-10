"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, X } from 'lucide-react';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';

interface SendQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    id: string;
    number: string;
    subject: string;
    account?: { name: string; email?: string; phone?: string; };
    distributor?: { businessName: string; email?: string; phone?: string; };
    lead?: { firstName: string; lastName: string; email?: string; phone?: string; company?: string; };
    total: number;
  };
}

export const SendQuoteModal: React.FC<SendQuoteModalProps> = ({
  isOpen,
  onClose,
  quotation,
}) => {
  const [email, setEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  // Get customer info
  const customerName = quotation.account?.name || 
                      quotation.distributor?.businessName || 
                      (quotation.lead ? `${quotation.lead.firstName} ${quotation.lead.lastName}`.trim() : '') ||
                      'Customer';
  const customerEmail = quotation.account?.email || quotation.distributor?.email || quotation.lead?.email || '';
  const customerPhone = quotation.account?.phone || quotation.distributor?.phone || quotation.lead?.phone || '';

  // Generate PDF link
  const pdfUrl = `${window.location.origin}/quotations/${quotation.id}/pdf`;

  useEffect(() => {
    if (isOpen) {
      setEmail(customerEmail);
      setCcEmail('');
      setPhone(customerPhone);
      setMessage(`Dear ${customerName},\n\nPlease find your quotation (No: ${quotation.number}, Subject: ${quotation.subject}) attached. The total amount is GH₵${quotation.total.toFixed(2)}.\n\nView your quote here: ${pdfUrl}\n\nBest regards,\nAD Pools Team`);
    }
  }, [isOpen, customerName, customerEmail, customerPhone, quotation, pdfUrl]);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      showError("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare recipients array
      const recipients = [email];
      if (ccEmail.trim()) {
        recipients.push(ccEmail.trim());
      }

      const response = await fetch('/api/communication/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients,
          subject: `Quotation ${quotation.number} - ${quotation.subject}`,
          message: message,
          isBulk: false,
          attachments: [
            {
              filename: `Quotation-${quotation.number}.pdf`,
              url: pdfUrl,
              contentType: 'application/pdf'
            }
          ]
        }),
      });

      if (response.ok) {
        const recipientText = ccEmail.trim() ? `${email} and ${ccEmail}` : email;
        success(`Quote sent via email to ${recipientText}`);
        onClose();
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showError("Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!phone.trim()) {
      showError("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    try {
      // Create SMS message with PDF link
      const smsMessage = `Dear ${customerName}, your quotation ${quotation.number} is ready. Total: GH₵${quotation.total.toFixed(2)}. View PDF: ${pdfUrl}`;

      const response = await fetch('/api/communication/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [phone],
          message: smsMessage,
          isBulk: false
        }),
      });

      if (response.ok) {
        success(`Quote sent via SMS to ${phone}`);
        onClose();
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to send SMS. Please try again.");
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      showError("Failed to send SMS. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Quotation {quotation.number}</DialogTitle>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ccEmail" className="text-right">
              CC
            </Label>
            <Input
              id="ccEmail"
              type="email"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              placeholder="Optional CC email"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="message" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3 h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSendEmail} 
            disabled={isLoading}
            className={`flex items-center gap-2 bg-${theme.primary} hover:bg-${theme.primaryDark} text-white border-0`}
          >
            {isLoading ? 'Sending...' : <><Mail className="h-4 w-4" /> Send Email</>}
          </Button>
          <Button 
            onClick={handleSendSMS} 
            disabled={isLoading}
            className={`flex items-center gap-2 bg-${theme.primary} hover:bg-${theme.primaryDark} text-white border-0`}
          >
            {isLoading ? 'Sending...' : <><MessageSquare className="h-4 w-4" /> Send SMS</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
