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
  Map,
  MapPin,
  Route,
  Navigation,
  Clock,
  Users,
  Package,
  ArrowLeft,
  Layers,
  Target,
  Compass,
  Truck,
  Building2
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface Route {
  id: string;
  routeName: string;
  routeCode: string;
  distributorId: string;
  distributorName: string;
  territory: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'PLANNED';
  startPoint: {
    name: string;
    coordinates: { lat: number; lng: number };
    address: string;
  };
  endPoint: {
    name: string;
    coordinates: { lat: number; lng: number };
    address: string;
  };
  waypoints: {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    type: 'DELIVERY' | 'PICKUP' | 'WAREHOUSE' | 'DISTRIBUTOR';
    estimatedTime: number; // minutes
  }[];
  distance: number; // km
  estimatedDuration: number; // minutes
  frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  assignedDriver?: string;
  vehicle?: string;
  lastUpdated: string;
  performance: {
    onTimeDelivery: number; // percentage
    averageDeliveryTime: number; // minutes
    customerSatisfaction: number; // rating 1-5
    totalDeliveries: number;
  };
}

export default function RoutesMappingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const { success, error } = useToast();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // AI Recommendations for Routes & Mapping
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Route Optimization Needed',
      description: '3 routes can be optimized to reduce delivery time',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Driver Performance Review',
      description: '2 drivers have below-average on-time delivery rates',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'New Route Planning',
      description: 'Plan routes for 2 new distributor territories',
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
    const mockRoutes: Route[] = [
      {
        id: '1',
        routeName: 'Accra Central Route',
        routeCode: 'ACR-001',
        distributorId: '1',
        distributorName: 'Ghana Distribution Ltd',
        territory: 'Greater Accra',
        status: 'ACTIVE',
        startPoint: {
          name: 'Main Warehouse',
          coordinates: { lat: 5.6037, lng: -0.1870 },
          address: 'Industrial Area, Accra'
        },
        endPoint: {
          name: 'Accra Central Market',
          coordinates: { lat: 5.5500, lng: -0.2000 },
          address: 'Central Market, Accra'
        },
        waypoints: [
          {
            id: '1',
            name: 'Osu Retail Center',
            coordinates: { lat: 5.5500, lng: -0.1900 },
            type: 'DELIVERY',
            estimatedTime: 15
          },
          {
            id: '2',
            name: 'Labadi Distribution Point',
            coordinates: { lat: 5.5400, lng: -0.1800 },
            type: 'DISTRIBUTOR',
            estimatedTime: 25
          }
        ],
        distance: 25.5,
        estimatedDuration: 120,
        frequency: 'DAILY',
        assignedDriver: 'John Mensah',
        vehicle: 'Truck-001',
        lastUpdated: '2024-01-15',
        performance: {
          onTimeDelivery: 95,
          averageDeliveryTime: 110,
          customerSatisfaction: 4.5,
          totalDeliveries: 150
        }
      },
      {
        id: '2',
        routeName: 'Kumasi North Route',
        routeCode: 'KNR-002',
        distributorId: '2',
        distributorName: 'West Africa Logistics',
        territory: 'Ashanti Region',
        status: 'ACTIVE',
        startPoint: {
          name: 'Kumasi Warehouse',
          coordinates: { lat: 6.6885, lng: -1.6244 },
          address: 'Industrial Area, Kumasi'
        },
        endPoint: {
          name: 'Kejetia Market',
          coordinates: { lat: 6.7000, lng: -1.6200 },
          address: 'Kejetia Market, Kumasi'
        },
        waypoints: [
          {
            id: '3',
            name: 'Suame Roundabout',
            coordinates: { lat: 6.6900, lng: -1.6100 },
            type: 'DELIVERY',
            estimatedTime: 20
          }
        ],
        distance: 18.2,
        estimatedDuration: 90,
        frequency: 'WEEKLY',
        assignedDriver: 'Kwame Asante',
        vehicle: 'Truck-002',
        lastUpdated: '2024-01-14',
        performance: {
          onTimeDelivery: 88,
          averageDeliveryTime: 95,
          customerSatisfaction: 4.2,
          totalDeliveries: 75
        }
      },
      {
        id: '3',
        routeName: 'Tamale Regional Route',
        routeCode: 'TRR-003',
        distributorId: '3',
        distributorName: 'Northern Distributors',
        territory: 'Northern Region',
        status: 'PLANNED',
        startPoint: {
          name: 'Tamale Depot',
          coordinates: { lat: 9.4008, lng: -0.8393 },
          address: 'Tamale Industrial Area'
        },
        endPoint: {
          name: 'Central Tamale',
          coordinates: { lat: 9.4100, lng: -0.8300 },
          address: 'Central Business District, Tamale'
        },
        waypoints: [],
        distance: 12.8,
        estimatedDuration: 60,
        frequency: 'BI_WEEKLY',
        lastUpdated: '2024-01-10',
        performance: {
          onTimeDelivery: 0,
          averageDeliveryTime: 0,
          customerSatisfaction: 0,
          totalDeliveries: 0
        }
      }
    ];
    
    setRoutes(mockRoutes);
    setLoading(false);
  }, []);

  const statusOptions = [
    { key: 'ALL', label: 'All Routes', color: 'bg-gray-100 text-gray-800' },
    { key: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
    { key: 'INACTIVE', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { key: 'MAINTENANCE', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'PLANNED', label: 'Planned', color: 'bg-blue-100 text-blue-800' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Target className="w-4 h-4" />;
      case 'INACTIVE': return <Clock className="w-4 h-4" />;
      case 'MAINTENANCE': return <Package className="w-4 h-4" />;
      case 'PLANNED': return <Compass className="w-4 h-4" />;
      default: return <Map className="w-4 h-4" />;
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.territory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeRoutes = routes.filter(r => r.status === 'ACTIVE').length;
  const totalDistance = routes.reduce((sum, r) => sum + r.distance, 0);
  const averagePerformance = routes.reduce((sum, r) => sum + r.performance.onTimeDelivery, 0) / routes.length;

  if (!session?.user) {
    return <div>Please sign in to access routes and mapping.</div>;
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
              <h1 className="text-3xl font-bold">Routes & Mapping</h1>
              <p className="text-gray-600">Plan and manage distributor routes and territories</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <Layers className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
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
              Create Route
            </Button>
          </div>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Routes & Mapping AI"
              subtitle="Smart insights for route optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-xl font-bold text-gray-900">{routes.length}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Route className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-xl font-bold text-green-600">{activeRoutes}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-xl font-bold text-purple-600">{totalDistance.toFixed(1)} km</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Navigation className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-xl font-bold text-yellow-600">{averagePerformance.toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Package className="w-5 h-5 text-yellow-600" />
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
                  placeholder="Search routes..."
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

        {/* Routes List/Grid */}
        {viewMode === 'list' ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distributor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver/Vehicle
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Route className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {route.routeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {route.routeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-1 rounded bg-gray-100">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {route.distributorName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {route.territory}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.key === route.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusIcon(route.status)}
                          <span className="ml-1">
                            {statusOptions.find(s => s.key === route.status)?.label}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{route.distance} km</div>
                        <div className="text-gray-500">{route.estimatedDuration} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {route.performance.onTimeDelivery}% on-time
                        </div>
                        <div className="text-sm text-gray-500">
                          {route.performance.totalDeliveries} deliveries
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.assignedDriver && (
                          <div>
                            <div className="font-medium">{route.assignedDriver}</div>
                            <div className="text-gray-500">{route.vehicle}</div>
                          </div>
                        )}
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
                              label: 'View Details',
                              icon: <Eye className="w-4 h-4" />,
                              onClick: () => {/* TODO: View details */}
                            },
                            {
                              label: 'Edit Route',
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {/* TODO: Edit */}
                            },
                            {
                              label: 'View on Map',
                              icon: <Map className="w-4 h-4" />,
                              onClick: () => {/* TODO: Map view */}
                            },
                            {
                              label: 'Optimize Route',
                              icon: <Navigation className="w-4 h-4" />,
                              onClick: () => {/* TODO: Optimize */}
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="text-center py-12">
              <Map className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
              <p className="text-gray-600 mb-4">
                Interactive map view will be implemented here with route visualization
              </p>
              <Button
                onClick={() => setViewMode('list')}
                variant="outline"
              >
                Switch to List View
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
