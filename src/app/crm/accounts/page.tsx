'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Users, TrendingUp, FileText, Receipt, Building2, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { MainLayout } from '@/components/layout/main-layout';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AddAccountModal } from '@/components/modals/add-account-modal';
import { EditAccountModal } from '@/components/modals/edit-account-modal';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { DataTable } from '@/components/ui/data-table';

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
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    contacts: number;
    opportunities: number;
    quotations: number;
    proformas: number;
  };
}

const typeColors = {
  INDIVIDUAL: 'bg-blue-100 text-blue-800',
  COMPANY: 'bg-green-100 text-green-800',
  PROJECT: 'bg-purple-100 text-purple-800',
};

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const { success, error } = useToast();
  const theme = getThemeClasses();

  // All state hooks must be called before any conditional returns
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [metrics, setMetrics] = useState({
    total: 0,
    companies: 0,
    individuals: 0,
    projects: 0,
  });
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Review high-value accounts',
      description: 'Focus on 3 accounts with the highest potential revenue this quarter.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Update account information',
      description: '5 accounts need contact information updates and recent activity logs.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Schedule follow-up calls',
      description: 'Plan follow-up calls with accounts that haven\'t been contacted in 30 days.',
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

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/accounts?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
        calculateMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (accountsData: Account[]) => {
    const companies = accountsData.filter(account => account.type === 'COMPANY').length;
    const individuals = accountsData.filter(account => account.type === 'INDIVIDUAL').length;
    const projects = accountsData.filter(account => account.type === 'PROJECT').length;
    
    setMetrics({
      total: accountsData.length,
      companies,
      individuals,
      projects,
    });
  };

  useEffect(() => {
    fetchAccounts();
  }, [searchTerm, typeFilter]);

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
  };

  const handleViewAccount = (account: Account) => {
    router.push(`/crm/accounts/${account.id}`);
  };

  const handleAddAccount = async (accountData: {
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
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchAccounts();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding account:', error);
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
    if (!selectedAccount) return;

    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchAccounts();
        setShowEditModal(false);
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchAccounts();
        setShowDeleteModal(false);
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const openEditModal = (account: Account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };


  const openDeleteModal = (account: Account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (selectedAccounts.length === 0) return;
    
    try {
      const response = await fetch('/api/accounts/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedAccounts }),
      });

      if (response.ok) {
        setAccounts(accounts.filter(a => !selectedAccounts.includes(a.id)));
        setSelectedAccounts([]);
        success(`Successfully deleted ${selectedAccounts.length} account(s)`);
        calculateMetrics(accounts.filter(a => !selectedAccounts.includes(a.id)));
      } else {
        error('Failed to delete accounts');
      }
    } catch (err) {
      console.error('Error deleting accounts:', err);
      error('Failed to delete accounts');
    }
  };

  const handleBulkExport = async () => {
    if (selectedAccounts.length === 0) return;
    
    try {
      const response = await fetch('/api/accounts/bulk-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedAccounts }),
      });

      if (response.ok) {
        const { data, filename } = await response.json();
        const { downloadCSV } = await import('@/lib/export-utils');
        downloadCSV(data, filename);
        success(`Successfully exported ${selectedAccounts.length} account(s)`);
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to export accounts');
      }
    } catch (err) {
      console.error('Error exporting accounts:', err);
      error('Failed to export accounts');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-gray-600">Manage your customer accounts and companies</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* AI Recommendation and Metrics Layout */}
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

        {/* Metrics Cards - Right Side */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
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
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-xl font-bold text-blue-600">{metrics.companies}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Individuals</p>
                <p className="text-xl font-bold text-green-600">{metrics.individuals}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects</p>
                <p className="text-xl font-bold text-purple-600">{metrics.projects}</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
            <option value="PROJECT">Project</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading accounts...</div>
        ) : (
          <DataTable
            data={accounts}
            enableSelection={true}
            selectedItems={selectedAccounts}
            onSelectionChange={setSelectedAccounts}
            onRowClick={handleViewAccount}
            bulkActions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={selectedAccounts.length === 0}
                >
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedAccounts.length === 0}
                >
                  Delete
                </Button>
              </div>
            }
            columns={[
              {
                key: 'account',
                label: 'Account',
                render: (account) => (
                  <div>
                    <div className="font-medium">{account.name}</div>
                    {account.website && (
                      <div className="text-sm text-gray-500">
                        <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {account.website}
                        </a>
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'type',
                label: 'Type',
                render: (account) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[account.type]}`}>
                    {account.type}
                  </span>
                )
              },
              {
                key: 'contact',
                label: 'Contact',
                render: (account) => (
                  <div className="text-sm">
                    {account.email && <div>{account.email}</div>}
                    {account.phone && <div className="text-gray-500">{account.phone}</div>}
                  </div>
                )
              },
              {
                key: 'location',
                label: 'Location',
                render: (account) => (
                  <div className="text-sm">
                    {account.city && <div>{account.city}</div>}
                    {account.country && <div className="text-gray-500">{account.country}</div>}
                  </div>
                )
              },
              {
                key: 'stats',
                label: 'Stats',
                render: (account) => (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {account._count.contacts}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {account._count.opportunities}
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {account._count.quotations}
                    </div>
                    <div className="flex items-center">
                      <Receipt className="w-3 h-3 mr-1" />
                      {account._count.proformas}
                    </div>
                  </div>
                )
              },
              {
                key: 'created',
                label: 'Created',
                render: (account) => (
                  <span className="text-sm text-gray-500">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (account) => (
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
                        onClick: () => router.push(`/crm/accounts/${account.id}`),
                      },
                      {
                        label: 'Edit',
                        icon: <Edit className="w-4 h-4" />,
                        onClick: () => openEditModal(account),
                      },
                      {
                        label: 'Delete',
                        icon: <Trash2 className="w-4 h-4" />,
                        onClick: () => openDeleteModal(account),
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

      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAccount}
        />
      )}

      {showEditModal && selectedAccount && (
        <EditAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccount(null);
          }}
          onSave={handleEditAccount}
        />
      )}


      {showDeleteModal && selectedAccount && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          title="Delete Account"
          message="Are you sure you want to delete this account?"
          itemName={selectedAccount.name}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedAccount(null);
          }}
          onConfirm={handleDeleteAccount}
        />
      )}
      </div>
    </MainLayout>
  );
}
