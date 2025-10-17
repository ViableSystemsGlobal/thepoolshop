'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  Users,
  MessageSquare,
  Calendar,
  ArrowLeft
} from 'lucide-react';

interface SmsMessage {
  id: string;
  recipient: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  cost?: number;
  provider?: string;
  isBulk: boolean;
  campaignId?: string;
  user: {
    name: string;
  };
  createdAt: string;
}

interface SmsCampaign {
  id: string;
  name: string;
  message: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalSent: number;
  totalFailed: number;
  sentAt?: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export default function SmsHistoryPage() {
  const { themeColor, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { data: session } = useSession();
  const { success: showSuccess, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'messages' | 'campaigns'>('messages');
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadSmsHistory();
  }, []);

  const loadSmsHistory = async () => {
    try {
      setIsLoading(true);
      const [messagesResponse, campaignsResponse] = await Promise.all([
        fetch('/api/communication/sms/history'),
        fetch('/api/communication/sms/campaigns')
      ]);

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      }

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading SMS history:', error);
      showError('Failed to load SMS history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SENDING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.recipient.includes(searchTerm) || 
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

  const totalCampaignPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const campaignStartIndex = (currentPage - 1) * itemsPerPage;
  const campaignEndIndex = campaignStartIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(campaignStartIndex, campaignEndIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.location.href = '/communication/sms'}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to SMS
            </Button>
            <div>
              <h1 className="text-2xl font-bold">SMS History</h1>
              <p className="text-gray-600">View all sent SMS messages and campaigns</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Individual Messages ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Campaigns ({campaigns.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search messages or campaigns..."
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="SENT">Sent</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="SENDING">Sending</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Individual SMS Messages</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No SMS messages found</p>
                <p className="text-sm">Start sending SMS messages to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(message.status)}
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                          {message.isBulk && (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Bulk
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Recipient</p>
                            <p className="text-sm text-gray-600">{message.recipient}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sent By</p>
                            <p className="text-sm text-gray-600">{message.user.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sent At</p>
                            <p className="text-sm text-gray-600">
                              {message.sentAt ? formatDate(message.sentAt) : formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-900">Message</p>
                          <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination for Messages */}
            {filteredMessages.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredMessages.length)} of {filteredMessages.length} messages
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">SMS Campaigns</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No SMS campaigns found</p>
                <p className="text-sm">Create bulk SMS campaigns to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getCampaignStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">{campaign.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Created By</p>
                            <p className="text-sm text-gray-600">{campaign.user.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sent</p>
                            <p className="text-sm text-gray-600">{campaign.totalSent}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Failed</p>
                            <p className="text-sm text-gray-600">{campaign.totalFailed}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Created At</p>
                            <p className="text-sm text-gray-600">{formatDate(campaign.createdAt)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Message Preview</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {campaign.message.length > 100 
                              ? `${campaign.message.substring(0, 100)}...` 
                              : campaign.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination for Campaigns */}
            {filteredCampaigns.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing {campaignStartIndex + 1} to {Math.min(campaignEndIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalCampaignPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalCampaignPages))}
                    disabled={currentPage === totalCampaignPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
