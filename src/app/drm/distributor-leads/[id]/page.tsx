'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  FileText, 
  User, 
  Briefcase, 
  Target, 
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Award,
  Activity,
  Camera,
  Upload,
  Trash2,
  MessageSquare,
  Package,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { AddLeadSMSModal } from '@/components/modals/add-lead-sms-modal';
import { AddLeadEmailModal } from '@/components/modals/add-lead-email-modal';
import { useToast } from '@/contexts/toast-context';

interface DistributorLeadImage {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  imageType: string;
  uploadedAt: string;
}

interface DistributorLeadProduct {
  id: string;
  productId: string;
  quantity: number;
  notes?: string;
  interestLevel: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

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
  businessLicense?: string;
  taxCertificate?: string;
  yearsInBusiness?: number;
  investmentCapacity?: string;
  targetMarket?: string;
  images?: DistributorLeadImage[];
  interestedProducts?: DistributorLeadProduct[];
}

export default function DistributorLeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { success, error } = useToast();
  
  const [lead, setLead] = useState<DistributorLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/drm/distributor-leads/${params.id}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          console.log('📸 Frontend - Lead images:', {
            imagesCount: data.data?.images?.length || 0,
            images: data.data?.images || [],
            legacyProfileImage: data.data?.profileImage
          });
          setLead(data.data);
        } else {
          console.error('Failed to fetch distributor lead. Status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          // Fallback to mock data for demo
          setLead({
            id: params.id as string,
            firstName: 'John',
            lastName: 'Doe',
            businessName: 'Demo Distributor Co.',
            email: 'john@demodistributor.com',
            phone: '+233 24 123 4567',
            businessType: 'Retail',
            status: 'UNDER_REVIEW',
            city: 'Accra',
            region: 'Greater Accra',
            territory: 'Accra Central',
            expectedVolume: 500,
            experience: '5 years in retail distribution',
            notes: 'Strong candidate with excellent track record in the retail sector. Has experience with FMCG distribution and strong network in the Greater Accra region.',
            createdAt: new Date().toISOString(),
            profileImage: '/api/placeholder/150/150',
            yearsInBusiness: 5,
            investmentCapacity: 'GHS 50,000 - 100,000',
            targetMarket: 'FMCG, Electronics, Home & Garden'
          });
        }
      } catch (error) {
        console.error('Error fetching distributor lead:', error);
        console.error('Trying to fetch ID:', params.id);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLead();
    }
  }, [params.id]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!lead) {
    return (
      <>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Distributor Lead Not Found</h2>
          <p className="text-gray-600 mb-4">The distributor lead you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/drm/distributor-leads')}>
            Back to Distributor Leads
          </Button>
        </div>
      </>
    );
  }

  // Get display values with fallbacks
  const companyName = lead.companyName || lead.businessName || 'N/A';
  const contactPerson = lead.contactPerson || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'N/A';
  const location = lead.location || `${lead.city || ''}, ${lead.region || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A';
  const applicationDate = lead.applicationDate || lead.createdAt || new Date().toISOString();
  const status = lead.status || 'PENDING';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'UNDER_REVIEW': return <FileText className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Helper function to get profile image from new images array or legacy field
  const getProfileImage = () => {
    if (lead.images && lead.images.length > 0) {
      const profileImage = lead.images.find((img: DistributorLeadImage) => img.imageType === 'PROFILE_PICTURE');
      if (profileImage && profileImage.filePath) {
        return profileImage.filePath;
      }
    }
    return null;
  };

  // Generate real activities from lead data
  const generateActivities = () => {
    if (!lead) return [];
    
    const activities = [];
    
    // Application submitted activity
    activities.push({
      id: 'application',
      type: 'application',
      title: 'Application Submitted',
      description: `Submitted by ${contactPerson}`,
      timestamp: new Date(applicationDate),
      icon: <CheckCircle className="w-3 h-3 text-green-600" />
    });
    
    // Documents uploaded activity
    if (lead.images && lead.images.length > 0) {
      activities.push({
        id: 'documents',
        type: 'documents',
        title: 'Documents Uploaded',
        description: `${lead.images.length} document(s) uploaded for review`,
        timestamp: new Date(applicationDate), // Use application date as fallback
        icon: <FileText className="w-3 h-3 text-blue-600" />
      });
    }
    
    // Interested products activity
    if (lead.interestedProducts && lead.interestedProducts.length > 0) {
      activities.push({
        id: 'products',
        type: 'products',
        title: 'Products Selected',
        description: `${lead.interestedProducts.length} product(s) selected`,
        timestamp: new Date(applicationDate), // Use application date as fallback
        icon: <Package className="w-3 h-3 text-purple-600" />
      });
    }
    
    // Status change activities
    if (status === 'UNDER_REVIEW') {
      activities.push({
        id: 'review',
        type: 'status',
        title: 'Application Under Review',
        description: 'Status changed to Under Review',
        timestamp: new Date(applicationDate), // Use application date as fallback
        icon: <FileText className="w-3 h-3 text-blue-600" />
      });
    }
    
    if (status === 'APPROVED') {
      activities.push({
        id: 'approved',
        type: 'status',
        title: 'Application Approved',
        description: 'Status changed to Approved',
        timestamp: new Date(applicationDate), // Use application date as fallback
        icon: <CheckCircle className="w-3 h-3 text-green-600" />
      });
    }
    
    if (status === 'REJECTED') {
      activities.push({
        id: 'rejected',
        type: 'status',
        title: 'Application Rejected',
        description: 'Status changed to Rejected',
        timestamp: new Date(applicationDate), // Use application date as fallback
        icon: <XCircle className="w-3 h-3 text-red-600" />
      });
    }
    
    // Sort by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Get activities to display (limited or all)
  const getDisplayActivities = () => {
    const allActivities = generateActivities();
    return showAllActivities ? allActivities : allActivities.slice(0, 4);
  };

  // Helper function to format time ago
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return timestamp.toLocaleDateString();
  };

  // Helper function to generate Google Maps URL
  const getGoogleMapsUrl = (): string | null => {
    if (lead && (lead as any).latitude && (lead as any).longitude) {
      // Use coordinates if available
      return `https://www.google.com/maps?q=${(lead as any).latitude},${(lead as any).longitude}`;
    } else if (location && location !== 'N/A') {
      // Use location string as fallback
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    }
    return null;
  };

  const handleSMSSend = async (smsData: any) => {
    try {
      const response = await fetch('/api/distributor-lead-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
        credentials: 'include',
      });

      if (response.ok) {
        success('SMS sent successfully!');
        setShowSMSModal(false);
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to send SMS');
      }
    } catch (err) {
      error('Failed to send SMS');
    }
  };

  const handleEmailSend = async (emailData: any) => {
    try {
      const response = await fetch('/api/distributor-lead-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
        credentials: 'include',
      });

      if (response.ok) {
        success('Email sent successfully!');
        setShowEmailModal(false);
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      error('Failed to send email');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/drm/distributor-leads')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Distributor Leads</span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`tel:${lead.phone}`)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSMSModal(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </Button>
            <Button
              onClick={() => {
                // Open edit modal instead of navigating to edit page
                router.push(`/drm/distributor-leads?edit=${lead.id}`);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Lead
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="bg-blue-600 text-white p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {getProfileImage() ? (
                  <img
                    src={getProfileImage()!}
                    alt={contactPerson}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white border-opacity-20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white border-opacity-20">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
                <p className="text-xl text-white text-opacity-90 mb-4">{contactPerson}</p>
                <div className="flex items-center space-x-4">
                  <Badge className={`${getStatusColor(status)} flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border`}>
                    {getStatusIcon(status)}
                    <span>{status.replace('_', ' ')}</span>
                  </Badge>
                  <div className="text-white text-opacity-80">
                    Applied: {new Date(applicationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investment Capacity</p>
                        <p className="text-lg font-semibold">
                          {lead.investmentCapacity || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sales Volume</p>
                        <p className="text-lg font-semibold">
                          {lead.expectedVolume ? `GHS ${lead.expectedVolume.toLocaleString()}/month` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="text-lg font-semibold">
                          {lead.yearsInBusiness ? `${lead.yearsInBusiness} years` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Territory</p>
                        <p className="text-lg font-semibold">{lead.territory || 'N/A'}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{lead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Location</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{location}</p>
                            {getGoogleMapsUrl() && (
                              <a
                                href={getGoogleMapsUrl()!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View on Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>Business Information</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Business Type</p>
                          <p className="font-medium">{lead.businessType}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Application Date</p>
                          <p className="font-medium">{new Date(applicationDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {lead.targetMarket && (
                        <div className="flex items-center space-x-3">
                          <Target className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Target Market</p>
                            <p className="font-medium">{lead.targetMarket}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Interested Products */}
                {lead.interestedProducts && lead.interestedProducts.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Interested Products</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lead.interestedProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{product.product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.product.sku}</p>
                            <p className="text-xs text-gray-400">
                              Interest Level: {product.interestLevel}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Business Profile */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Business Profile</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Business Name</p>
                        <p className="font-medium">{companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">{lead.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Years in Business</p>
                        <p className="font-medium">{lead.yearsInBusiness || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Target Market</p>
                        <p className="font-medium">{lead.targetMarket || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Primary Territory</p>
                        <p className="font-medium">{lead.territory || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{lead.experience || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investment Capacity</p>
                        <p className="font-medium text-lg">
                          {lead.investmentCapacity || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sales Volume</p>
                        <p className="font-medium text-lg">
                          {lead.expectedVolume ? `GHS ${lead.expectedVolume.toLocaleString()}/month` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Notes */}
                {lead.notes && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Notes</span>
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{lead.notes}</p>
                  </Card>
                )}
              </div>
            )}


            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Uploaded Documents</h3>
                  <div className="text-sm text-gray-500">
                    {lead.images ? lead.images.length : 0} documents uploaded
                  </div>
                </div>
                
                {lead.images && lead.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lead.images.map((image: DistributorLeadImage) => (
                      <Card key={image.id} className="p-6">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                            {image.imageType === 'PROFILE_PICTURE' || image.imageType === 'BUSINESS_PREMISES' ? (
                              <img
                                src={image.filePath}
                                alt={image.originalName}
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-blue-600" />
                            )}
                          </div>
                          <h4 className="font-medium mb-2 text-sm">
                            {image.imageType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">{image.originalName}</p>
                          <p className="text-xs text-gray-400 mb-3">
                            {(image.fileSize / 1024).toFixed(1)} KB • {new Date(image.uploadedAt).toLocaleDateString()}
                          </p>
                          <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Open image in a modal or new tab
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>${image.originalName}</title></head>
                              <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                                <img src="${image.filePath}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" alt="${image.originalName}" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = image.filePath;
                                link.download = image.originalName;
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
                    <p className="text-gray-500">This distributor lead hasn't uploaded any documents yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                  <div className="space-y-4">
                    {/* Application Submitted */}
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Application Submitted</p>
                        <p className="text-xs text-gray-500">Submitted by {contactPerson} on {new Date(applicationDate).toLocaleDateString()} at {new Date(applicationDate).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {/* Documents Uploaded */}
                    {lead.images && lead.images.length > 0 && (
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Documents Uploaded</p>
                          <p className="text-xs text-gray-500">{lead.images.length} document(s) uploaded for review</p>
                        </div>
                      </div>
                    )}

                    {/* Status Changes */}
                    {status === 'UNDER_REVIEW' && (
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Application Under Review</p>
                          <p className="text-xs text-gray-500">Status changed to Under Review</p>
                        </div>
                      </div>
                    )}

                    {status === 'APPROVED' && (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Application Under Review</p>
                            <p className="text-xs text-gray-500">Status changed to Under Review</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Application Approved</p>
                            <p className="text-xs text-gray-500">Status changed to Approved</p>
                          </div>
                        </div>
                      </>
                    )}

                    {status === 'REJECTED' && (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Application Under Review</p>
                            <p className="text-xs text-gray-500">Status changed to Under Review</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Application Rejected</p>
                            <p className="text-xs text-gray-500">Status changed to Rejected</p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Recent Activities */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Recent Activities</h4>
                        {generateActivities().length > 4 && (
                          <button
                            onClick={() => setShowAllActivities(!showAllActivities)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {showAllActivities ? 'Show Less' : 'View All'}
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {getDisplayActivities().map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.description}</p>
                              <p className="text-xs text-gray-400">{getTimeAgo(activity.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                        
                        {getDisplayActivities().length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">No recent activities</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* SMS Modal */}
      {lead && (
        <AddLeadSMSModal
          isOpen={showSMSModal}
          onClose={() => setShowSMSModal(false)}
          onSave={handleSMSSend}
          leadId={lead.id}
          leadName={`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.businessName || 'Distributor Lead'}
          leadPhone={lead.phone}
        />
      )}

      {/* Email Modal */}
      {lead && (
        <AddLeadEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSave={handleEmailSend}
          leadId={lead.id}
          leadName={`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.businessName || 'Distributor Lead'}
          leadEmail={lead.email}
        />
      )}
    </>
  );
}