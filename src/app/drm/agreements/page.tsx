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
  FileText,
  Download,
  Calendar,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  FileCheck,
  FileX,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface Agreement {
  id: string;
  agreementNumber: string;
  distributorId: string;
  distributorName: string;
  type: 'DISTRIBUTION' | 'EXCLUSIVE' | 'NON_EXCLUSIVE' | 'TERRITORY';
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
  startDate: string;
  endDate: string;
  commissionRate: number;
  minimumVolume: number;
  territory: string;
  terms: string[];
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  lastModified: string;
  createdBy: string;
}

export default function AgreementsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const { success, error } = useToast();

  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // AI Recommendations for Agreements
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Contract Renewals Due',
      description: '3 agreements expire within 30 days',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Review Performance Clauses',
      description: 'Update terms for 2 underperforming distributors',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Legal Review Needed',
      description: '2 new agreements require legal approval',
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
    const mockAgreements: Agreement[] = [
      {
        id: '1',
        agreementNumber: 'AGR-2024-001',
        distributorId: '1',
        distributorName: 'Ghana Distribution Ltd',
        type: 'EXCLUSIVE',
        status: 'ACTIVE',
        startDate: '2023-06-15',
        endDate: '2024-06-15',
        commissionRate: 12,
        minimumVolume: 100000,
        territory: 'Greater Accra',
        terms: [
          'Exclusive distribution rights for Greater Accra',
          'Minimum monthly volume of 100,000 units',
          '12% commission on all sales',
          'Quarterly performance reviews'
        ],
        documents: [
          {
            id: '1',
            name: 'Distribution Agreement - Ghana Distribution Ltd.pdf',
            type: 'PDF',
            url: '/documents/agreement-1.pdf',
            uploadedAt: '2023-06-15'
          }
        ],
        lastModified: '2023-06-15',
        createdBy: 'Legal Team'
      },
      {
        id: '2',
        agreementNumber: 'AGR-2024-002',
        distributorId: '2',
        distributorName: 'West Africa Logistics',
        type: 'NON_EXCLUSIVE',
        status: 'ACTIVE',
        startDate: '2023-08-20',
        endDate: '2024-08-20',
        commissionRate: 10,
        minimumVolume: 80000,
        territory: 'Ashanti Region',
        terms: [
          'Non-exclusive distribution rights for Ashanti Region',
          'Minimum monthly volume of 80,000 units',
          '10% commission on all sales',
          'Monthly performance reports'
        ],
        documents: [
          {
            id: '2',
            name: 'Distribution Agreement - West Africa Logistics.pdf',
            type: 'PDF',
            url: '/documents/agreement-2.pdf',
            uploadedAt: '2023-08-20'
          }
        ],
        lastModified: '2023-08-20',
        createdBy: 'Legal Team'
      },
      {
        id: '3',
        agreementNumber: 'AGR-2024-003',
        distributorId: '3',
        distributorName: 'Northern Distributors',
        type: 'TERRITORY',
        status: 'PENDING',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        commissionRate: 8,
        minimumVolume: 40000,
        territory: 'Northern Region',
        terms: [
          'Territory-based distribution rights',
          'Minimum monthly volume of 40,000 units',
          '8% commission on all sales',
          'Bi-annual performance reviews'
        ],
        documents: [],
        lastModified: '2023-12-15',
        createdBy: 'Legal Team'
      }
    ];
    
    setAgreements(mockAgreements);
    setLoading(false);
  }, []);

  const statusOptions = [
    { key: 'ALL', label: 'All Agreements', color: 'bg-gray-100 text-gray-800' },
    { key: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { key: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
    { key: 'EXPIRED', label: 'Expired', color: 'bg-red-100 text-red-800' },
    { key: 'TERMINATED', label: 'Terminated', color: 'bg-red-100 text-red-800' },
    { key: 'RENEWED', label: 'Renewed', color: 'bg-blue-100 text-blue-800' },
  ];

  const typeOptions = [
    { key: 'ALL', label: 'All Types' },
    { key: 'DISTRIBUTION', label: 'Distribution' },
    { key: 'EXCLUSIVE', label: 'Exclusive' },
    { key: 'NON_EXCLUSIVE', label: 'Non-Exclusive' },
    { key: 'TERRITORY', label: 'Territory' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'EXPIRED': return <AlertTriangle className="w-4 h-4" />;
      case 'TERMINATED': return <FileX className="w-4 h-4" />;
      case 'RENEWED': return <RefreshCw className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch = 
      agreement.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.territory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || agreement.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || agreement.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeAgreements = agreements.filter(a => a.status === 'ACTIVE').length;
  const expiringSoon = agreements.filter(a => {
    const days = getDaysUntilExpiry(a.endDate);
    return a.status === 'ACTIVE' && days <= 30 && days > 0;
  }).length;
  const pendingAgreements = agreements.filter(a => a.status === 'PENDING').length;

  if (!session?.user) {
    return <div>Please sign in to access agreements.</div>;
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
              <h1 className="text-3xl font-bold">Agreements</h1>
              <p className="text-gray-600">Manage distributor contracts and legal documents</p>
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
            Create Agreement
          </Button>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Agreements AI"
              subtitle="Smart insights for contract management"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agreements</p>
                <p className="text-xl font-bold text-gray-900">{agreements.length}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl font-bold text-green-600">{activeAgreements}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-xl font-bold text-yellow-600">{expiringSoon}</p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-blue-600">{pendingAgreements}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
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
                  placeholder="Search agreements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status.key} value={status.key}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Agreements Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agreement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distributor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgreements.map((agreement) => {
                  const daysUntilExpiry = getDaysUntilExpiry(agreement.endDate);
                  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                  return (
                    <tr key={agreement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {agreement.agreementNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agreement.territory}
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
                              {agreement.distributorName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {agreement.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.key === agreement.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusIcon(agreement.status)}
                          <span className="ml-1">
                            {statusOptions.find(s => s.key === agreement.status)?.label}
                          </span>
                        </span>
                        {isExpiringSoon && agreement.status === 'ACTIVE' && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Expires in {daysUntilExpiry} days
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(agreement.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(agreement.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {agreement.commissionRate}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Min: ${agreement.minimumVolume.toLocaleString()}
                        </div>
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
                              label: 'Edit',
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {/* TODO: Edit */}
                            },
                            ...(agreement.documents.length > 0 ? [{
                              label: 'Download',
                              icon: <Download className="w-4 h-4" />,
                              onClick: () => {/* TODO: Download */}
                            }] : []),
                            ...(agreement.status === 'ACTIVE' && isExpiringSoon ? [{
                              label: 'Renew',
                              icon: <RefreshCw className="w-4 h-4" />,
                              onClick: () => {/* TODO: Renew */}
                            }] : [])
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
    </MainLayout>
  );
}
