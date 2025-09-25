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
  MapPin, 
  Route, 
  Users, 
  Truck,
  Calendar,
  Clock,
  Navigation,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowLeft,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface Zone {
  id: string;
  name: string;
  description?: string;
  color: string;
  boundaries: any;
  isActive: boolean;
  distributors: any[];
  routes: any[];
  createdAt: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  capacity: number;
  isActive: boolean;
  routes: any[];
  deliveries: any[];
}

interface Route {
  id: string;
  name: string;
  zoneId: string;
  zone: Zone;
  driverId?: string;
  driver?: Driver;
  waypoints: any[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  deliveries: any[];
}

export default function RoutesMappingPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const { hasAbility, loading: abilitiesLoading } = useAbilities();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'zones' | 'routes' | 'drivers'>('zones');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Data states
  const [zones, setZones] = useState<Zone[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);

  // Modal states
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [showCreateDriverModal, setShowCreateDriverModal] = useState(false);


  // Load data
  const loadZones = async () => {
    try {
      const response = await fetch('/api/drm/zones', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setZones(data.data || []);
      }
    } catch (err) {
      console.error('Error loading zones:', err);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await fetch('/api/drm/routes', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.data || []);
      }
    } catch (err) {
      console.error('Error loading routes:', err);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await fetch('/api/drm/drivers', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data || []);
      }
    } catch (err) {
      console.error('Error loading drivers:', err);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await fetch('/api/drm/distributors', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDistributors(data.data || []);
      }
    } catch (err) {
      console.error('Error loading distributors:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadZones(),
        loadRoutes(),
        loadDrivers(),
        loadDistributors()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Check permissions after all hooks are declared (no debug text)
  // Defer gate until session exists to avoid false negatives on first paint
  if (session && !abilitiesLoading && !hasAbility('routes-mapping', 'view')) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">You don't have permission to access routes and mapping.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Filter data based on search and status
  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'ACTIVE' && zone.isActive) ||
                         (statusFilter === 'INACTIVE' && !zone.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.driver?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm) ||
                         driver.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'ACTIVE' && driver.isActive) ||
                         (statusFilter === 'INACTIVE' && !driver.isActive);
    return matchesSearch && matchesStatus;
  });

  // AI Recommendations
  const aiRecommendations = [
    {
      id: "optimize-routes",
      title: "Optimize Route Planning",
      description: "Use AI to automatically generate optimal delivery routes based on distributor locations and delivery windows.",
      priority: "high",
      action: "Optimize Routes"
    },
    {
      id: "zone-analysis",
      title: "Zone Performance Analysis",
      description: "Analyze delivery performance by zone to identify areas for improvement and resource allocation.",
      priority: "medium",
      action: "View Analytics"
    },
    {
      id: "driver-capacity",
      title: "Driver Capacity Planning",
      description: "Ensure driver capacity matches delivery volume to prevent delays and optimize resource utilization.",
      priority: "medium",
      action: "Check Capacity"
    }
  ];

  // Stats calculations
  const totalZones = zones.length;
  const activeZones = zones.filter(z => z.isActive).length;
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(r => r.status === 'IN_PROGRESS').length;
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.isActive).length;
  const totalDistributors = distributors.length;
  const unassignedDistributors = distributors.filter(d => !d.zoneId).length;

  if (authStatus === 'loading') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access routes and mapping.</p>
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
              onClick={() => router.push('/drm/distributors')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to DRM
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Routes & Mapping</h1>
              <p className="text-gray-600">Manage delivery zones, routes, and drivers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'zones' && hasAbility('routes-mapping.create') && (
              <Button
                onClick={() => setShowCreateZoneModal(true)}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Zone
              </Button>
            )}
            {activeTab === 'routes' && hasAbility('routes-mapping.create') && (
              <Button
                onClick={() => setShowCreateRouteModal(true)}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Route
              </Button>
            )}
            {activeTab === 'drivers' && hasAbility('routes-mapping.create') && (
              <Button
                onClick={() => setShowCreateDriverModal(true)}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            )}
          </div>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Routes & Mapping AI"
              subtitle="Smart logistics optimization and route planning"
              recommendations={aiRecommendations}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zones</p>
                    <p className="text-xl font-bold text-blue-600">{totalZones}</p>
                    <p className="text-xs text-gray-500">{activeZones} active</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Route className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Routes</p>
                    <p className="text-xl font-bold text-green-600">{totalRoutes}</p>
                    <p className="text-xs text-gray-500">{activeRoutes} active</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Drivers</p>
                    <p className="text-xl font-bold text-orange-600">{totalDrivers}</p>
                    <p className="text-xs text-gray-500">{activeDrivers} active</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distributors</p>
                    <p className="text-xl font-bold text-purple-600">{totalDistributors}</p>
                    <p className="text-xs text-gray-500">{unassignedDistributors} unassigned</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('zones')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'zones'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2 inline" />
                Zones
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'routes'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Route className="w-4 h-4 mr-2 inline" />
                Routes
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'drivers'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Truck className="w-4 h-4 mr-2 inline" />
                Drivers
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex gap-2">
                {activeTab === 'zones' && (
                  <>
                    <Button
                      variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('ALL')}
                      className={statusFilter === 'ALL' ? 'bg-blue-600 text-white' : ''}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('ACTIVE')}
                      className={statusFilter === 'ACTIVE' ? 'bg-green-600 text-white' : ''}
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('INACTIVE')}
                      className={statusFilter === 'INACTIVE' ? 'bg-gray-600 text-white' : ''}
                    >
                      Inactive
                    </Button>
                  </>
                )}
                {activeTab === 'routes' && (
                  <>
                    <Button
                      variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('ALL')}
                      className={statusFilter === 'ALL' ? 'bg-blue-600 text-white' : ''}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === 'PLANNED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('PLANNED')}
                      className={statusFilter === 'PLANNED' ? 'bg-yellow-600 text-white' : ''}
                    >
                      Planned
                    </Button>
                    <Button
                      variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('IN_PROGRESS')}
                      className={statusFilter === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : ''}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('COMPLETED')}
                      className={statusFilter === 'COMPLETED' ? 'bg-green-600 text-white' : ''}
                    >
                      Completed
                    </Button>
                  </>
                )}
                {activeTab === 'drivers' && (
                  <>
                    <Button
                      variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('ALL')}
                      className={statusFilter === 'ALL' ? 'bg-blue-600 text-white' : ''}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('ACTIVE')}
                      className={statusFilter === 'ACTIVE' ? 'bg-green-600 text-white' : ''}
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('INACTIVE')}
                      className={statusFilter === 'INACTIVE' ? 'bg-gray-600 text-white' : ''}
                    >
                      Inactive
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'zones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredZones.map((zone) => (
                    <Card key={zone.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: zone.color }}
                          ></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                            <p className="text-sm text-gray-600">{zone.description}</p>
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
                              onClick: () => {/* TODO: View zone details */}
                            },
                            {
                              label: 'Edit Zone',
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {/* TODO: Edit zone */}
                            },
                            {
                              label: 'Delete Zone',
                              icon: <Trash2 className="w-4 h-4" />,
                              onClick: () => {/* TODO: Delete zone */}
                            }
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distributors:</span>
                          <span className="font-medium">{zone.distributors.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Routes:</span>
                          <span className="font-medium">{zone.routes.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            zone.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'routes' && (
                <div className="space-y-4">
                  {filteredRoutes.map((route) => (
                    <Card key={route.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Route className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{route.name}</h3>
                            <p className="text-sm text-gray-600">
                              {route.zone.name} • {route.driver?.name || 'No driver assigned'}
                            </p>
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
                              label: 'View Route',
                              icon: <Eye className="w-4 h-4" />,
                              onClick: () => {/* TODO: View route details */}
                            },
                            {
                              label: 'Edit Route',
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {/* TODO: Edit route */}
                            },
                            {
                              label: 'Start Route',
                              icon: <Navigation className="w-4 h-4" />,
                              onClick: () => {/* TODO: Start route */}
                            },
                            {
                              label: 'Delete Route',
                              icon: <Trash2 className="w-4 h-4" />,
                              onClick: () => {/* TODO: Delete route */}
                            }
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="font-semibold">{route.totalDistance.toFixed(1)} km</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold">{Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Deliveries</p>
                          <p className="font-semibold">{route.deliveries.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            route.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' :
                            route.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            route.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {route.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'drivers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDrivers.map((driver) => (
                    <Card key={driver.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Truck className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                            <p className="text-sm text-gray-600">{driver.phone}</p>
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
                              onClick: () => {/* TODO: View driver details */}
                            },
                            {
                              label: 'Edit Driver',
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {/* TODO: Edit driver */}
                            },
                            {
                              label: 'View Routes',
                              icon: <Route className="w-4 h-4" />,
                              onClick: () => {/* TODO: View driver routes */}
                            },
                            {
                              label: 'Delete Driver',
                              icon: <Trash2 className="w-4 h-4" />,
                              onClick: () => {/* TODO: Delete driver */}
                            }
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Vehicle:</span>
                          <span className="font-medium">{driver.vehicleType} - {driver.vehiclePlate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{driver.capacity} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active Routes:</span>
                          <span className="font-medium">{driver.routes.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            driver.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {driver.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}