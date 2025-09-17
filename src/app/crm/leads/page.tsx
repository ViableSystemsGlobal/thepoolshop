'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Users, TrendingUp, Clock, CheckCircle, Grid, List, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { MainLayout } from '@/components/layout/main-layout';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AddLeadModal } from '@/components/modals/add-lead-modal';
import { EditLeadModal } from '@/components/modals/edit-lead-modal';
import { ViewLeadModal } from '@/components/modals/view-lead-modal';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  score: number;
  notes?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  CONVERTED: 'bg-purple-100 text-purple-800',
  LOST: 'bg-red-100 text-red-800',
};

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  // All state hooks must be called before any conditional returns
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [metrics, setMetrics] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0,
  });

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Follow up with new leads',
      description: 'You have 3 new leads from today that need immediate follow-up within 24 hours.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Qualify recent prospects',
      description: 'Review and qualify 5 leads that have been in "New" status for over 3 days.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Update lead scores',
      description: 'Update lead scores based on recent interactions and engagement levels.',
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

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/leads?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
        calculateMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (leadsData: Lead[]) => {
    const newLeads = leadsData.filter(lead => lead.status === 'NEW').length;
    const qualifiedLeads = leadsData.filter(lead => lead.status === 'QUALIFIED').length;
    const convertedLeads = leadsData.filter(lead => lead.status === 'CONVERTED').length;
    
    setMetrics({
      total: leadsData.length,
      new: newLeads,
      qualified: qualifiedLeads,
      converted: convertedLeads,
    });
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

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

  const handleAddLead = async (leadData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    status: string;
    score: number;
    notes?: string;
  }) => {
    if (status !== 'authenticated') {
      alert('Please sign in to create leads');
      return;
    }
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchLeads();
        setShowAddModal(false);
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Error adding lead:', errorData);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to create lead: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert(`Failed to create lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditLead = async (leadData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    status: string;
    score: number;
    notes?: string;
  }) => {
    if (!selectedLead) return;

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchLeads();
        setShowEditModal(false);
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchLeads();
        setShowDeleteModal(false);
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const openViewModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  const openDeleteModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success('Recommendation completed! Great job!');
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('application/json', JSON.stringify(lead));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadData = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (leadData.status === newStatus) {
      return; // No change needed
    }

    try {
      const response = await fetch(`/api/leads/${leadData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, status: newStatus }),
        credentials: 'include',
      });

      if (response.ok) {
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadData.id ? { ...lead, status: newStatus } : lead
          )
        );
        
        // Recalculate metrics
        const updatedLeads = leads.map(lead => 
          lead.id === leadData.id ? { ...lead, status: newStatus } : lead
        );
        calculateMetrics(updatedLeads);
        
        // Show success toast
        success(`Lead moved to ${newStatus.toLowerCase()} successfully!`);
      } else {
        error('Failed to update lead status');
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      error('Failed to update lead status');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-600">Manage your sales leads and prospects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? `bg-${theme.primary} text-white` : ''}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? `bg-${theme.primary} text-white` : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            variant="outline"
            onClick={() => {/* TODO: Implement import functionality */}}
            className="mr-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* AI Recommendation and Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendation Card - Left Side */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="Lead Management AI"
            subtitle="Your intelligent assistant for lead optimization"
            recommendations={aiRecommendations}
            onRecommendationComplete={handleRecommendationComplete}
            icon={<Users className="w-6 h-6 text-white" />}
          />
        </div>

        {/* Metrics Cards - Right Side */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
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
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-xl font-bold text-blue-600">{metrics.new}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-xl font-bold text-green-600">{metrics.qualified}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-xl font-bold text-purple-600">{metrics.converted}</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

        {loading ? (
          <div className="text-center py-8">Loading leads...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Source</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </div>
                    </td>
                    <td className="py-3 px-4">{lead.company || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {lead.email && <div>{lead.email}</div>}
                        {lead.phone && <div className="text-gray-500">{lead.phone}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4">{lead.source || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${lead.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{lead.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
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
                            onClick: () => openViewModal(lead),
                          },
                          {
                            label: 'Edit',
                            icon: <Edit className="w-4 h-4" />,
                            onClick: () => openEditModal(lead),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => openDeleteModal(lead),
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
            {leads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No leads found. Create your first lead to get started.
              </div>
            )}
          </div>
        )}
      </Card>
      ) : (
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* New Leads Column */}
          <div 
            className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'NEW')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">New Leads</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {leads.filter(lead => lead.status === 'NEW').length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(lead => lead.status === 'NEW').map((lead) => (
                <Card 
                  key={lead.id} 
                  className="p-4 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </h4>
                    <DropdownMenu
                      trigger={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
                      items={[
                        {
                          label: 'View',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => openViewModal(lead),
                        },
                        {
                          label: 'Edit',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: () => openEditModal(lead),
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => openDeleteModal(lead),
                          className: 'text-red-600',
                        },
                      ]}
                      align="right"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{lead.company || 'No company'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{lead.email}</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Qualified Leads Column */}
          <div 
            className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'QUALIFIED')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Qualified</h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {leads.filter(lead => lead.status === 'QUALIFIED').length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(lead => lead.status === 'QUALIFIED').map((lead) => (
                <Card 
                  key={lead.id} 
                  className="p-4 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </h4>
                    <DropdownMenu
                      trigger={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
                      items={[
                        {
                          label: 'View',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => openViewModal(lead),
                        },
                        {
                          label: 'Edit',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: () => openEditModal(lead),
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => openDeleteModal(lead),
                          className: 'text-red-600',
                        },
                      ]}
                      align="right"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{lead.company || 'No company'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{lead.email}</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-green-600 h-1 rounded-full"
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Converted Leads Column */}
          <div 
            className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'CONVERTED')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Converted</h3>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {leads.filter(lead => lead.status === 'CONVERTED').length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(lead => lead.status === 'CONVERTED').map((lead) => (
                <Card 
                  key={lead.id} 
                  className="p-4 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </h4>
                    <DropdownMenu
                      trigger={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
                      items={[
                        {
                          label: 'View',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => openViewModal(lead),
                        },
                        {
                          label: 'Edit',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: () => openEditModal(lead),
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => openDeleteModal(lead),
                          className: 'text-red-600',
                        },
                      ]}
                      align="right"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{lead.company || 'No company'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{lead.email}</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Lost Leads Column */}
          <div 
            className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'LOST')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Lost</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {leads.filter(lead => lead.status === 'LOST').length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(lead => lead.status === 'LOST').map((lead) => (
                <Card 
                  key={lead.id} 
                  className="p-4 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </h4>
                    <DropdownMenu
                      trigger={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
                      items={[
                        {
                          label: 'View',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => openViewModal(lead),
                        },
                        {
                          label: 'Edit',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: () => openEditModal(lead),
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => openDeleteModal(lead),
                          className: 'text-red-600',
                        },
                      ]}
                      align="right"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{lead.company || 'No company'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{lead.email}</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-red-600 h-1 rounded-full"
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          </div>
        </Card>
      )}

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
        />
      )}

      {showEditModal && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLead(null);
          }}
          onSave={handleEditLead}
        />
      )}

      {showViewModal && selectedLead && (
        <ViewLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowViewModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {showDeleteModal && selectedLead && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          title="Delete Lead"
          message="Are you sure you want to delete this lead?"
          itemName={`${selectedLead.firstName} ${selectedLead.lastName}`}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedLead(null);
          }}
          onConfirm={handleDeleteLead}
        />
      )}
      </div>
    </MainLayout>
  );
}
