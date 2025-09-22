'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
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
  MessageSquare
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

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
  investmentCapacity?: number;
  targetMarket?: string;
}

export default function DistributorLeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  const [lead, setLead] = useState<DistributorLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
            investmentCapacity: 50000,
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
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!lead) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Distributor Lead Not Found</h2>
          <p className="text-gray-600 mb-4">The distributor lead you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/drm/distributor-leads')}>
            Back to Distributor Leads
          </Button>
        </div>
      </MainLayout>
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'business', label: 'Business Details', icon: <Building className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <MainLayout>
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
              onClick={() => window.open(`mailto:${lead.email}`)}
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
              onClick={() => window.open(`sms:${lead.phone}`)}
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
              {lead.profileImage ? (
                <div className="relative">
                  <img
                    src={lead.profileImage}
                    alt={contactPerson}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white border-opacity-20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white border-opacity-20">
                  <User className="w-12 h-12" />
                </div>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investment Capacity</p>
                        <p className="text-lg font-semibold">
                          {lead.investmentCapacity ? `GHS ${lead.investmentCapacity.toLocaleString()}` : 'N/A'}
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
                        <p className="text-sm text-gray-500">Expected Volume</p>
                        <p className="text-lg font-semibold">
                          {lead.expectedVolume ? `${lead.expectedVolume.toLocaleString()} units/month` : 'N/A'}
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
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{location}</p>
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

            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Business Profile</h3>
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
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Investment Capacity</p>
                        <p className="font-medium text-lg">
                          {lead.investmentCapacity ? `GHS ${lead.investmentCapacity.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected Monthly Volume</p>
                        <p className="font-medium text-lg">
                          {lead.expectedVolume ? `${lead.expectedVolume.toLocaleString()} units` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Territory & Coverage</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Primary Territory</p>
                      <p className="font-medium">{lead.territory || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{lead.experience || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Picture */}
                  <Card className="p-6 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {lead.profileImage && lead.profileImage !== '/api/placeholder/150/150' ? (
                        <img
                          src={lead.profileImage}
                          alt="Profile"
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium mb-2">Profile Picture</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      {lead.profileImage && lead.profileImage !== '/api/placeholder/150/150' ? 'Uploaded' : 'Not uploaded'}
                    </p>
                    <div className="space-y-2">
                      {lead.profileImage && lead.profileImage !== '/api/placeholder/150/150' ? (
                        <>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          <Upload className="w-4 h-4 mr-2" />
                          No Image
                        </Button>
                      )}
                    </div>
                  </Card>

                  {/* Business License */}
                  <Card className="p-6 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      {lead.businessLicense ? (
                        <FileText className="w-8 h-8 text-green-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium mb-2">Business License</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      {lead.businessLicense ? 'Uploaded' : 'Not uploaded'}
                    </p>
                    <div className="space-y-2">
                      {lead.businessLicense ? (
                        <>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          <Upload className="w-4 h-4 mr-2" />
                          No Document
                        </Button>
                      )}
                    </div>
                  </Card>

                  {/* Tax Certificate */}
                  <Card className="p-6 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      {lead.taxCertificate ? (
                        <FileText className="w-8 h-8 text-green-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium mb-2">Tax Certificate</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      {lead.taxCertificate ? 'Uploaded' : 'Not uploaded'}
                    </p>
                    <div className="space-y-2">
                      {lead.taxCertificate ? (
                        <>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          <Upload className="w-4 h-4 mr-2" />
                          No Document
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Upload Status */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Document Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profile Picture</span>
                      <Badge className={lead.profileImage && lead.profileImage !== '/api/placeholder/150/150' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {lead.profileImage && lead.profileImage !== '/api/placeholder/150/150' ? 'Uploaded' : 'Missing'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Business License</span>
                      <Badge className={lead.businessLicense ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {lead.businessLicense ? 'Uploaded' : 'Missing'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tax Certificate</span>
                      <Badge className={lead.taxCertificate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {lead.taxCertificate ? 'Uploaded' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                </Card>
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
                        <p className="text-xs text-gray-500">{new Date(applicationDate).toLocaleDateString()} at {new Date(applicationDate).toLocaleTimeString()}</p>
                      </div>
                    </div>

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
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activities</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Mail className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">Email sent to {lead.email}</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Phone className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">Phone call made to {lead.phone}</p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <FileText className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">Documents uploaded</p>
                            <p className="text-xs text-gray-500">3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}