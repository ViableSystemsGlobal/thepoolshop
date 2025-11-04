'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { useAbilities } from '@/hooks/use-abilities';
import { useToast } from '@/contexts/toast-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { AddDistributorLeadModal } from '@/components/modals/add-distributor-lead-modal';
import { EditDistributorLeadModal } from '@/components/modals/edit-distributor-lead-modal';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { formatCurrency } from '@/lib/utils';

interface DistributorLead {
  id: string;
  // API fields
  firstName?: string;
  lastName?: string;
  businessName?: string;
  city?: string;
  region?: string;
  createdAt?: string;
  // Frontend fields (for mock data)
  companyName?: string;
  contactPerson?: string;
  location?: string;
  applicationDate?: string;
  // Common fields
  email: string;
  phone: string;
  businessType: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  notes?: string;
  territory?: string;
  expectedVolume?: number;
  experience?: string;
  profileImage?: string;
  images?: Array<{
    id: string;
    imageType: string;
    filePath: string;
  }>;
}

export default function DistributorLeadsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const { success, error } = useToast();

  const [leads, setLeads] = useState<DistributorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [currency, setCurrency] = useState('GHS');

  // AI Recommendations for Distributor Leads
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Review Pending Applications',
      description: '3 applications have been pending for over 5 days',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Follow up on Under Review',
      description: 'Contact 2 distributors for additional documentation',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Schedule Approval Meetings',
      description: 'Set up meetings for 4 approved applications',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  const handleRecommendationComplete = (recommendationId: string) => {
    // Handle recommendation completion
    console.log('Recommendation completed:', recommendationId);
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drm/distributor-leads', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeads(data.data || []);
      } else {
        console.error('Failed to load distributor leads. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // For now, just show empty state instead of mock data
        setLeads([]);
      }
    } catch (error) {
      console.error('Error loading distributor leads:', error);
      // For now, just show empty state instead of mock data
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockLeads: DistributorLead[] = [
      {
        id: '1',
        companyName: 'Ghana Distribution Ltd',
        contactPerson: 'Kwame Asante',
        email: 'kwame@ghanadist.com',
        phone: '+233 24 123 4567',
        location: 'Accra, Ghana',
        businessType: 'Wholesale Distribution',
        applicationDate: '2024-01-15',
        status: 'PENDING',
        territory: 'Greater Accra',
        expectedVolume: 50000,
        experience: '5 years in FMCG distribution'
      },
      {
        id: '2',
        companyName: 'West Africa Logistics',
        contactPerson: 'Ama Serwaa',
        email: 'ama@walogistics.com',
        phone: '+233 20 987 6543',
        location: 'Kumasi, Ghana',
        businessType: 'Logistics & Distribution',
        applicationDate: '2024-01-10',
        status: 'UNDER_REVIEW',
        territory: 'Ashanti Region',
        expectedVolume: 75000,
        experience: '8 years in logistics and distribution'
      },
      {
        id: '3',
        companyName: 'Northern Trade Co.',
        contactPerson: 'Ibrahim Mohammed',
        email: 'ibrahim@northerntrade.com',
        phone: '+233 26 555 1234',
        location: 'Tamale, Ghana',
        businessType: 'General Trading',
        applicationDate: '2024-01-05',
        status: 'APPROVED',
        territory: 'Northern Region',
        expectedVolume: 30000,
        experience: '3 years in general trading'
      }
    ];
    setLeads(mockLeads);
  };

  const handleAddSuccess = () => {
    // Refresh the leads list after successful submission
    loadLeads();
  };

  const handleEditSuccess = () => {
    // Refresh the leads list after successful update
    loadLeads();
  };

  const handleEditClick = (lead: any) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleViewClick = (lead: any) => {
    router.push(`/drm/distributor-leads/${lead.id}`);
  };

  // Load data on component mount
  useEffect(() => {
    loadLeads();
    fetchCurrencySettings();
  }, []);

  const fetchCurrencySettings = async () => {
    try {
      const response = await fetch('/api/settings/currency');
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.baseCurrency || 'GHS');
      }
    } catch (err) {
      console.error('Error fetching currency settings:', err);
    }
  };

  // Handle edit parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      const leadToEdit = leads.find(lead => lead.id === editId);
      if (leadToEdit) {
        setSelectedLead(leadToEdit);
        setShowEditModal(true);
        // Clean up URL
        window.history.replaceState({}, '', '/drm/distributor-leads');
      }
    }
  }, [leads]);

  const statusOptions = [
    { key: 'ALL', label: 'All Applications', color: 'bg-gray-100 text-gray-800' },
    { key: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
    { key: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { key: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'UNDER_REVIEW': return <Eye className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Helper function to get profile image
  const getProfileImage = (lead: DistributorLead) => {
    if (lead.images && lead.images.length > 0) {
      const profileImage = lead.images.find(img => img.imageType === 'PROFILE_PICTURE');
      if (profileImage) {
        return profileImage.filePath;
      }
    }
    return lead.profileImage || null;
  };

  const filteredLeads = leads.filter(lead => {
    // Get display values with fallbacks
    const companyName = lead.companyName || lead.businessName || '';
    const contactPerson = lead.contactPerson || `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    const location = lead.location || `${lead.city || ''}, ${lead.region || ''}`.replace(/^,\s*|,\s*$/g, '');
    
    const matchesSearch = 
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/drm/distributor-leads?id=${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      if (response.ok) {
        // Update local state
        setLeads(leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        ));
        success(`Application status updated to ${newStatus.replace('_', ' ').toLowerCase()}`);
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to update application status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      error('Failed to update application status');
    }
  };

  const handleDelete = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await fetch(`/api/drm/distributor-leads?id=${leadId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // Update local state
          setLeads(leads.filter(lead => lead.id !== leadId));
          success('Application deleted successfully');
        } else {
          const errorData = await response.json();
          error(errorData.error || 'Failed to delete application');
        }
      } catch (err) {
        console.error('Error deleting lead:', err);
        error('Failed to delete application');
      }
    }
  };

  // Show loading while session is being fetched
  if (session === undefined) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!session?.user) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access distributor leads.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/drm/distributors')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to DRM
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Distributor Leads</h1>
              <p className="text-gray-600">Manage distributor applications and inquiries</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            style={{
              backgroundColor: theme.primary,
              color: 'white'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-1">
            <AIRecommendationCard 
              title="Distributor Leads AI"
              subtitle="Smart insights for application management"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
              page="distributor-leads"
              enableAI={true}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-xl font-bold text-gray-900">{leads.length}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-xl font-bold text-yellow-600">
                  {leads.filter(l => l.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-xl font-bold text-blue-600">
                  {leads.filter(l => l.status === 'UNDER_REVIEW').length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-xl font-bold text-green-600">
                  {leads.filter(l => l.status === 'APPROVED').length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatCurrency(leads.reduce((sum, lead) => sum + (lead.expectedVolume || 0), 0), currency)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-indigo-100">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Pipeline</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(leads.filter(l => l.status === 'APPROVED').reduce((sum, lead) => sum + (lead.expectedVolume || 0), 0), currency)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status.key}
                  variant={statusFilter === status.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.key)}
                  className={statusFilter === status.key ? `${status.color} text-white` : ''}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Applications Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Territory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => {
                  // Get display values with fallbacks
                  const companyName = lead.companyName || lead.businessName || 'N/A';
                  const contactPerson = lead.contactPerson || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'N/A';
                  const location = lead.location || `${lead.city || ''}, ${lead.region || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A';
                  const applicationDate = lead.applicationDate || lead.createdAt || new Date().toISOString();
                  
                  return (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewClick(lead)}
                    >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {getProfileImage(lead) ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={getProfileImage(lead)!}
                                  alt="Profile"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {companyName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {lead.businessType}
                              </div>
                            </div>
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contactPerson}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.territory || lead.region || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.expectedVolume ? `${formatCurrency(lead.expectedVolume, currency)}/month` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.key === lead.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1">
                            {statusOptions.find(s => s.key === lead.status)?.label}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(applicationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: 'View Details',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => handleViewClick(lead)
                          },
                          {
                            label: 'Edit',
                            icon: <Edit className="w-4 h-4" />,
                            onClick: () => handleEditClick(lead)
                          },
                          ...(lead.status === 'PENDING' ? [{
                            label: 'Mark Under Review',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => handleStatusChange(lead.id, 'UNDER_REVIEW')
                          }] : []),
                          ...(lead.status === 'UNDER_REVIEW' ? [
                            {
                              label: 'Approve',
                              icon: <CheckCircle className="w-4 h-4" />,
                              onClick: () => handleStatusChange(lead.id, 'APPROVED')
                            },
                            {
                              label: 'Reject',
                              icon: <XCircle className="w-4 h-4" />,
                              onClick: () => handleStatusChange(lead.id, 'REJECTED')
                            }
                          ] : []),
                          {
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => handleDelete(lead.id),
                            className: 'text-red-600'
                          }
                        ]}
                      />
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Distributor Lead Modal */}
      <AddDistributorLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Distributor Lead Modal */}
      <EditDistributorLeadModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }}
        onSuccess={handleEditSuccess}
        lead={selectedLead}
      />
      
    </>
  );
}
