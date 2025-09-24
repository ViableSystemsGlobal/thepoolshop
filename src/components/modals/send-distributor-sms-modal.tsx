'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Phone } from 'lucide-react';

interface SendDistributorSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId: string;
  distributorName: string;
  phoneNumber: string;
  onSent: () => void;
}

export default function SendDistributorSMSModal({
  isOpen,
  onClose,
  distributorId,
  distributorName,
  phoneNumber,
  onSent
}: SendDistributorSMSModalProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      error('Please enter a message');
      return;
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      error('Phone number is required');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/communication/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [phoneNumber.trim()],
          message: message.trim(),
          distributorId: distributorId,
          isBulk: false
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('SMS sent successfully!');
        setMessage('');
        onSent();
        onClose();
      } else {
        error(data.error || 'Failed to send SMS');
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
      error('An error occurred while sending SMS');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Send SMS</h2>
              <p className="text-sm text-gray-600">{distributorName}</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              disabled
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="mt-1 min-h-[100px]"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/160 characters
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send SMS
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
