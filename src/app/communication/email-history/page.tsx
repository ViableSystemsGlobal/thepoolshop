'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Mail, Search, Check, X, Clock, Filter, Download, ArrowLeft, Users, MessageSquare } from 'lucide-react';

interface EmailMessage {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt: string;
  errorMessage?: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  recipients: string[];
  subject: string;
  message: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  totalSent: number;
  totalFailed: number;
  sentAt?: string;
  completedAt?: string;
}

export default function EmailHistoryPage() {
  const { data: session } = useSession();
  const { themeColor, getThemeClasses } = useTheme();
  const { success: showSuccess, error: showError } = useToast();
  const themeClasses = getThemeClasses();

  const [emailHistory, setEmailHistory] = useState<EmailMessage[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'campaigns'>('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadEmailHistory();
    loadCampaigns();
  }, []);

  const loadEmailHistory = async () => {
    try {
      const response = await fetch('/api/communication/email/history');
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading email history:', error);
      showError('Failed to load email history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/communication/email/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      showError('Failed to load campaigns');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'DELIVERED':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'FAILED':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCampaignStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'SENDING':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'FAILED':
        return <X className="w-4 h-4 text-red-500" />;
      case 'SCHEDULED':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportToCSV = () => {
    const data = activeTab === 'messages' ? emailHistory : campaigns;
    const headers = activeTab === 'messages' 
      ? ['ID', 'Recipient', 'Subject', 'Status', 'Sent At', 'Error Message']
      : ['ID', 'Name', 'Subject', 'Status', 'Total Sent', 'Total Failed', 'Sent At', 'Completed At'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (activeTab === 'messages') {
          return [
            item.id,
            `"${item.recipient}"`,
            `"${item.subject}"`,
            item.status,
            item.sentAt,
            `"${item.errorMessage || ''}"`
          ].join(',');
        } else {
          return [
            item.id,
            `"${item.name}"`,
            `"${item.subject}"`,
            item.status,
            item.totalSent,
            item.totalFailed,
            item.sentAt || '',
            item.completedAt || ''
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages = emailHistory.filter(message => {
    const matchesSearch = message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
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

  if (isLoading) {
    return (
      <>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.location.href = '/communication/email'}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Email
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Email History</h1>
              <p className="text-gray-600">View all sent emails and campaigns</p>
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
              Individual Messages ({emailHistory.length})
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
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
                {activeTab === 'messages' ? (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="SENT">Sent</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                  </>
                ) : (
                  <>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="SENDING">Sending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </>
                )}
              </select>
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <Card className="p-6">
            <div className="space-y-4">
              {filteredMessages.length > 0 ? (
                paginatedMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(message.status)}
                          <span className="font-medium">{message.recipient}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{message.subject}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">{message.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Sent: {new Date(message.sentAt).toLocaleString()}</span>
                          {message.errorMessage && (
                            <span className="text-red-500">Error: {message.errorMessage}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        message.status === 'SENT' ? 'bg-green-100 text-green-800' :
                        message.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                        message.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No email messages found</p>
                </div>
              )}
            </div>
            
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
            <div className="space-y-4">
              {filteredCampaigns.length > 0 ? (
                paginatedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCampaignStatusIcon(campaign.status)}
                          <span className="font-medium">{campaign.name}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{campaign.subject}</span>
                        </div>
                        {campaign.description && (
                          <p className="text-gray-700 text-sm mb-2">{campaign.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Recipients: {campaign.recipients.length}</span>
                          <span>Sent: {campaign.totalSent}</span>
                          {campaign.totalFailed > 0 && (
                            <span className="text-red-500">Failed: {campaign.totalFailed}</span>
                          )}
                          {campaign.sentAt && (
                            <span>Started: {new Date(campaign.sentAt).toLocaleString()}</span>
                          )}
                          {campaign.completedAt && (
                            <span>Completed: {new Date(campaign.completedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'SENDING' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        campaign.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No email campaigns found</p>
                </div>
              )}
            </div>
            
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