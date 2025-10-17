'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Send, Users, Mail, History, Plus, Trash2, Check, X } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
}

interface EmailMessage {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt: string;
  errorMessage?: string;
}

export default function EmailCommunicationPage() {
  const { data: session } = useSession();
  const { themeColor, getThemeClasses } = useTheme();
  const { success: showSuccess, error: showError } = useToast();
  const themeClasses = getThemeClasses();

  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [manualEmail, setManualEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [showHistory, setShowHistory] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailMessage[]>([]);

  // Load contacts
  useEffect(() => {
    loadContacts();
    loadEmailHistory();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/contacts?email=true');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      showError('Failed to load contacts');
    }
  };

  const loadEmailHistory = async () => {
    try {
      const response = await fetch('/api/communication/email/history');
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading email history:', error);
    }
  };

  const handleSendSingle = async () => {
    if (!recipients[0] || !subject.trim() || !message.trim()) {
      showError('Please enter recipient, subject, and message');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/communication/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients.map(r => r.email),
          subject,
          message,
          isBulk: false
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess('Email sent successfully!');
        setSubject('');
        setMessage('');
        setRecipients([]);
        loadEmailHistory();
      } else {
        showError(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showError('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulk = async () => {
    if (recipients.length === 0 || !subject.trim() || !message.trim()) {
      showError('Please select contacts and enter subject and message');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/communication/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients.map(r => r.email),
          subject,
          message,
          isBulk: true
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess(`Email sent to ${recipients.length} contacts successfully!`);
        setRecipients([]);
        setSubject('');
        setMessage('');
        loadEmailHistory();
      } else {
        showError(result.error || 'Failed to send bulk email');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      showError('Failed to send bulk email');
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = (contact: Contact) => {
    if (!recipients.find(r => r.id === contact.id)) {
      setRecipients([...recipients, contact]);
    }
  };

  const addManualEmail = () => {
    const email = manualEmail.trim();
    if (!email) {
      showError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (recipients.find(r => r.email === email)) {
      showError('This email address is already added');
      return;
    }

    const newContact: Contact = {
      id: `manual-${Date.now()}`,
      name: email,
      email: email
    };

    setRecipients([...recipients, newContact]);
    setManualEmail('');
  };

  const removeContact = (contactId: string) => {
    setRecipients(recipients.filter(r => r.id !== contactId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'DELIVERED':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'FAILED':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email Messages</h1>
            <p className="text-gray-600">Send emails to customers and contacts</p>
          </div>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Hide History' : 'View History'}
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
              <Mail className="h-4 w-4 inline mr-2" />
              Send Single Email
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
              Send Bulk Email
            </button>
          </nav>
        </div>

        {/* Single Email Tab */}
        {activeTab === 'single' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Send Single Email</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <div className="mt-1 space-y-2">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{recipient.name} ({recipient.email})</span>
                      <Button
                        onClick={() => removeContact(recipient.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Manual email entry */}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address..."
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addManualEmail();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={addManualEmail}
                      variant="outline"
                      size="sm"
                      className="px-4"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Contact selection */}
                  {recipients.length === 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Or select from existing contacts:</p>
                      <select
                        onChange={(e) => {
                          const contact = contacts.find(c => c.id === e.target.value);
                          if (contact) addContact(contact);
                          e.target.value = '';
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a contact...</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {contact.name} ({contact.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
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
                  className="mt-1 h-32"
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSendSingle}
                disabled={isLoading || recipients.length === 0 || !subject || !message}
                className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </Card>
        )}

        {/* Bulk Email Tab */}
        {activeTab === 'bulk' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Send Bulk Email</h3>
            <div className="space-y-4">
              <div>
                <Label>Selected Recipients ({recipients.length})</Label>
                <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{recipient.name} ({recipient.email})</span>
                      <Button
                        onClick={() => removeContact(recipient.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Manual email entry */}
                <div className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addManualEmail();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={addManualEmail}
                    variant="outline"
                    size="sm"
                    className="px-4"
                  >
                    Add
                  </Button>
                </div>

                {/* Contact selection */}
                <select
                  onChange={(e) => {
                    const contact = contacts.find(c => c.id === e.target.value);
                    if (contact) addContact(contact);
                    e.target.value = '';
                  }}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Or select from existing contacts...</option>
                  {contacts
                    .filter(c => !recipients.find(r => r.id === c.id))
                    .map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <Label htmlFor="bulkSubject">Subject</Label>
                <Input
                  id="bulkSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bulkMessage">Message</Label>
                <Textarea
                  id="bulkMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="mt-1 h-32"
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSendBulk}
                disabled={isLoading || recipients.length === 0 || !subject || !message}
                className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : `Send to ${recipients.length} Recipients`}
              </Button>
            </div>
          </Card>
        )}

        {/* Email History */}
        {showHistory && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Email History</h3>
            <div className="space-y-3">
              {emailHistory.length > 0 ? (
                emailHistory.slice(0, 10).map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(email.status)}
                        <span className="font-medium">{email.recipient}</span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-600 text-sm">{email.subject}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(email.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      email.status === 'SENT' ? 'bg-green-100 text-green-800' :
                      email.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                      email.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {email.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No email history found</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}