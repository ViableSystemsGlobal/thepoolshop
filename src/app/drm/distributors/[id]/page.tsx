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
  MoreHorizontal,
  Upload,
  Image,
  FileIcon
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import CreditApprovalModal from '@/components/modals/credit-approval-modal';
import CreditHistoryModal from '@/components/modals/credit-history-modal';
import SendDistributorSMSModal from '@/components/modals/send-distributor-sms-modal';
import SendDistributorEmailModal from '@/components/modals/send-distributor-email-modal';
import UploadDistributorDocumentModal from '@/components/modals/upload-distributor-document-modal';

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
  // Credit Management Fields
  creditLimit?: number;
  currentCreditUsed?: number;
  creditTerms?: string;
  creditStatus?: 'ACTIVE' | 'SUSPENDED' | 'OVERDUE' | 'UNDER_REVIEW';
  lastCreditReview?: string;
  nextCreditReview?: string;
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


interface CreditInfo {
  creditLimit: number;
  currentCreditUsed: number;
  availableCredit: number;
  creditUtilization: number;
  creditStatus: 'ACTIVE' | 'SUSPENDED' | 'OVERDUE' | 'UNDER_REVIEW';
  creditTerms: string;
  lastCreditReview?: string;
  nextCreditReview?: string;
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
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showCreditHistoryModal, setShowCreditHistoryModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [communications, setCommunications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [communicationsLoading, setCommunicationsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentFilter, setDocumentFilter] = useState<'ALL' | 'AGREEMENTS' | 'BUSINESS' | 'ID' | 'OTHER'>('ALL');

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
    } catch (err) {
      console.error('Error loading distributor:', err);
      error('Error loading distributor details');
    } finally {
      setLoading(false);
    }
  };


  // Load credit information
  const loadCreditInfo = async () => {
    if (!distributor) return;
    
    // TODO: Replace with actual API call
    const creditLimit = distributor.creditLimit ? parseFloat(distributor.creditLimit.toString()) : 2000;
    const currentUsed = distributor.currentCreditUsed ? parseFloat(distributor.currentCreditUsed.toString()) : 500;
    const available = creditLimit - currentUsed;
    const utilization = creditLimit > 0 ? (currentUsed / creditLimit) * 100 : 0;
    
    setCreditInfo({
      creditLimit,
      currentCreditUsed: currentUsed,
      availableCredit: available,
      creditUtilization: utilization,
      creditStatus: distributor.creditStatus || 'ACTIVE',
      creditTerms: distributor.creditTerms || 'Net 30',
      lastCreditReview: distributor.lastCreditReview ? new Date(distributor.lastCreditReview).toLocaleDateString() : undefined,
      nextCreditReview: distributor.nextCreditReview ? new Date(distributor.nextCreditReview).toLocaleDateString() : undefined
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
      loadOrders();
      loadPayments();
    }
  }, [session?.user?.id, distributorId]);

  useEffect(() => {
    if (distributor) {
      loadCreditInfo();
    }
  }, [distributor]);

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

  const handleCreditApprovalComplete = () => {
    // Reload distributor data to get updated credit information
    loadDistributorData();
  };

  // Load communications data
  const loadCommunications = async () => {
    if (!distributorId) return;
    
    setCommunicationsLoading(true);
    try {
      const response = await fetch(`/api/drm/distributors/${distributorId}/communications`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommunications(data.data.communications || []);
      } else {
        console.error('Failed to load communications');
      }
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setCommunicationsLoading(false);
    }
  };

  // Load documents data
  const loadDocuments = async () => {
    if (!distributorId) return;
    
    setDocumentsLoading(true);
    try {
      const response = await fetch(`/api/drm/distributors/${distributorId}/documents`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data.documents || []);
      } else {
        console.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'communication') {
      loadCommunications();
    } else if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab, distributorId]);

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
              
              {/* Contact Information */}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{distributor.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{distributor.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                  {distributor.latitude && distributor.longitude && (
                    <Button
                      onClick={handleViewOnMaps}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto ml-1"
                    >
                      View on Maps
                    </Button>
                  )}
                </div>
              </div>
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

          {/* Metric Cards */}
          <div className="space-y-4">
            {/* Top Row: Performance Rating and Total Orders */}
            <div className="grid grid-cols-2 gap-3">
              {/* Performance Rating */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance Rating</p>
                    <p className="text-2xl font-bold text-blue-600">83%</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </Card>

              {/* Total Orders */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-purple-100">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Row: Revenue and Available Credit */}
            <div className="grid grid-cols-2 gap-3">
              {/* Revenue */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      <span className="text-lg">GHS</span> 45,200
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </Card>

              {/* Available Credit */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Credit</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {creditInfo ? (
                        <>
                          <span className="text-lg">GHS</span> {creditInfo.availableCredit.toLocaleString()}
                        </>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
              { id: 'credit', label: 'Credit', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <DollarSign className="w-4 h-4" /> },
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
            <div className="space-y-6">
              {/* Top Row: Profile Overview and Sales Volume */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                    {/* Business Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Business Type</p>
                        <p className="text-sm font-medium">{distributor.businessType || 'N/A'}</p>
                      </div>
                      {distributor.businessRegistrationNumber && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Registration Number</p>
                          <p className="text-sm font-medium">{distributor.businessRegistrationNumber}</p>
                        </div>
                      )}
                      {distributor.investmentCapacity && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Investment Capacity</p>
                          <p className="text-sm font-medium">{distributor.investmentCapacity}</p>
                        </div>
                      )}
                      {distributor.experience && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Experience</p>
                          <p className="text-sm font-medium">{distributor.experience}</p>
                        </div>
                      )}
                      {distributor.territory && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Territory</p>
                          <p className="text-sm font-medium">{distributor.territory}</p>
                        </div>
                      )}
                      {distributor.yearsInBusiness && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Years in Business</p>
                          <p className="text-sm font-medium">{distributor.yearsInBusiness} years</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </Card>

                {/* Sales Volume Card */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3">Sales Volume</h3>
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Sales volume data will be available when orders are processed</p>
                    </div>
                    
                    {/* Last Order Information */}
                    {orders && orders.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Last Order</span>
                          <span className="text-xs text-gray-500">{orders[0].date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{orders[0].orderNumber}</span>
                          <span className="text-sm font-medium text-green-600">GHS {orders[0].totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Bottom Row: Credit Information and Interested Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Credit Information */}
                {creditInfo && (
                  <Card className="p-4">
                    <h3 className="text-base font-semibold mb-3">Credit Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Credit Limit</p>
                        <p className="text-sm font-medium">GHS {creditInfo.creditLimit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Credit Used</p>
                        <p className="text-sm font-medium">GHS {creditInfo.currentCreditUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Available Credit</p>
                        <p className={`text-sm font-medium ${creditInfo.availableCredit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          GHS {creditInfo.availableCredit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Credit Status</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          creditInfo.creditStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          creditInfo.creditStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          creditInfo.creditStatus === 'OVERDUE' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {creditInfo.creditStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Credit Utilization</span>
                        <span className="text-xs font-medium">{creditInfo.creditUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            creditInfo.creditUtilization >= 90 ? 'bg-red-600' :
                            creditInfo.creditUtilization >= 80 ? 'bg-orange-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(creditInfo.creditUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Payment Terms</p>
                        <p className="text-sm font-medium">{creditInfo.creditTerms}</p>
                      </div>
                      {creditInfo.nextCreditReview && (
                        <div>
                          <p className="text-xs text-gray-500">Next Review</p>
                          <p className="text-sm font-medium">{creditInfo.nextCreditReview}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Interested Products */}
                {distributor.interestedProducts && distributor.interestedProducts.length > 0 && (
                  <Card className="p-4">
                    <h3 className="text-base font-semibold mb-3">Interested Products</h3>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-3 pr-2">
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
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}


          {activeTab === 'credit' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Credit Management</h3>
                  <Button 
                    size="sm"
                    onClick={() => setShowCreditModal(true)}
                  >
                    Adjust Credit Limit
                  </Button>
                </div>
                {creditInfo && (
                  <div className="space-y-6">
                    {/* Credit Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">GHS {creditInfo.creditLimit.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Credit Limit</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">GHS {creditInfo.currentCreditUsed.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Credit Used</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className={`text-2xl font-bold ${creditInfo.availableCredit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          GHS {creditInfo.availableCredit.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Available Credit</p>
                      </div>
                    </div>

                    {/* Credit Utilization Chart */}
                    <div>
                      <h4 className="text-base font-semibold mb-3">Credit Utilization</h4>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            creditInfo.creditUtilization >= 90 ? 'bg-red-600' :
                            creditInfo.creditUtilization >= 80 ? 'bg-orange-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(creditInfo.creditUtilization, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">0%</span>
                        <span className="text-sm font-medium">{creditInfo.creditUtilization.toFixed(1)}% utilized</span>
                        <span className="text-sm text-gray-600">100%</span>
                      </div>
                    </div>

                    {/* Credit Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-base font-semibold mb-3">Credit Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              creditInfo.creditStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              creditInfo.creditStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                              creditInfo.creditStatus === 'OVERDUE' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {creditInfo.creditStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Payment Terms:</span>
                            <span className="text-sm font-medium">{creditInfo.creditTerms}</span>
                          </div>
                          {creditInfo.lastCreditReview && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Last Review:</span>
                              <span className="text-sm font-medium">{creditInfo.lastCreditReview}</span>
                            </div>
                          )}
                          {creditInfo.nextCreditReview && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Next Review:</span>
                              <span className="text-sm font-medium">{creditInfo.nextCreditReview}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => setShowCreditModal(true)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Adjust Credit Limit
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => setShowCreditHistoryModal(true)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Credit History
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
              {/* Communication Actions */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Communication Hub</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowSMSModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Send SMS
                    </Button>
                    <Button
                      onClick={() => setShowEmailModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>

                {/* Communication Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">SMS Messages</p>
                        <p className="text-xl font-bold text-blue-600">
                          {communications.filter(c => c.type === 'SMS').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Messages</p>
                        <p className="text-xl font-bold text-green-600">
                          {communications.filter(c => c.type === 'EMAIL').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Messages</p>
                        <p className="text-xl font-bold text-purple-600">
                          {communications.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication History */}
                <div>
                  <h4 className="text-md font-semibold mb-3">Recent Communications</h4>
                  {communicationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">Loading communications...</span>
                    </div>
                  ) : communications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No communications yet</p>
                      <p className="text-sm">Send your first SMS or email to start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {communications.map((comm) => (
                        <div key={comm.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                comm.type === 'SMS' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                {comm.type === 'SMS' ? (
                                  <Phone className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Mail className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium ${
                                    comm.type === 'SMS' ? 'text-blue-600' : 'text-green-600'
                                  }`}>
                                    {comm.type}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    comm.status === 'SENT' ? 'bg-green-100 text-green-800' :
                                    comm.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {comm.status}
                                  </span>
                                </div>
                                {comm.subject && (
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    {comm.subject}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 mb-2">
                                  {comm.content.length > 100 
                                    ? `${comm.content.substring(0, 100)}...` 
                                    : comm.content
                                  }
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>To: {comm.to}</span>
                                  <span>{new Date(comm.sentAt).toLocaleString()}</span>
                                </div>
                                {comm.errorMessage && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Error: {comm.errorMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Documents & Agreements</h3>
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

                {/* Document Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Agreements</p>
                        <p className="text-xl font-bold text-blue-600">
                          {documents.filter(d => ['DISTRIBUTOR_AGREEMENT', 'SERVICE_CONTRACT', 'TERMS_CONDITIONS'].includes(d.imageType)).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Business Docs</p>
                        <p className="text-xl font-bold text-green-600">
                          {documents.filter(d => ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'BUSINESS_PREMISES'].includes(d.imageType)).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ID Documents</p>
                        <p className="text-xl font-bold text-orange-600">
                          {documents.filter(d => d.imageType === 'ID_DOCUMENT').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Image className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Other</p>
                        <p className="text-xl font-bold text-purple-600">
                          {documents.filter(d => ['PROFILE_PICTURE', 'BANK_STATEMENT', 'REFERENCE_LETTER', 'OTHER'].includes(d.imageType)).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Filter */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant={documentFilter === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDocumentFilter('ALL')}
                      className={documentFilter === 'ALL' ? 'bg-blue-600 text-white' : ''}
                    >
                      All ({documents.length})
                    </Button>
                    <Button
                      variant={documentFilter === 'AGREEMENTS' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDocumentFilter('AGREEMENTS')}
                      className={documentFilter === 'AGREEMENTS' ? 'bg-blue-600 text-white' : ''}
                    >
                      Agreements ({documents.filter(d => ['DISTRIBUTOR_AGREEMENT', 'SERVICE_CONTRACT', 'TERMS_CONDITIONS'].includes(d.imageType)).length})
                    </Button>
                    <Button
                      variant={documentFilter === 'BUSINESS' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDocumentFilter('BUSINESS')}
                      className={documentFilter === 'BUSINESS' ? 'bg-green-600 text-white' : ''}
                    >
                      Business ({documents.filter(d => ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'BUSINESS_PREMISES'].includes(d.imageType)).length})
                    </Button>
                    <Button
                      variant={documentFilter === 'ID' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDocumentFilter('ID')}
                      className={documentFilter === 'ID' ? 'bg-orange-600 text-white' : ''}
                    >
                      ID ({documents.filter(d => d.imageType === 'ID_DOCUMENT').length})
                    </Button>
                    <Button
                      variant={documentFilter === 'OTHER' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDocumentFilter('OTHER')}
                      className={documentFilter === 'OTHER' ? 'bg-purple-600 text-white' : ''}
                    >
                      Other ({documents.filter(d => ['PROFILE_PICTURE', 'BANK_STATEMENT', 'REFERENCE_LETTER', 'OTHER'].includes(d.imageType)).length})
                    </Button>
                  </div>
                </div>

                {/* Documents List */}
                <div>
                  <h4 className="text-md font-semibold mb-3">
                    {documentFilter === 'ALL' ? 'All Documents' : 
                     documentFilter === 'AGREEMENTS' ? 'Agreement Documents' :
                     documentFilter === 'BUSINESS' ? 'Business Documents' :
                     documentFilter === 'ID' ? 'ID Documents' : 'Other Documents'}
                  </h4>
                  {documentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">Loading documents...</span>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm">Upload business documents, IDs, and other relevant files</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {documents.filter(doc => {
                        if (documentFilter === 'ALL') return true;
                        if (documentFilter === 'AGREEMENTS') return ['DISTRIBUTOR_AGREEMENT', 'SERVICE_CONTRACT', 'TERMS_CONDITIONS'].includes(doc.imageType);
                        if (documentFilter === 'BUSINESS') return ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'BUSINESS_PREMISES'].includes(doc.imageType);
                        if (documentFilter === 'ID') return doc.imageType === 'ID_DOCUMENT';
                        if (documentFilter === 'OTHER') return ['PROFILE_PICTURE', 'BANK_STATEMENT', 'REFERENCE_LETTER', 'OTHER'].includes(doc.imageType);
                        return true;
                      }).map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {doc.fileType.startsWith('image/') ? (
                                  <Image className="w-5 h-5 text-blue-600" />
                                ) : doc.fileType.includes('pdf') ? (
                                  <FileText className="w-5 h-5 text-red-600" />
                                ) : (
                                  <FileIcon className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {doc.originalName}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    ['DISTRIBUTOR_AGREEMENT', 'SERVICE_CONTRACT', 'TERMS_CONDITIONS'].includes(doc.imageType) 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'BUSINESS_PREMISES'].includes(doc.imageType)
                                      ? 'bg-green-100 text-green-700'
                                      : doc.imageType === 'ID_DOCUMENT'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {doc.imageType === 'DISTRIBUTOR_AGREEMENT' ? 'Agreement' :
                                     doc.imageType === 'SERVICE_CONTRACT' ? 'Contract' :
                                     doc.imageType === 'TERMS_CONDITIONS' ? 'Terms' :
                                     doc.imageType === 'BUSINESS_LICENSE' ? 'License' :
                                     doc.imageType === 'TAX_CERTIFICATE' ? 'Tax Cert' :
                                     doc.imageType === 'BUSINESS_PREMISES' ? 'Premises' :
                                     doc.imageType === 'ID_DOCUMENT' ? 'ID' :
                                     doc.imageType === 'BANK_STATEMENT' ? 'Bank Statement' :
                                     doc.imageType === 'REFERENCE_LETTER' ? 'Reference' :
                                     doc.imageType === 'PROFILE_PICTURE' ? 'Profile' :
                                     doc.imageType.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => window.open(doc.filePath, '_blank')}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                              <Button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.filePath;
                                  link.download = doc.originalName;
                                  link.click();
                                }}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Credit Approval Modal */}
      {distributor && (
        <CreditApprovalModal
          isOpen={showCreditModal}
          onClose={() => setShowCreditModal(false)}
          distributor={{
            id: distributor.id,
            businessName: distributor.businessName,
            firstName: distributor.firstName,
            lastName: distributor.lastName,
            currentCreditLimit: distributor.creditLimit,
            currentCreditUsed: distributor.currentCreditUsed
          }}
          onApprovalComplete={handleCreditApprovalComplete}
        />
      )}

      {/* Credit History Modal */}
      {distributor && (
        <CreditHistoryModal
          isOpen={showCreditHistoryModal}
          onClose={() => setShowCreditHistoryModal(false)}
          distributorId={distributor.id}
          distributorName={distributor.businessName}
        />
      )}

      {/* Send SMS Modal */}
      {distributor && (
        <SendDistributorSMSModal
          isOpen={showSMSModal}
          onClose={() => setShowSMSModal(false)}
          distributorId={distributor.id}
          distributorName={distributor.businessName}
          phoneNumber={distributor.phone}
          onSent={loadCommunications}
        />
      )}

      {/* Send Email Modal */}
      {distributor && (
        <SendDistributorEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          distributorId={distributor.id}
          distributorName={distributor.businessName}
          emailAddress={distributor.email}
          onSent={loadCommunications}
        />
      )}

      {/* Upload Document Modal */}
      {distributor && (
        <UploadDistributorDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          distributorId={distributor.id}
          distributorName={distributor.businessName}
          onUploaded={loadDocuments}
        />
      )}
    </MainLayout>
  );
}
