'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { useAbilities } from '@/hooks/use-abilities';
import { useToast } from '@/contexts/toast-context';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Activity,
  FileText,
  MessageSquare,
  Settings,
  Star,
  Target,
  BarChart3,
  CreditCard,
  Send,
  Download,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface Distributor {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: string;
  businessRegistrationNumber?: string;
  yearsInBusiness?: number;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  territory?: string;
  expectedVolume?: number;
  experience?: string;
  investmentCapacity?: string;
  targetMarket?: string;
  notes?: string;
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
    originalName: string;
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

interface PerformanceMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  targetVolume: number;
  actualVolume: number;
  performanceRating: number;
  lastOrderDate?: string;
  paymentStatus: 'CURRENT' | 'OVERDUE' | 'EXCELLENT';
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHEQUE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference?: string;
}

export default function DistributorDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const { success, error } = useToast();

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const distributorId = params.id as string;

  // Load distributor data
  const loadDistributorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drm/distributors/${distributorId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistributor(data.data);
      } else {
        console.error('Failed to load distributor. Status:', response.status);
        error('Failed to load distributor details');
      }
    } catch (error) {
      console.error('Error loading distributor:', error);
      error('Error loading distributor details');
    } finally {
      setLoading(false);
    }
  };

  // Load performance metrics (mock data for now)
  const loadPerformanceMetrics = async () => {
    // TODO: Replace with actual API call
    setPerformanceMetrics({
      totalOrders: 24,
      totalRevenue: 125000,
      averageOrderValue: 5208,
      targetVolume: 150000,
      actualVolume: 125000,
      performanceRating: 83,
      lastOrderDate: '2025-09-20',
      paymentStatus: 'CURRENT'
    });
  };

  // Load orders (mock data for now)
  const loadOrders = async () => {
    // TODO: Replace with actual API call
    setOrders([
      {
        id: '1',
        orderNumber: 'ORD-2025-001',
        date: '2025-09-20',
        status: 'DELIVERED',
        totalAmount: 8500,
        items: [
          { productName: 'Product A', quantity: 10, unitPrice: 500 },
          { productName: 'Product B', quantity: 7, unitPrice: 500 }
        ]
      },
      {
        id: '2',
        orderNumber: 'ORD-2025-002',
        date: '2025-09-15',
        status: 'SHIPPED',
        totalAmount: 12000,
        items: [
          { productName: 'Product C', quantity: 15, unitPrice: 800 }
        ]
      }
    ]);
  };

  // Load payments (mock data for now)
  const loadPayments = async () => {
    // TODO: Replace with actual API call
    setPayments([
      {
        id: '1',
        date: '2025-09-18',
        amount: 8500,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        reference: 'TXN-001'
      },
      {
        id: '2',
        date: '2025-09-10',
        amount: 12000,
        method: 'MOBILE_MONEY',
        status: 'COMPLETED',
        reference: 'TXN-002'
      }
    ]);
  };

  useEffect(() => {
    if (session?.user?.id && distributorId) {
      loadDistributorData();
      loadPerformanceMetrics();
      loadOrders();
      loadPayments();
    }
  }, [session?.user?.id, distributorId]);

  // AI Recommendations for this distributor
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Performance Review',
      description: 'Distributor is performing at 83% of target. Consider additional training.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Payment Follow-up',
      description: 'One payment is pending. Send reminder notification.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Product Training',
      description: 'Schedule training for new product line.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  const handleRecommendationComplete = (recommendationId: string) => {
    console.log('Recommendation completed:', recommendationId);
  };

  const handleSendNotification = () => {
    // TODO: Implement notification sending
    console.log('Send notification to distributor');
  };

  const handleViewOnMaps = () => {
    if (distributor?.latitude && distributor?.longitude) {
      const url = `https://www.google.com/maps?q=${distributor.latitude},${distributor.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading distributor details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (!distributor) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Distributor not found</p>
            <Button 
              onClick={() => router.push('/drm/distributors')}
              className="mt-4"
            >
              Back to Distributors
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const contactPerson = `${distributor.firstName} ${distributor.lastName}`;
  const location = `${distributor.city}, ${distributor.region}`;
  const approvedDate = new Date(distributor.approvedAt).toLocaleDateString();
  const profileImage = distributor.images?.find(img => img.imageType === 'PROFILE_PICTURE');

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
              Back to Distributors
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{distributor.businessName}</h1>
              <p className="text-gray-600">Distributor Details & Performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSendNotification}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Notification
            </Button>
            <DropdownMenu
              trigger={
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              items={[
                {
                  label: 'Edit Distributor',
                  icon: <Edit className="w-4 h-4" />,
                  onClick: () => {/* TODO: Edit distributor */}
                },
                {
                  label: 'View Documents',
                  icon: <FileText className="w-4 h-4" />,
                  onClick: () => {/* TODO: View documents */}
                },
                {
                  label: 'Export Data',
                  icon: <Download className="w-4 h-4" />,
                  onClick: () => {/* TODO: Export data */}
                }
              ]}
            />
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage.filePath}
                  alt={distributor.businessName}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Business Information */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{distributor.businessName}</h2>
                  <p className="text-sm text-gray-600">{contactPerson}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      distributor.status === 'ACTIVE' ? 'bg-green-500' : 
                      distributor.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">{distributor.status.toLowerCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Approved on</p>
                  <p className="text-sm font-medium">{approvedDate}</p>
                  <p className="text-xs text-gray-500">by {distributor.approvedByUser.name}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>{distributor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{distributor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{location}</span>
                    {distributor.latitude && distributor.longitude && (
                      <Button
                        onClick={handleViewOnMaps}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                      >
                        View on Maps
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {distributor.territory && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{distributor.territory}</span>
                    </div>
                  )}
                  {distributor.businessType && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-3 h-3" />
                      <span>{distributor.businessType}</span>
                    </div>
                  )}
                  {distributor.yearsInBusiness && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{distributor.yearsInBusiness} years in business</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Recommendations and Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendations */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Distributor AI Insights"
              subtitle={`Smart recommendations for ${distributor.businessName}`}
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            {performanceMetrics && (
              <>
                {/* Performance Rating and Total Orders in one line */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Performance Rating</p>
                        <p className="text-2xl font-bold text-blue-600">{performanceMetrics.performanceRating}%</p>
                      </div>
                      <div className="p-2 rounded-full bg-blue-100">
                        <Star className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-xl font-bold text-purple-600">{performanceMetrics.totalOrders}</p>
                      </div>
                      <div className="p-2 rounded-full bg-purple-100">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Total Revenue in full width */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-green-600">
                        GHS {performanceMetrics.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-green-100">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
              { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Business Details */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Business Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Business Type</p>
                    <p className="text-sm font-medium">{distributor.businessType || 'N/A'}</p>
                  </div>
                  {distributor.businessRegistrationNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Registration Number</p>
                      <p className="text-sm font-medium">{distributor.businessRegistrationNumber}</p>
                    </div>
                  )}
                  {distributor.investmentCapacity && (
                    <div>
                      <p className="text-xs text-gray-500">Investment Capacity</p>
                      <p className="text-sm font-medium">{distributor.investmentCapacity}</p>
                    </div>
                  )}
                  {distributor.experience && (
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-medium">{distributor.experience}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Target vs Actual Volume */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3">Sales Volume</h3>
                {performanceMetrics && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Target Volume</span>
                        <span className="text-sm font-medium">GHS {performanceMetrics.targetVolume.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(performanceMetrics.actualVolume / performanceMetrics.targetVolume) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Actual Volume</span>
                        <span className="text-sm font-medium">GHS {performanceMetrics.actualVolume.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          {((performanceMetrics.actualVolume / performanceMetrics.targetVolume) * 100).toFixed(1)}% of target
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Interested Products */}
              {distributor.interestedProducts && distributor.interestedProducts.length > 0 && (
                <Card className="p-4 lg:col-span-2">
                  <h3 className="text-base font-semibold mb-3">Interested Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {distributor.interestedProducts.map((product, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h4 className="text-sm font-medium">{product.product.name}</h4>
                        <p className="text-xs text-gray-600">SKU: {product.product.sku}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">Interest Level</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.interestLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                            product.interestLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {product.interestLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
                <p className="text-gray-600">Performance analytics will be implemented here with charts and detailed metrics.</p>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <Button size="sm">Create New Order</Button>
                </div>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{order.orderNumber}</h4>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">GHS {order.totalAmount.toLocaleString()}</p>
                          <span className={`text-sm px-2 py-1 rounded ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Items: {order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Payment History</h3>
                  <Button size="sm">Record Payment</Button>
                </div>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{payment.reference}</h4>
                          <p className="text-sm text-gray-600">{payment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">GHS {payment.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{payment.method.replace('_', ' ')}</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Communication Hub</h3>
                <p className="text-gray-600">Communication history and notification management will be implemented here.</p>
              </Card>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Documents & Agreements</h3>
                <p className="text-gray-600">Document management and agreement tracking will be implemented here.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
