'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Users, TrendingUp, FileText, Receipt, Building2, Mail, Phone, MapPin, Globe, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { EditAccountModal } from '@/components/modals/edit-account-modal';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { AddAddressModal } from '@/components/modals/add-address-modal';

interface Account {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'PROJECT';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    position?: string;
  }>;
  opportunities: Array<{
    id: string;
    name: string;
    stage: string;
    value?: number;
    closeDate?: string;
  }>;
  quotations: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  proformas: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

const typeColors = {
  INDIVIDUAL: 'bg-blue-100 text-blue-800',
  COMPANY: 'bg-green-100 text-green-800',
  PROJECT: 'bg-purple-100 text-purple-800',
};

export default function AccountDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Follow up with key contacts',
      description: 'Schedule follow-up calls with 3 key contacts from this account.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Review pending quotations',
      description: 'Review and follow up on 2 pending quotations for this account.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Update account information',
      description: 'Verify and update contact information and business details.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  const accountId = params.id as string;

  useEffect(() => {
    if (session?.user && accountId) {
      fetchAccount();
    }
  }, [session, accountId]);

  useEffect(() => {
    if (account) {
      loadAddresses();
    }
  }, [account]);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accounts/${accountId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAccount(data);
      } else if (response.status === 404) {
        error('Account not found');
        router.push('/crm/accounts');
      } else {
        error('Failed to fetch account details');
      }
    } catch (err) {
      console.error('Error fetching account:', err);
      error('Failed to fetch account details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = async (accountData: {
    name: string;
    type: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    notes?: string;
  }) => {
    if (!account) return;

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchAccount();
        setShowEditModal(false);
        success('Account updated successfully!');
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to update account');
      }
    } catch (err) {
      console.error('Error updating account:', err);
      error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!account) return;

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        success('Account deleted successfully!');
        router.push('/crm/accounts');
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      error('Failed to delete account');
    }
  };

  const loadAddresses = async () => {
    if (!account) return;
    
    try {
      console.log('Loading addresses for account:', account.id);
      const response = await fetch(`/api/addresses?accountId=${account.id}`, {
        credentials: 'include'
      });
      console.log('Addresses response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Addresses data:', data);
        setAddresses(data.addresses || []);
      } else {
        console.error('Failed to load addresses:', response.status);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Address deleted successfully');
        loadAddresses();
      } else {
        error('Failed to delete address');
      }
    } catch (err) {
      error('Failed to delete address');
    }
  };

  const handleAddressSuccess = () => {
    loadAddresses();
    setEditingAddress(null);
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success('Recommendation completed! Great job!');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Don't show loading skeleton during navigation
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading account data...</div>
        </div>
      </>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  if (!account) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account not found</h2>
            <p className="text-gray-600 mb-4">The account you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push('/crm/accounts')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Accounts
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/crm/accounts')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Accounts
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[account.type]}`}>
                  {account.type}
                </span>
                <span className="text-sm text-gray-500">
                  Created {formatDate(account.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Account
            </Button>
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Account Management AI"
              subtitle="Your intelligent assistant for account optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contacts</p>
                  <p className="text-xl font-bold text-gray-900">{account.contacts?.length || 0}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <Users className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opportunities</p>
                  <p className="text-xl font-bold text-blue-600">{account.opportunities?.length || 0}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quotations</p>
                  <p className="text-xl font-bold text-green-600">{account.quotations?.length || 0}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Proformas</p>
                  <p className="text-xl font-bold text-purple-600">{account.proformas?.length || 0}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Receipt className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {account.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${account.email}`} className="text-blue-600 hover:underline">
                        {account.email}
                      </a>
                    </div>
                  </div>
                )}
                {account.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${account.phone}`} className="text-blue-600 hover:underline">
                        {account.phone}
                      </a>
                    </div>
                  </div>
                )}
                {account.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a 
                        href={account.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {account.website}
                      </a>
                    </div>
                  </div>
                )}
                {(account.address || account.city || account.state || account.country) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <div className="text-gray-900">
                        {account.address && <div>{account.address}</div>}
                        {(account.city || account.state || account.country) && (
                          <div>
                            {account.city && account.city}
                            {account.city && account.state && ', '}
                            {account.state && account.state}
                            {account.country && (account.city || account.state) && ', '}
                            {account.country && account.country}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Notes */}
            {account.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{account.notes}</p>
              </Card>
            )}

            {/* Addresses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Addresses</h3>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Address
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No addresses added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{addr.label}</h4>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                Default
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                              {addr.type.toLowerCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{addr.street}</div>
                            <div>
                              {addr.city}
                              {addr.city && addr.region && ', '}
                              {addr.region}
                              {addr.country && (addr.city || addr.region) && ', '}
                              {addr.country}
                              {addr.postalCode && ` ${addr.postalCode}`}
                            </div>
                            {addr.contactPerson && (
                              <div className="text-gray-500">
                                Contact: {addr.contactPerson}
                                {addr.phone && ` • ${addr.phone}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAddress(addr)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Quotations */}
            {account.quotations && account.quotations.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Quotations</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quotation
                  </Button>
                </div>
                <div className="space-y-3">
                  {account.quotations.slice(0, 5).map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{quotation.number}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(quotation.createdAt)} • {quotation.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(quotation.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Proformas */}
            {account.proformas && account.proformas.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Proformas</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Proforma
                  </Button>
                </div>
                <div className="space-y-3">
                  {account.proformas.slice(0, 5).map((proforma) => (
                    <div key={proforma.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{proforma.number}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(proforma.createdAt)} • {proforma.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(proforma.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contacts */}
            {account.contacts && account.contacts.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
                <div className="space-y-3">
                  {account.contacts.map((contact) => (
                    <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.position && (
                        <div className="text-sm text-gray-500">{contact.position}</div>
                      )}
                      {contact.email && (
                        <div className="text-sm text-blue-600">{contact.email}</div>
                      )}
                      {contact.phone && (
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Opportunities */}
            {account.opportunities && account.opportunities.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Opportunities</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Opportunity
                  </Button>
                </div>
                <div className="space-y-3">
                  {account.opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{opportunity.name}</div>
                      <div className="text-sm text-gray-500">
                        {opportunity.stage} • {opportunity.value ? formatCurrency(opportunity.value) : 'No value'}
                      </div>
                      {opportunity.closeDate && (
                        <div className="text-sm text-gray-500">
                          Close: {formatDate(opportunity.closeDate)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Account Owner */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">{account.owner.name}</div>
                  <div className="text-sm text-gray-500">{account.owner.email}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Account Modal */}
      {showEditModal && account && (
        <EditAccountModal
          account={account}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditAccount}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && account && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          title="Delete Account"
          message="Are you sure you want to delete this account? This action cannot be undone."
          itemName={account.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {/* Add/Edit Address Modal */}
      {showAddressModal && account && (
        <AddAddressModal
          isOpen={showAddressModal}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          accountId={account.id}
          address={editingAddress}
          onSuccess={handleAddressSuccess}
        />
      )}
    </>
  );
}
