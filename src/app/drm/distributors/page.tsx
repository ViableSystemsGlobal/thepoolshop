'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { useAbilities } from '@/hooks/use-abilities';
import { useToast } from '@/contexts/toast-context';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowLeft,
  Users,
  Package,
  DollarSign,
  Activity
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface Distributor {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  territory?: string;
  expectedVolume?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  approvedAt: string;
  approvedByUser: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    imageType: string;
    filePath: string;
  }>;
  interestedProducts?: Array<{
    id: string;
    product: {
      name: string;
      sku: string;
    };
    interestLevel: string;
    quantity: number;
  }>;
}

export default function DistributorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const { success, error } = useToast();

  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Load distributors from API
  const loadDistributors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drm/distributors', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistributors(data.data || []);
      } else {
        console.error('Failed to load distributors. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setDistributors([]);
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
      setDistributors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadDistributors();
    }
  }, [session?.user?.id]);

  // AI Recommendations for Distributors
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Performance Review Needed',
      description: '3 distributors have declining performance metrics',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Contract Renewal Due',
      description: '2 distributor contracts expire in 30 days',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Training Opportunity',
      description: 'Schedule product training for 4 distributors',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  const handleRecommendationComplete = (recommendationId: string) => {
    // Handle recommendation completion
    console.log('Recommendation completed:', recommendationId);
  };

  // Mock data for now

  const statusOptions = [
    { key: 'ALL', label: 'All Distributors', color: 'bg-gray-100 text-gray-800' },
    { key: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
    { key: 'SUSPENDED', label: 'Suspended', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'TERMINATED', label: 'Terminated', color: 'bg-red-100 text-red-800' },
  ];

  const getPerformanceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    };
  };

  const filteredDistributors = distributors.filter(distributor => {
    const contactPerson = `${distributor.firstName} ${distributor.lastName}`;
    const location = `${distributor.city}, ${distributor.region}`;
    
    const matchesSearch = 
      distributor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (distributor.territory || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || distributor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalVolume = distributors.reduce((sum, d) => sum + (d.expectedVolume || 0), 0);
  const activeDistributors = distributors.filter(d => d.status === 'ACTIVE').length;
  const totalDistributors = distributors.length;

  // Show loading state while session is being checked
  if (loading && !session?.user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading distributors...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show sign in message only if we're sure there's no session
  if (!loading && !session?.user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access distributors.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/drm/distributor-leads')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to DRM
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Active Distributors</h1>
              <p className="text-gray-600">Manage your distributor network and performance</p>
            </div>
          </div>
          <Button
            onClick={() => {/* TODO: Open add modal */}}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            style={{
              backgroundColor: theme.primary,
              color: 'white'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Distributor
          </Button>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Distributors AI"
              subtitle="Smart insights for distributor management"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distributors</p>
                <p className="text-xl font-bold text-gray-900">{totalDistributors}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Distributors</p>
                <p className="text-xl font-bold text-green-600">
                  {activeDistributors}
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p className="text-xl font-bold text-purple-600">
                  GHS {totalVolume.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                <p className="text-xl font-bold text-yellow-600">
                  {distributors.filter(d => {
                    const approvedDate = new Date(d.approvedAt);
                    const now = new Date();
                    return approvedDate.getMonth() === now.getMonth() && 
                           approvedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Star className="w-5 h-5 text-yellow-600" />
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
                  placeholder="Search distributors..."
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

        {/* Distributors Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading distributors...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDistributors.map((distributor) => {
            const contactPerson = `${distributor.firstName} ${distributor.lastName}`;
            const location = `${distributor.city}, ${distributor.region}`;
            const approvedDate = new Date(distributor.approvedAt).toLocaleDateString();

            return (
              <Card key={distributor.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{distributor.businessName}</h3>
                      <p className="text-sm text-gray-600">{contactPerson}</p>
                    </div>
                  </div>
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
                        onClick: () => router.push(`/drm/distributors/${distributor.id}`)
                      },
                      {
                        label: 'Edit',
                        icon: <Edit className="w-4 h-4" />,
                        onClick: () => {/* TODO: Edit */}
                      },
                      {
                        label: 'View Performance',
                        icon: <Activity className="w-4 h-4" />,
                        onClick: () => {/* TODO: Performance */}
                      }
                    ]}
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {location}
                  </div>
                  {distributor.territory && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {distributor.territory}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {distributor.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {distributor.email}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Sales Volume</p>
                      <p className="font-semibold">
                        {distributor.expectedVolume ? `GHS ${distributor.expectedVolume.toLocaleString()}/month` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          distributor.status === 'ACTIVE' ? 'bg-green-500' : 
                          distributor.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className="font-semibold capitalize">{distributor.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Approved</span>
                    <span className="font-medium">{approvedDate}</span>
                  </div>
                  
                  {distributor.interestedProducts && distributor.interestedProducts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Interested Products</p>
                      <div className="flex flex-wrap gap-1">
                        {distributor.interestedProducts.slice(0, 2).map((product, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {product.product.name}
                          </span>
                        ))}
                        {distributor.interestedProducts.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{distributor.interestedProducts.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
