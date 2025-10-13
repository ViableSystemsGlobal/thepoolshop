'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Users, Building2, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { MainLayout } from '@/components/layout/main-layout';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { DataTable } from '@/components/ui/data-table';
import { AddContactModal } from '@/components/modals/add-contact-modal';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  createdAt: string;
  account: {
    id: string;
    name: string;
    type: 'INDIVIDUAL' | 'COMPANY' | 'PROJECT';
  };
}

const accountTypeColors = {
  INDIVIDUAL: 'bg-blue-100 text-blue-800',
  COMPANY: 'bg-green-100 text-green-800',
  PROJECT: 'bg-purple-100 text-purple-800',
};

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    withEmail: 0,
    withPhone: 0,
    byAccountType: {
      INDIVIDUAL: 0,
      COMPANY: 0,
      PROJECT: 0,
    },
  });

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Update contact information',
      description: '5 contacts have missing email addresses that need to be updated.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Follow up with key contacts',
      description: 'Schedule follow-up calls with 3 key contacts from high-value accounts.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Organize contact database',
      description: 'Review and clean up duplicate or outdated contact information.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/contacts?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
        calculateMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (contactsData: Contact[]) => {
    const withEmail = contactsData.filter(contact => contact.email).length;
    const withPhone = contactsData.filter(contact => contact.phone).length;
    
    const byAccountType = {
      INDIVIDUAL: contactsData.filter(contact => contact.account.type === 'INDIVIDUAL').length,
      COMPANY: contactsData.filter(contact => contact.account.type === 'COMPANY').length,
      PROJECT: contactsData.filter(contact => contact.account.type === 'PROJECT').length,
    };
    
    setMetrics({
      total: contactsData.length,
      withEmail,
      withPhone,
      byAccountType,
    });
  };

  useEffect(() => {
    if (session?.user) {
      fetchContacts();
    }
  }, [session, searchTerm]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success('Recommendation completed! Great job!');
  };

  const handleViewContact = (contact: Contact) => {
    router.push(`/crm/contacts/${contact.id}`);
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      const response = await fetch('/api/contacts/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedContacts }),
      });

      if (response.ok) {
        setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
        setSelectedContacts([]);
        success(`Successfully deleted ${selectedContacts.length} contact(s)`);
        calculateMetrics(contacts.filter(c => !selectedContacts.includes(c.id)));
      } else {
        error('Failed to delete contacts');
      }
    } catch (err) {
      console.error('Error deleting contacts:', err);
      error('Failed to delete contacts');
    }
  };

  const handleBulkExport = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      const response = await fetch('/api/contacts/bulk-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedContacts }),
      });

      if (response.ok) {
        const { data, filename } = await response.json();
        const { downloadCSV } = await import('@/lib/export-utils');
        downloadCSV(data, filename);
        success(`Successfully exported ${selectedContacts.length} contact(s)`);
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to export contacts');
      }
    } catch (err) {
      console.error('Error exporting contacts:', err);
      error('Failed to export contacts');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-gray-600">Manage your customer contacts and relationships</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Contact Management AI"
              subtitle="Your intelligent assistant for contact optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.total}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <Users className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Email</p>
                  <p className="text-xl font-bold text-blue-600">{metrics.withEmail}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Phone</p>
                  <p className="text-xl font-bold text-green-600">{metrics.withPhone}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-xl font-bold text-purple-600">{metrics.byAccountType.COMPANY}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Contacts Table */}
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading contacts...</div>
          ) : (
            <DataTable
              data={contacts}
              enableSelection={true}
              selectedItems={selectedContacts}
              onSelectionChange={setSelectedContacts}
              onRowClick={handleViewContact}
              bulkActions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                    disabled={selectedContacts.length === 0}
                  >
                    Export
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedContacts.length === 0}
                  >
                    Delete
                  </Button>
                </div>
              }
              columns={[
                {
                  key: 'contact',
                  label: 'Contact',
                  render: (contact) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.position && (
                          <div className="text-sm text-gray-500">{contact.position}</div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'account',
                  label: 'Account',
                  render: (contact) => (
                    <div>
                      <div className="font-medium">{contact.account.name}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${accountTypeColors[contact.account.type]}`}>
                        {contact.account.type}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'contactInfo',
                  label: 'Contact Info',
                  render: (contact) => (
                    <div className="text-sm">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'created',
                  label: 'Created',
                  render: (contact) => (
                    <span className="text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (contact) => (
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: 'View',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => router.push(`/crm/contacts/${contact.id}`),
                        },
                        {
                          label: 'Edit',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: () => router.push(`/crm/contacts/${contact.id}/edit`),
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => console.log('Delete contact'),
                          className: 'text-red-600',
                        },
                      ]}
                      align="right"
                    />
                  )
                }
              ]}
              itemsPerPage={10}
            />
          )}
        </Card>

        {/* Add Contact Modal */}
        {showAddModal && (
          <AddContactModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={fetchContacts}
          />
        )}
      </div>
    </MainLayout>
  );
}
