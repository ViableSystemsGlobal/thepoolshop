'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, TrendingUp, FileBarChart, CheckCircle, XCircle, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
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
  const [currency, setCurrency] = useState('GHS');
  const [exchangeRate, setExchangeRate] = useState(1);
  const handleViewOpportunity = (opportunity: Opportunity) => {
    router.push(`/crm/opportunities/${opportunity.id}`);
  };

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Follow up on quote sent',
      description: 'You have 2 opportunities with quotes sent that need follow-up within 48 hours.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Move negotiations forward',
      description: 'Review 3 opportunities in negotiation stage and schedule next steps.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Close pending deals',
      description: 'Focus on opportunities with high probability of closing this month.',
      priority: 'high' as const,
      completed: false,
    },
  ]);

  // Opportunity stages
  const stages = [
    { key: 'NEW_OPPORTUNITY', label: 'New Opportunity', color: 'bg-blue-100 text-blue-800' },
    { key: 'QUOTE_SENT', label: 'Quote Sent', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
    { key: 'CONTRACT_SIGNED', label: 'Contract Signed', color: 'bg-emerald-100 text-emerald-800' },
    { key: 'WON', label: 'Won', color: 'bg-green-100 text-green-800' },
    { key: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    if (session?.user) {
      fetchOpportunities();
      fetchExchangeRate();
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
    if (!amount) return `${currency} 0`;
    const convertedAmount = currency === 'USD' ? amount * exchangeRate : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(convertedAmount);
  };

  const calculatePipelineValue = () => {
    return opportunities.reduce((total, opp) => {
      if (opp.dealValue && opp.status !== 'LOST') {
        return total + (opp.dealValue * (opp.probability || 0) / 100);
      }
      return total;
    }, 0);
  };

  const calculateProjectedClose = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return opportunities.filter(opp => {
      if (!opp.expectedCloseDate || opp.status === 'LOST') return false;
      const closeDate = new Date(opp.expectedCloseDate);
      return closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear;
    }).length;
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/currency/convert?from=GHS&to=USD&amount=1');
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rate || 1);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
    }
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success('Recommendation completed! Great job!');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <p className="text-gray-600">Manage your sales opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
              </select>
            </div>
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
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Opportunity
            </Button>
          </div>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div>
            <AIRecommendationCard 
              title="Opportunity Management AI"
              subtitle="Your intelligent assistant for opportunity optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                  <p className="text-xl font-bold text-gray-900">{opportunities.length}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <FileBarChart className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(calculatePipelineValue())}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projected Close</p>
                  <p className="text-xl font-bold text-green-600">{calculateProjectedClose()}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quote Sent</p>
                  <p className="text-xl font-bold text-yellow-600">{opportunities.filter(o => o.status === 'QUOTE_SENT').length}</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-100">
                  <FileBarChart className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Won Deals</p>
                  <p className="text-xl font-bold text-emerald-600">{opportunities.filter(o => o.status === 'WON').length}</p>
                </div>
                <div className="p-2 rounded-full bg-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lost Deals</p>
                  <p className="text-xl font-bold text-red-600">{opportunities.filter(o => o.status === 'LOST').length}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">

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
                        <tr 
                          key={opportunity.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewOpportunity(opportunity)}
                        >
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
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
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              }
                            />
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
