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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Megaphone,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  ArrowLeft,
  Send,
  FileText,
  Video,
  PhoneCall,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Target
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';

interface EngagementActivity {
  id: string;
  type: 'EMAIL' | 'SMS' | 'CALL' | 'MEETING' | 'TRAINING' | 'SURVEY' | 'CAMPAIGN';
  title: string;
  description: string;
  distributorId: string;
  distributorName: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  completedDate?: string;
  createdBy: string;
  participants: string[];
  outcome?: string;
  satisfaction?: number; // 1-5 rating
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

interface EngagementCampaign {
  id: string;
  name: string;
  type: 'PRODUCT_LAUNCH' | 'TRAINING' | 'PERFORMANCE' | 'SEASONAL' | 'GENERAL';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  targetDistributors: string[];
  activities: string[];
  metrics: {
    totalSent: number;
    opened: number;
    responded: number;
    satisfaction: number;
  };
}

export default function EngagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const { success, error } = useToast();

  const [activities, setActivities] = useState<EngagementActivity[]>([]);
  const [campaigns, setCampaigns] = useState<EngagementCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'activities' | 'campaigns'>('activities');

  // AI Recommendations for Engagement
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Follow-up Required',
      description: '5 activities need follow-up actions',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Campaign Performance Review',
      description: 'Review 2 campaigns with low engagement rates',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Schedule Training Sessions',
      description: 'Plan training for 3 distributors this week',
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
    const mockActivities: EngagementActivity[] = [
      {
        id: '1',
        type: 'MEETING',
        title: 'Q1 Performance Review',
        description: 'Quarterly performance review meeting with Ghana Distribution Ltd',
        distributorId: '1',
        distributorName: 'Ghana Distribution Ltd',
        status: 'COMPLETED',
        scheduledDate: '2024-01-15T10:00:00Z',
        completedDate: '2024-01-15T11:30:00Z',
        createdBy: 'Sales Manager',
        participants: ['Kwame Asante', 'Sales Manager', 'Operations Lead'],
        outcome: 'Performance targets exceeded by 15%. Discussed expansion plans.',
        satisfaction: 5,
        followUpRequired: true,
        followUpDate: '2024-02-15',
        attachments: [
          {
            id: '1',
            name: 'Q1_Performance_Report.pdf',
            type: 'PDF',
            url: '/documents/q1-report.pdf'
          }
        ]
      },
      {
        id: '2',
        type: 'TRAINING',
        title: 'New Product Training Session',
        description: 'Training session on new product line for West Africa Logistics',
        distributorId: '2',
        distributorName: 'West Africa Logistics',
        status: 'IN_PROGRESS',
        scheduledDate: '2024-01-20T14:00:00Z',
        createdBy: 'Product Manager',
        participants: ['Ama Serwaa', 'Product Manager', 'Training Team'],
        followUpRequired: false
      },
      {
        id: '3',
        type: 'CALL',
        title: 'Weekly Check-in Call',
        description: 'Regular weekly check-in with Northern Distributors',
        distributorId: '3',
        distributorName: 'Northern Distributors',
        status: 'PLANNED',
        scheduledDate: '2024-01-22T09:00:00Z',
        createdBy: 'Account Manager',
        participants: ['Ibrahim Mohammed', 'Account Manager'],
        followUpRequired: false
      }
    ];

    const mockCampaigns: EngagementCampaign[] = [
      {
        id: '1',
        name: 'Q1 Product Launch Campaign',
        type: 'PRODUCT_LAUNCH',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        targetDistributors: ['1', '2', '3'],
        activities: ['1', '2'],
        metrics: {
          totalSent: 150,
          opened: 120,
          responded: 95,
          satisfaction: 4.3
        }
      },
      {
        id: '2',
        name: 'Performance Improvement Training',
        type: 'TRAINING',
        status: 'COMPLETED',
        startDate: '2023-12-01',
        endDate: '2023-12-31',
        targetDistributors: ['1', '2'],
        activities: ['1'],
        metrics: {
          totalSent: 50,
          opened: 45,
          responded: 40,
          satisfaction: 4.7
        }
      }
    ];
    
