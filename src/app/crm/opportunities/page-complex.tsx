'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Users, TrendingUp, Clock, CheckCircle, Grid, List, Upload, FileBarChart, DollarSign, Target, Calendar, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
}

interface Opportunity {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  leadType: 'INDIVIDUAL' | 'COMPANY';
  company?: string;
  subject?: string;
  source?: string;
  status: 'NEW_OPPORTUNITY' | 'QUOTE_SENT' | 'QUOTE_REVIEWED' | 'NEGOTIATION' | 'APPROVED' | 'CONTRACT_SENT' | 'CONTRACT_SIGNED' | 'WON' | 'LOST';
  assignedTo?: User[];
  interestedProducts?: Product[];
  followUpDate?: string;
  notes?: string;
  dealValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'pipeline'>('pipeline');
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pipeline stages configuration
  const pipelineStages = [
    { key: 'QUOTE_SENT', label: 'Quote Sent', color: 'bg-yellow-100 text-yellow-800', icon: FileBarChart },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-100 text-purple-800', icon: Users },
    { key: 'CONTRACT_SIGNED', label: 'Contract Signed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    { key: 'WON', label: 'Won', color: 'bg-green-100 text-green-800', icon: Target },
    { key: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800', icon: XCircle },
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
        const errorText = await response.text();
        console.error('Failed to fetch opportunities:', response.status, errorText);
        setOpportunities([]);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (status: string) => {
    const stage = pipelineStages.find(s => s.key === status);
    return stage ? <stage.icon className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
  };

  const getStageColor = (status: string) => {
    const stage = pipelineStages.find(s => s.key === status);
    return stage ? stage.color : 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculatePipelineValue = () => {
    return opportunities.reduce((total, opp) => {
      const value = opp.dealValue || 0;
      const probability = opp.probability || 0;
      return total + (value * probability / 100);
    }, 0);
  };

  const calculateWonValue = () => {
    return opportunities
      .filter(opp => opp.status === 'WON')
      .reduce((total, opp) => total + (opp.dealValue || 0), 0);
  };

  if (!session?.user) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please sign in to view opportunities.</p>
        </div>
      </>
    );
  }

  return (
    <>
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

        {/* Pipeline Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculatePipelineValue())}</p>
              </div>
              <div className={`p-3 rounded-full bg-${theme.primaryBg}`}>
                <TrendingUp className={`w-6 h-6 text-${theme.primary}`} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Won Deals</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateWonValue())}</p>
              </div>
              <div className={`p-3 rounded-full bg-${theme.primaryBg}`}>
                <Target className={`w-6 h-6 text-${theme.primary}`} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => !['WON', 'LOST'].includes(opp.status)).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.length > 0 
                    ? Math.round((opportunities.filter(opp => opp.status === 'WON').length / opportunities.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {pipelineStages.map(stage => (
                <option key={stage.key} value={stage.key}>{stage.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setViewMode('pipeline')}
              className={viewMode === 'pipeline' ? `bg-${theme.primary} text-white hover:bg-${theme.primary} hover:text-white` : `hover:bg-gray-200`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? `bg-${theme.primary} text-white hover:bg-${theme.primary} hover:text-white` : `hover:bg-gray-200`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? `bg-${theme.primary} text-white hover:bg-${theme.primary} hover:text-white` : `hover:bg-gray-200`}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Sales Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
              {pipelineStages.map(stage => {
                const stageOpportunities = opportunities.filter(opp => opp.status === stage.key);
                const stageValue = stageOpportunities.reduce((total, opp) => total + (opp.dealValue || 0), 0);
                
                return (
                  <Card key={stage.key} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 text-sm">{stage.label}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${stage.color}`}>
                        {stageOpportunities.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{formatCurrency(stageValue)}</p>
                    
                    <div className="space-y-2">
                      {stageOpportunities.slice(0, 3).map(opportunity => (
                        <div
                          key={opportunity.id}
                          className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => router.push(`/crm/opportunities/${opportunity.id}`)}
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {opportunity.firstName} {opportunity.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(opportunity.dealValue || 0)}
                          </p>
                        </div>
                      ))}
                      {stageOpportunities.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{stageOpportunities.length - 3} more
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deal Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Close
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.status)}`}>
                          {getStageIcon(opportunity.status)}
                          <span className="ml-1">{pipelineStages.find(s => s.key === opportunity.status)?.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(opportunity.dealValue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.probability || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.owner.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                          align="right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/crm/opportunities/${opportunity.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {opportunity.firstName} {opportunity.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{opportunity.company}</p>
                  </div>
                  <DropdownMenu
                    trigger={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
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
                    align="right"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stage</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.status)}`}>
                      {getStageIcon(opportunity.status)}
                      <span className="ml-1">{pipelineStages.find(s => s.key === opportunity.status)?.label}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Deal Value</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(opportunity.dealValue || 0)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Probability</span>
                    <span className="text-sm font-medium text-gray-900">{opportunity.probability || 0}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expected Close</span>
                    <span className="text-sm font-medium text-gray-900">
                      {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : '-'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Owner</span>
                    <span className="text-sm font-medium text-gray-900">{opportunity.owner.name}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {opportunities.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-6">Get started by converting leads to opportunities or creating new quotes.</p>
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

        {/* Loading State */}
        {loading && (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading opportunities...</p>
          </Card>
        )}
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
      </div>
    </>
  );
}
