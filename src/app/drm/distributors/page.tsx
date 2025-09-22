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
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  territory: string;
  joinDate: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  performance: {
    rating: number;
    monthlyVolume: number;
    lastMonthVolume: number;
    totalSales: number;
    activeRoutes: number;
  };
  contract: {
    startDate: string;
    endDate: string;
    commissionRate: number;
    minimumVolume: number;
  };
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
  useEffect(() => {
    const mockDistributors: Distributor[] = [
      {
        id: '1',
        companyName: 'Ghana Distribution Ltd',
        contactPerson: 'Kwame Asante',
        email: 'kwame@ghanadist.com',
        phone: '+233 24 123 4567',
        location: 'Accra, Ghana',
        territory: 'Greater Accra',
        joinDate: '2023-06-15',
        status: 'ACTIVE',
        performance: {
          rating: 4.8,
          monthlyVolume: 125000,
          lastMonthVolume: 118000,
          totalSales: 1500000,
          activeRoutes: 8
        },
        contract: {
          startDate: '2023-06-15',
          endDate: '2024-06-15',
          commissionRate: 12,
          minimumVolume: 100000
        }
      },
      {
        id: '2',
        companyName: 'West Africa Logistics',
        contactPerson: 'Ama Serwaa',
        email: 'ama@walogistics.com',
        phone: '+233 20 987 6543',
        location: 'Kumasi, Ghana',
        territory: 'Ashanti Region',
        joinDate: '2023-08-20',
        status: 'ACTIVE',
        performance: {
          rating: 4.6,
          monthlyVolume: 95000,
          lastMonthVolume: 102000,
          totalSales: 1200000,
          activeRoutes: 6
        },
        contract: {
          startDate: '2023-08-20',
          endDate: '2024-08-20',
          commissionRate: 10,
          minimumVolume: 80000
        }
      },
      {
        id: '3',
        companyName: 'Northern Distributors',
        contactPerson: 'Ibrahim Mohammed',
        email: 'ibrahim@northdist.com',
        phone: '+233 26 555 1234',
        location: 'Tamale, Ghana',
        territory: 'Northern Region',
        joinDate: '2023-12-01',
        status: 'ACTIVE',
        performance: {
          rating: 4.2,
          monthlyVolume: 45000,
          lastMonthVolume: 42000,
          totalSales: 450000,
          activeRoutes: 3
        },
        contract: {
          startDate: '2023-12-01',
          endDate: '2024-12-01',
          commissionRate: 8,
          minimumVolume: 40000
        }
      }
    ];
    
    setDistributors(mockDistributors);
    setLoading(false);
  }, []);

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
    const matchesSearch = 
      distributor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.territory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || distributor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalVolume = distributors.reduce((sum, d) => sum + d.performance.monthlyVolume, 0);
  const totalSales = distributors.reduce((sum, d) => sum + d.performance.totalSales, 0);
  const averageRating = distributors.reduce((sum, d) => sum + d.performance.rating, 0) / distributors.length;

  if (!session?.user) {
    return <div>Please sign in to access distributors.</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/drm')}
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
                <p className="text-xl font-bold text-gray-900">{distributors.length}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                <p className="text-xl font-bold text-green-600">
                  ${totalVolume.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-xl font-bold text-purple-600">
                  ${totalSales.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-xl font-bold text-yellow-600">
                  {averageRating.toFixed(1)}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDistributors.map((distributor) => {
            const volumeChange = getPerformanceChange(
              distributor.performance.monthlyVolume,
              distributor.performance.lastMonthVolume
            );

            return (
              <Card key={distributor.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{distributor.companyName}</h3>
                      <p className="text-sm text-gray-600">{distributor.contactPerson}</p>
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
                        onClick: () => {/* TODO: View details */}
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
                    {distributor.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {distributor.territory}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {distributor.phone}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Volume</p>
                      <p className="font-semibold">${distributor.performance.monthlyVolume.toLocaleString()}</p>
                      <div className={`flex items-center text-xs ${
                        volumeChange.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {volumeChange.isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {volumeChange.value}%
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-semibold">{distributor.performance.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Active Routes</span>
                    <span className="font-medium">{distributor.performance.activeRoutes}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
