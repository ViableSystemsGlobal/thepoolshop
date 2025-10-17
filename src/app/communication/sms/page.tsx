'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Smartphone, 
  Send, 
  Users, 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Upload
} from 'lucide-react';

interface SmsMessage {
  id: string;
  recipient: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: string;
  cost?: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function SmsPage() {
  const { themeColor, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { data: session } = useSession();
  const { success: showSuccess, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      showError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSingle = async () => {
    if (!recipient || !message) {
      showError('Please enter recipient phone number and message');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/communication/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [recipient],
          message,
          isBulk: false
        }),
      });

      if (response.ok) {
        showSuccess('SMS sent successfully!');
        setRecipient('');
        setMessage('');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      showError('Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBulk = async () => {
    if (selectedContacts.length === 0 || !message) {
      showError('Please select contacts and enter message');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/communication/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedContacts.map(c => c.phone),
          message,
          isBulk: true
        }),
      });

      if (response.ok) {
        showSuccess(`SMS sent to ${selectedContacts.length} contacts successfully!`);
        setSelectedContacts([]);
        setMessage('');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to send bulk SMS');
      }
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      showError('Failed to send bulk SMS');
    } finally {
      setIsSending(false);
    }
  };

  const toggleContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SMS Messages</h1>
            <p className="text-gray-600">Send SMS messages to individual contacts or in bulk</p>
          </div>
          <Button
            onClick={() => window.location.href = '/communication/sms-history'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            View History
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Smartphone className="h-4 w-4 inline mr-2" />
              Send Single SMS
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Send Bulk SMS
            </button>
          </nav>
        </div>

        {/* Single SMS Tab */}
        {activeTab === 'single' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Send Single SMS</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Phone Number</Label>
                <Input
                  id="recipient"
                  type="tel"
                  placeholder="+233XXXXXXXXX"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +233 for Ghana)
                </p>
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="mt-1 w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {message.length}/160 (SMS limit)
                </p>
              </div>

              <Button
                onClick={handleSendSingle}
                disabled={isSending || !recipient || !message}
                className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send SMS'}
              </Button>
            </div>
          </Card>
        )}

        {/* Bulk SMS Tab */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            {/* Message Input */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Compose Bulk Message</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkMessage">Message</Label>
                  <textarea
                    id="bulkMessage"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="mt-1 w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Characters: {message.length}/160 (SMS limit)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Selected: {selectedContacts.length} contacts
                  </div>
                  <Button
                    onClick={handleSendBulk}
                    disabled={isSending || selectedContacts.length === 0 || !message}
                    className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? 'Sending...' : `Send to ${selectedContacts.length} Contacts`}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Contact Selection */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Select Contacts</h3>
                <Button
                  onClick={() => setSelectedContacts(contacts)}
                  variant="outline"
                  size="sm"
                >
                  Select All
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading contacts...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {contacts.map((contact) => {
                    const isSelected = selectedContacts.some(c => c.id === contact.id);
                    return (
                      <div
                        key={contact.id}
                        onClick={() => toggleContact(contact)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? `border-${themeClasses.primary} bg-${themeClasses.primaryBg}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleContact(contact)}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.phone}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {contacts.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No contacts found</p>
                  <p className="text-sm">Add contacts in CRM to send bulk SMS</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
