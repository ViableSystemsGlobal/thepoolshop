'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, TrendingUp, FileBarChart, CheckCircle, XCircle, DollarSign, Calendar, CheckSquare, Square, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { EditOpportunityModal } from '@/components/modals/edit-opportunity-modal';
import { MiniLineChart } from '@/components/ui/mini-line-chart';
import { SkeletonTable, SkeletonMetricCard } from '@/components/ui/skeleton';

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  value?: number;
  probability?: number;
  closeDate?: string;
  wonDate?: string;
  lostReason?: string;
  accountId?: string;
  leadId?: string;
  ownerId: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  account?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  quotations: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Bulk actions state
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [currency, setCurrency] = useState('GHS');
  const [baseCurrency, setBaseCurrency] = useState('GHS');
  const [availableCurrencies, setAvailableCurrencies] = useState<any[]>([]);
  
  // Simple currency conversion rates (hardcoded for now)
  const exchangeRates: Record<string, Record<string, number>> = {
    'GHS': { 'USD': 0.08, 'EUR': 0.07, 'GBP': 0.06 },
    'USD': { 'GHS': 12.5, 'EUR': 0.85, 'GBP': 0.75 },
    'EUR': { 'GHS': 14.7, 'USD': 1.18, 'GBP': 0.88 },
    'GBP': { 'GHS': 16.7, 'USD': 1.33, 'EUR': 1.14 }
  };
  
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
      fetchCurrencySettings();
    }
  }, [session]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOpportunities(new Set());
    setIsAllSelected(false);
  }, [searchTerm, statusFilter]);

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

  const getStageInfo = (stage: string) => {
    return stages.find(s => s.key === stage) || { key: stage, label: stage, color: 'bg-gray-100 text-gray-800' };
  };

  const formatCurrencyAmount = (amount?: number) => {
    if (!amount) return `GH₵ 0.00`;
    
    // Convert from base currency to selected currency
    let convertedAmount = amount;
    if (baseCurrency !== currency) {
      const rate = exchangeRates[baseCurrency]?.[currency];
      if (rate) {
        convertedAmount = amount * rate;
      }
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
    
    return `GH₵ ${formatted}`;
  };

  const calculatePipelineValue = () => {
    return opportunities.reduce((total, opp) => {
      // Only include active opportunities in pipeline (exclude WON and LOST)
      if (opp.value && opp.stage !== 'LOST' && opp.stage !== 'WON') {
        return total + (opp.value * (opp.probability || 0) / 100);
      }
      return total;
    }, 0);
  };

  const calculateProjectedClose = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return opportunities.filter(opp => {
      if (!opp.closeDate || opp.stage === 'LOST') return false;
      const closeDate = new Date(opp.closeDate);
      return closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear;
    }).length;
  };

  const calculateClosedRevenue = () => {
    return opportunities.reduce((total, opp) => {
      if (opp.value && opp.stage === 'WON') {
        return total + opp.value;
      }
      return total;
    }, 0);
  };

  // Generate trend data for metrics
  const generateTrendData = () => {
    // Generate 7 data points for the last 7 days
    const totalTrend = Array.from({ length: 7 }, (_, i) => {
      const baseValue = Math.max(0, opportunities.length - 3 + i);
      return baseValue + Math.random() * 2;
    });

    const pipelineTrend = Array.from({ length: 7 }, (_, i) => {
      const baseValue = calculatePipelineValue() * (0.7 + i * 0.05);
      return baseValue + Math.random() * 1000;
    });

    const revenueTrend = Array.from({ length: 7 }, (_, i) => {
      const baseValue = calculateClosedRevenue() * (0.6 + i * 0.06);
      return baseValue + Math.random() * 500;
    });

    return { totalTrend, pipelineTrend, revenueTrend };
  };

  const trends = generateTrendData();

  // Filter and pagination helper functions
  const getFilteredOpportunities = () => {
    return opportunities.filter(opp => {
      const contactName = opp.lead ? `${opp.lead.firstName} ${opp.lead.lastName}` : opp.account?.name || '';
      const email = opp.lead?.email || opp.account?.email || '';
      const company = opp.lead?.company || opp.account?.name || '';
      
      const matchesSearch = !searchTerm || 
        contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || opp.stage === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getPaginatedOpportunities = () => {
    const filtered = getFilteredOpportunities();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredOpportunities();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Bulk action helper functions
  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
    });
  };

  const handleSelectAll = () => {
    const paginatedOpps = getPaginatedOpportunities();
    if (isAllSelected) {
      setSelectedOpportunities(new Set());
      setIsAllSelected(false);
    } else {
      const newSelected = new Set(selectedOpportunities);
      paginatedOpps.forEach(opp => newSelected.add(opp.id));
      setSelectedOpportunities(newSelected);
      setIsAllSelected(true);
    }
  };

  const handleSelectOpportunity = (opportunityId: string) => {
    const newSelected = new Set(selectedOpportunities);
    if (newSelected.has(opportunityId)) {
      newSelected.delete(opportunityId);
    } else {
      newSelected.add(opportunityId);
    }
    setSelectedOpportunities(newSelected);
    
    // Update isAllSelected based on current page
    const paginatedOpps = getPaginatedOpportunities();
    const allPaginatedSelected = paginatedOpps.every(opp => newSelected.has(opp.id));
    setIsAllSelected(allPaginatedSelected);
  };

  const handleBulkDelete = () => {
    if (selectedOpportunities.size === 0) return;
    
    showConfirmation(
      'Delete Opportunities',
      `Are you sure you want to delete ${selectedOpportunities.size} opportunity(ies)? This will also delete all associated tasks, comments, files, emails, SMS, and meetings. Quotations and invoices will be unlinked.`,
      async () => {
        try {
          const deletePromises = Array.from(selectedOpportunities).map(id =>
            fetch(`/api/opportunities/${id}`, { 
              method: 'DELETE',
              credentials: 'include'
            })
          );
          
          const results = await Promise.all(deletePromises);
          const successCount = results.filter(r => r.ok).length;
          const failCount = results.length - successCount;
          
          // Refresh opportunities
          await fetchOpportunities();
          
          // Clear selection
          setSelectedOpportunities(new Set());
          setIsAllSelected(false);
          
          if (successCount > 0) {
            success(`Successfully deleted ${successCount} opportunity(ies)`);
          }
          if (failCount > 0) {
            error(`Failed to delete ${failCount} opportunity(ies)`);
          }
        } catch (err) {
          console.error('Error deleting opportunities:', err);
          error('Failed to delete opportunities');
        } finally {
          closeConfirmation();
        }
      }
    );
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    if (selectedOpportunities.size === 0) return;
    
    showConfirmation(
      'Update Opportunity Status',
      `Are you sure you want to update ${selectedOpportunities.size} opportunity(ies) to ${newStatus}?`,
      async () => {
        try {
          const updatePromises = Array.from(selectedOpportunities).map(id =>
            fetch(`/api/opportunities/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            })
          );
          
          await Promise.all(updatePromises);
          
          // Refresh opportunities
          await fetchOpportunities();
          
          // Clear selection
          setSelectedOpportunities(new Set());
          setIsAllSelected(false);
          
          success(`Successfully updated ${selectedOpportunities.size} opportunity(ies) to ${newStatus}`);
        } catch (err) {
          console.error('Error updating opportunities:', err);
          error('Failed to update opportunities');
        } finally {
          closeConfirmation();
        }
      }
    );
  };

  const fetchCurrencySettings = async () => {
    try {
      const response = await fetch('/api/settings/currency');
      if (response.ok) {
        const data = await response.json();
        setBaseCurrency(data.baseCurrency || 'GHS');
        setAvailableCurrencies(data.currencies || []);
        
        // Set initial currency to base currency
        if (!currency || currency === 'GHS') {
          setCurrency(data.baseCurrency || 'GHS');
        }
      }
    } catch (err) {
      console.error('Error fetching currency settings:', err);
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

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedOpportunity(null);
  };

  const handleDeleteOpportunity = async (opportunity: Opportunity) => {
    const contactName = opportunity.lead ? `${opportunity.lead.firstName} ${opportunity.lead.lastName}` : opportunity.account?.name || opportunity.name;
    showConfirmation(
      'Delete Opportunity',
      `Are you sure you want to delete the opportunity "${contactName}"? This will also delete all associated tasks, comments, files, emails, SMS, and meetings. Quotations and invoices will be unlinked.`,
      async () => {
        try {
          const response = await fetch(`/api/opportunities/${opportunity.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            success('Opportunity deleted successfully');
            fetchOpportunities(); // Refresh the list
          } else {
            const data = await response.json();
            error(data.error || 'Failed to delete opportunity');
          }
        } catch (err) {
          console.error('Error deleting opportunity:', err);
          error('Failed to delete opportunity');
        } finally {
          closeConfirmation();
        }
      }
    );
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Don't show loading skeleton during navigation

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
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
                {availableCurrencies.length > 0 ? (
                  availableCurrencies.map((curr) => (
                    <option key={curr.id} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="GHS">GHS - Ghana Cedi</option>
                    <option value="USD">USD - US Dollar</option>
                  </>
                )}
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
          <div className="space-y-4">
            {/* Main Metrics Row - 3 cards equal width */}
            <div className="grid grid-cols-3 gap-4">
              {/* Total Opportunities */}
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-600">Total Opportunities</p>
                  <div className={`p-1.5 rounded-full bg-${theme.primaryBg}`}>
                    <FileBarChart className={`w-3.5 h-3.5 text-${theme.primary}`} />
                </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-lg font-bold text-gray-900">{opportunities.length}</p>
                  <MiniLineChart 
                    data={trends.totalTrend} 
                    color={getThemeColor()} 
                    width={50} 
                    height={18} 
                  />
              </div>
            </Card>
            
              {/* Pipeline Value */}
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-600">Pipeline Value</p>
                  <div className="p-1.5 rounded-full bg-blue-100">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-lg font-bold text-blue-600">{formatCurrencyAmount(calculatePipelineValue())}</p>
                  <MiniLineChart 
                    data={trends.pipelineTrend} 
                    color="#2563eb" 
                    width={50} 
                    height={18} 
                  />
              </div>
            </Card>
            
              {/* Closed Revenue */}
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-600">Closed Revenue</p>
                  <div className="p-1.5 rounded-full bg-green-100">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-lg font-bold text-green-600">{formatCurrencyAmount(calculateClosedRevenue())}</p>
                  <MiniLineChart 
                    data={trends.revenueTrend} 
                    color="#16a34a" 
                    width={50} 
                    height={18} 
                  />
                </div>
              </Card>
              </div>
            
            {/* Additional Metrics Row - 4 cards */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-600">Projected Close</p>
                    <p className="text-lg font-bold text-purple-600">{calculateProjectedClose()}</p>
                  </div>
                  <div className="p-1.5 rounded-full bg-purple-100">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Quote Sent</p>
                    <p className="text-lg font-bold text-yellow-600">{opportunities.filter(o => o.stage === 'QUOTE_SENT').length}</p>
                  </div>
                  <div className="p-1.5 rounded-full bg-yellow-100">
                    <FileBarChart className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </Card>
            
              <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-600">Won Deals</p>
                    <p className="text-lg font-bold text-emerald-600">{opportunities.filter(o => o.stage === 'WON').length}</p>
                </div>
                  <div className="p-1.5 rounded-full bg-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </Card>
            
              <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-600">Lost Deals</p>
                    <p className="text-lg font-bold text-red-600">{opportunities.filter(o => o.stage === 'LOST').length}</p>
                  </div>
                  <div className="p-1.5 rounded-full bg-red-100">
                    <XCircle className="w-4 h-4 text-red-600" />
                </div>
                </div>
              </Card>
              </div>
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

          {/* Bulk Actions Bar */}
          {selectedOpportunities.size > 0 && (
            <Card>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedOpportunities.size} opportunity(ies) selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu
                      trigger={
                        <Button variant="outline" size="sm">
                          Update Status
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      }
                      items={[
                        {
                          label: 'New Opportunity',
                          onClick: () => handleBulkStatusUpdate('NEW_OPPORTUNITY')
                        },
                        {
                          label: 'Quote Sent',
                          onClick: () => handleBulkStatusUpdate('QUOTE_SENT')
                        },
                        {
                          label: 'Negotiation',
                          onClick: () => handleBulkStatusUpdate('NEGOTIATION')
                        },
                        {
                          label: 'Contract Signed',
                          onClick: () => handleBulkStatusUpdate('CONTRACT_SIGNED')
                        },
                        {
                          label: 'Won',
                          onClick: () => handleBulkStatusUpdate('WON')
                        },
                        {
                          label: 'Lost',
                          onClick: () => handleBulkStatusUpdate('LOST')
                        }
                      ]}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedOpportunities(new Set());
                        setIsAllSelected(false);
                      }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center justify-center w-4 h-4"
                        >
                          {isAllSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPaginatedOpportunities().map((opportunity) => {
                      const stageInfo = getStageInfo(opportunity.stage);
                      const contactName = opportunity.lead ? `${opportunity.lead.firstName} ${opportunity.lead.lastName}` : opportunity.account?.name || '-';
                      const contactEmail = opportunity.lead?.email || opportunity.account?.email || '';
                      const companyName = opportunity.lead?.company || opportunity.account?.name || '-';
                      
                      return (
                        <tr 
                          key={opportunity.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewOpportunity(opportunity)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectOpportunity(opportunity.id)}
                              className="flex items-center justify-center w-4 h-4"
                            >
                              {selectedOpportunities.has(opportunity.id) ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contactName}
                              </div>
                              <div className="text-sm text-gray-500">{contactEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stageInfo.color}`}>
                              {stageInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrencyAmount(opportunity.value)}
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
                                  onClick: () => handleEditOpportunity(opportunity),
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
                                  onClick: () => handleDeleteOpportunity(opportunity),
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
              
              {/* Pagination Controls */}
              {getTotalPages() > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredOpportunities().length)} of {getFilteredOpportunities().length} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <Button
                            key={pageNum}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={isActive ? `bg-${theme.primary} text-white` : ''}
                            style={isActive ? {
                              backgroundColor: theme.primary,
                              color: 'white'
                            } : {}}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                      disabled={currentPage === getTotalPages()}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <SkeletonTable rows={8} columns={6} />
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={closeConfirmation}
      />

      {/* Edit Opportunity Modal */}
      <EditOpportunityModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        opportunity={selectedOpportunity}
        onSave={fetchOpportunities}
      />
    </>
  );
}
