'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, TrendingUp, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { MainLayout } from '@/components/layout/main-layout';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';

interface Opportunity {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  source?: string;
  status: string;
  dealValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  notes?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Simplified stages
  const stages = [
    { key: 'QUOTE_SENT', label: 'Quote Sent', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
    { key: 'CONTRACT_SIGNED', label: 'Contract Signed', color: 'bg-emerald-100 text-emerald-800' },
    { key: 'WON', label: 'Won', color: 'bg-green-100 text-green-800' },
    { key: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    if (session?.user) {
      fetchOpportunities();
    }
  }, [session, searchTerm, statusFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/opportunities?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
      } else {
        console.error('Failed to fetch opportunities');
        setOpportunities([]);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (status: string) => {
    return stages.find(stage => stage.key === status) || { key: status, label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - AI Card */}
        <div className="lg:col-span-1">
          <AIRecommendationCard />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
              <p className="text-gray-600 mt-1">Track your sales opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/crm/leads')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                View Leads
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-2 bg-${theme.primary} hover:bg-${theme.primaryDark} text-white border-0 font-medium`}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4" />
                Create Opportunity
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage.key} value={stage.key}>{stage.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opportunities List */}
          {opportunities.length === 0 && !loading && (
            <Card className="p-12 text-center">
              <FileBarChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-6">Get started by converting leads to opportunities.</p>
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={() => router.push('/crm/leads')} 
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  View Leads
                </Button>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white border-0 font-medium`}
                  style={{
                    backgroundColor: theme.primary,
                    color: 'white'
                  }}
                >
                  Create Opportunity
                </Button>
              </div>
            </Card>
          )}

          {/* Opportunities Table */}
          {opportunities.length > 0 && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {opportunities.map((opportunity) => {
                      const stageInfo = getStageInfo(opportunity.status);
                      return (
                        <tr key={opportunity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {opportunity.firstName} {opportunity.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{opportunity.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {opportunity.company || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stageInfo.color}`}>
                              {stageInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(opportunity.dealValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {opportunity.probability ? `${opportunity.probability}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <DropdownMenu
                              items={[
                                {
                                  label: 'View',
                                  icon: <Eye className="w-4 h-4" />,
                                  onClick: () => router.push(`/crm/opportunities/${opportunity.id}`),
                                },
                                {
                                  label: 'Edit',
                                  icon: <Edit className="w-4 h-4" />,
                                  onClick: () => console.log('Edit opportunity'),
                                },
                                {
                                  label: 'Create Quote',
                                  icon: <FileBarChart className="w-4 h-4" />,
                                  onClick: () => router.push(`/quotations?opportunityId=${opportunity.id}`),
                                  className: 'text-green-600',
                                },
                                {
                                  label: 'Delete',
                                  icon: <Trash2 className="w-4 h-4" />,
                                  onClick: () => console.log('Delete opportunity'),
                                  className: 'text-red-600',
                                },
                              ]}
                            >
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading opportunities...</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Opportunity</h3>
            <p className="text-gray-600 mb-6">
              To create a new opportunity, please go to the Leads page and use the "Create Quote" button to convert a lead into an opportunity.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowAddModal(false);
                  router.push('/crm/leads');
                }}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                Go to Leads
              </Button>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