    setActivities(mockActivities);
    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

  const statusOptions = [
    { key: 'ALL', label: 'All Activities', color: 'bg-gray-100 text-gray-800' },
    { key: 'PLANNED', label: 'Planned', color: 'bg-blue-100 text-blue-800' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { key: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const typeOptions = [
    { key: 'ALL', label: 'All Types' },
    { key: 'EMAIL', label: 'Email' },
    { key: 'SMS', label: 'SMS' },
    { key: 'CALL', label: 'Call' },
    { key: 'MEETING', label: 'Meeting' },
    { key: 'TRAINING', label: 'Training' },
    { key: 'SURVEY', label: 'Survey' },
    { key: 'CAMPAIGN', label: 'Campaign' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="w-4 h-4" />;
      case 'SMS': return <MessageSquare className="w-4 h-4" />;
      case 'CALL': return <PhoneCall className="w-4 h-4" />;
      case 'MEETING': return <Users className="w-4 h-4" />;
      case 'TRAINING': return <Target className="w-4 h-4" />;
      case 'SURVEY': return <FileText className="w-4 h-4" />;
      case 'CAMPAIGN': return <Megaphone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <TrendingUp className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || activity.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || activity.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const completedActivities = activities.filter(a => a.status === 'COMPLETED').length;
  const plannedActivities = activities.filter(a => a.status === 'PLANNED').length;
  const averageSatisfaction = activities
    .filter(a => a.satisfaction)
    .reduce((sum, a) => sum + (a.satisfaction || 0), 0) / 
    activities.filter(a => a.satisfaction).length;

  if (!session?.user) {
    return <div>Please sign in to access engagement.</div>;
  }

  return (
    <>
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
              <h1 className="text-3xl font-bold">Engagement</h1>
              <p className="text-gray-600">Track distributor communication and engagement activities</p>
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
            Create Activity
          </Button>
        </div>

        {/* AI Recommendation and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Engagement AI"
              subtitle="Smart insights for distributor engagement"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Stats Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-xl font-bold text-gray-900">{activities.length}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{completedActivities}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-xl font-bold text-blue-600">{plannedActivities}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                <p className="text-xl font-bold text-yellow-600">
                  {averageSatisfaction ? averageSatisfaction.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'activities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Campaigns
          </button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {activeTab === 'activities' && (
                <>
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
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Content */}
        {activeTab === 'activities' ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
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
                      Scheduled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100">
                            {getTypeIcon(activity.type)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.distributorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getTypeIcon(activity.type)}
                          <span className="ml-1">{activity.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.key === activity.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1">
                            {statusOptions.find(s => s.key === activity.status)?.label}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(activity.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.satisfaction ? (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{activity.satisfaction}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
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
                              label: 'Edit',
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {/* TODO: Edit */}
                            },
                            ...(activity.status === 'PLANNED' ? [{
                              label: 'Start Activity',
                              icon: <Send className="w-4 h-4" />,
                              onClick: () => {/* TODO: Start */}
                            }] : []),
                            ...(activity.followUpRequired ? [{
                              label: 'Schedule Follow-up',
                              icon: <Calendar className="w-4 h-4" />,
                              onClick: () => {/* TODO: Follow up */}
                            }] : [])
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Megaphone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium">{new Date(campaign.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">End Date</span>
                    <span className="font-medium">{new Date(campaign.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target Distributors</span>
                    <span className="font-medium">{campaign.targetDistributors.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Campaign Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Sent</p>
                      <p className="font-semibold">{campaign.metrics.totalSent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Response Rate</p>
                      <p className="font-semibold">
                        {((campaign.metrics.responded / campaign.metrics.totalSent) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Open Rate</p>
                      <p className="font-semibold">
                        {((campaign.metrics.opened / campaign.metrics.totalSent) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Satisfaction</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-semibold">{campaign.metrics.satisfaction}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
