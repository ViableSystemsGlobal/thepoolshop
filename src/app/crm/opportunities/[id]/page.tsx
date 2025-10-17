'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, Calendar, User, Clock, CheckCircle, AlertCircle, XCircle, Play, Link, Tag, TrendingUp, Users, MessageSquare, FileText, Video, PhoneCall, Star, Target, Plus, Activity, History, DollarSign, UserPlus, FileBarChart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { AddLeadTaskModal } from '@/components/modals/add-lead-task-modal';
import { AddLeadCommentModal } from '@/components/modals/add-lead-comment-modal';
import { AddLeadFileModal } from '@/components/modals/add-lead-file-modal';
import { AddLeadEmailModal } from '@/components/modals/add-lead-email-modal';
import { AddLeadSMSModal } from '@/components/modals/add-lead-sms-modal';
import AddLeadProductModal from '@/components/modals/add-lead-product-modal';
import AddLeadUserModal from '@/components/modals/add-lead-user-modal';
import AddLeadMeetingModal from '@/components/modals/add-lead-meeting-modal';
import TaskSlideout from '@/components/task-slideout';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
}

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  value?: number;
  probability?: number;
  closeDate?: string;
  wonDate?: string;
  lostReason?: string;
  accountId?: string;
  leadId?: string;
  ownerId: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  account?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  quotations?: Array<{
    id: string;
    number: string;
    subject: string;
    status: string;
    total: number;
    createdAt: string;
    lines: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      product: {
        id: string;
        name: string;
        sku: string;
      };
    }>;
  }>;
  products?: Array<{
    id: string;
    product: Product;
    quantity: number;
    notes?: string;
    interestLevel: string;
    addedBy: string;
    createdAt: string;
  }>;
}

export default function OpportunityDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showAddSMSModal, setShowAddSMSModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [smsHistory, setSmsHistory] = useState<any[]>([]);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [metrics, setMetrics] = useState({
    totalInteractions: 0,
    conversionProbability: 0,
    lastActivity: 'Never'
  });
  const [currency, setCurrency] = useState('GHS');
  const [baseCurrency, setBaseCurrency] = useState('GHS');
  const [availableCurrencies, setAvailableCurrencies] = useState<any[]>([]);
  
  // Simple currency conversion rates (hardcoded for now)
  const exchangeRates: Record<string, Record<string, number>> = {
    'GHS': { 'USD': 0.08, 'EUR': 0.07, 'GBP': 0.06 },
    'USD': { 'GHS': 12.5, 'EUR': 0.85, 'GBP': 0.75 },
    'EUR': { 'GHS': 14.7, 'USD': 1.18, 'GBP': 0.88 },
    'GBP': { 'GHS': 16.7, 'USD': 1.33, 'EUR': 1.14 }
  };
  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Follow up on opportunity',
      description: 'This opportunity needs attention. Schedule a follow-up call.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Send proposal',
      description: 'Prepare and send a detailed proposal to move forward.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Close the deal',
      description: 'High probability opportunity - focus on closing this month.',
      priority: 'high' as const,
      completed: false,
    },
  ]);

  // Pipeline stages configuration
  const pipelineStages = [
    { key: 'NEW_OPPORTUNITY', label: 'New Opportunity', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { key: 'QUOTE_SENT', label: 'Quote Sent', color: 'bg-yellow-100 text-yellow-800', icon: FileBarChart },
    { key: 'QUOTE_REVIEWED', label: 'Quote Reviewed', color: 'bg-orange-100 text-orange-800', icon: Eye },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-100 text-purple-800', icon: Users },
    { key: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { key: 'CONTRACT_SENT', label: 'Contract Sent', color: 'bg-indigo-100 text-indigo-800', icon: FileBarChart },
    { key: 'CONTRACT_SIGNED', label: 'Contract Signed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    { key: 'WON', label: 'Won', color: 'bg-green-100 text-green-800', icon: Target },
    { key: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800', icon: XCircle },
  ];

  useEffect(() => {
    console.log('🔍 Frontend session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      paramsId: params.id,
      sessionUser: session?.user 
    });
    if (params.id) {
      // Always try to fetch - let the API handle auth
      fetchOpportunity();
    }
  }, [session, params.id]);

  // Fetch related data after opportunity is loaded
  useEffect(() => {
    if (opportunity?.id) {
      fetchOpportunityData();
    }
  }, [opportunity?.id]);

  // Fetch currency settings
  useEffect(() => {
    fetchCurrencySettings();
  }, []);

  const fetchCurrencySettings = async () => {
    try {
      const response = await fetch('/api/settings/currency');
      if (response.ok) {
        const data = await response.json();
        setBaseCurrency(data.baseCurrency || 'GHS');
        setAvailableCurrencies(data.currencies || []);
        
        // Set initial currency to base currency
        if (!currency || currency === 'GHS') {
          setCurrency(data.baseCurrency || 'GHS');
        }
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
    }
  };

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/opportunities/${params.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Opportunity data received:', {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          quotationsCount: data.quotations?.length || 0,
          productsCount: data.products?.length || 0,
          quotations: data.quotations,
          products: data.products
        });
        setOpportunity(data);
        updateMetrics(data);
      } else {
        console.error('Failed to fetch opportunity');
        error('Failed to load opportunity details');
      }
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      error('Failed to load opportunity details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunityData = async () => {
    if (!opportunity?.id) return;

    try {
      // Fetch email history
      const emailResponse = await fetch(`/api/lead-emails?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        setEmailHistory(emailData.emails || []);
      }

      // Fetch SMS history
      const smsResponse = await fetch(`/api/lead-sms?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (smsResponse.ok) {
        const smsData = await smsResponse.json();
        setSmsHistory(smsData.sms || []);
      }

      // Fetch tasks
      const tasksResponse = await fetch(`/api/lead-tasks?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/lead-comments?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }

      // Fetch files
      const filesResponse = await fetch(`/api/lead-files?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setFiles(filesData.files || []);
      }

      // Fetch meetings
      const meetingsResponse = await fetch(`/api/lead-meetings?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json();
        setMeetings(meetingsData.meetings || []);
      }

      // Products are already included in the opportunity object
      if (opportunity.products) {
        console.log('🔍 Setting products from opportunity:', opportunity.products);
        setProducts(opportunity.products || []);
      } else {
        console.log('🔍 No products found in opportunity object');
      }

      // Fetch assigned users
      const usersResponse = await fetch(`/api/lead-users?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setAssignedUsers(usersData.users || []);
      }

      // Fetch activities
      const activitiesResponse = await fetch(`/api/lead-activities?leadId=${opportunity.id}`, {
        credentials: 'include',
      });
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities || []);
      }
    } catch (err) {
      console.error('Error fetching opportunity data:', err);
    }
  };

  const updateMetrics = (opp: Opportunity) => {
    if (!opp) return;
    
    // Calculate metrics based on opportunity data
    const totalInteractions = 0; // This would be calculated from activities
    const conversionProbability = opp.probability || 0;
    const lastActivity = opp.updatedAt ? new Date(opp.updatedAt).toLocaleDateString() : 'No activity';
    
    setMetrics({
      totalInteractions,
      conversionProbability,
      lastActivity,
    });
  };

  const formatCurrencyAmount = (amount?: number) => {
    if (!amount) return `${currency} 0`;
    
    // Convert from base currency to selected currency
    let convertedAmount = amount;
    if (baseCurrency !== currency) {
      const rate = exchangeRates[baseCurrency]?.[currency];
      if (rate) {
        convertedAmount = amount * rate;
      }
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(convertedAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageInfo = (status: string) => {
    return pipelineStages.find(stage => stage.key === status) || pipelineStages[0];
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success('Recommendation completed! Great job!');
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  const handleAddEmail = async (emailData: any) => {
    try {
      const response = await fetch('/api/lead-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        success('Email sent successfully!');
        // Refresh email history
        const emailResponse = await fetch(`/api/lead-emails?leadId=${opportunity?.id}`, {
          credentials: 'include',
        });
        if (emailResponse.ok) {
          const data = await emailResponse.json();
          setEmailHistory(data.emails || []);
        }
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      error('Failed to send email');
    }
  };

  const handleAddSMS = async (smsData: any) => {
    try {
      const response = await fetch('/api/lead-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(smsData),
      });

      if (response.ok) {
        success('SMS sent successfully!');
        // Refresh SMS history
        const smsResponse = await fetch(`/api/lead-sms?leadId=${opportunity?.id}`, {
          credentials: 'include',
        });
        if (smsResponse.ok) {
          const data = await smsResponse.json();
          setSmsHistory(data.sms || []);
        }
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to send SMS');
      }
    } catch (err) {
      error('Failed to send SMS');
    }
  };

  const handleDelete = async () => {
    if (!opportunity) return;

    const hasQuotes = opportunity.quotations && opportunity.quotations.length > 0;
    const confirmMessage = hasQuotes 
      ? 'This opportunity has quotations that will be unlinked. Are you sure you want to delete this opportunity? This action cannot be undone.'
      : 'Are you sure you want to delete this opportunity? This action cannot be undone.';
    
    // Show confirmation modal
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Opportunity',
      message: confirmMessage,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/opportunities/${opportunity.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            success('Opportunity deleted successfully');
            router.push('/crm/opportunities');
          } else {
            const data = await response.json();
            error(data.error || 'Failed to delete opportunity');
          }
        } catch (err) {
          console.error('Error deleting opportunity:', err);
          error('Failed to delete opportunity');
        } finally {
          setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  // Remove session check - let API handle authentication
  // The API is working fine, session exists on server side

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!opportunity) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Opportunity not found.</p>
        </div>
      </>
    );
  }

  const stageInfo = getStageInfo(opportunity.status);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/crm/opportunities')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Opportunities
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {opportunity.firstName} {opportunity.lastName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {opportunity.subject || 'No Subject'}
                </p>
                
                {/* Contact Information */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  {opportunity.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{opportunity.email}</span>
                    </div>
                  )}
                  {opportunity.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{opportunity.phone}</span>
                    </div>
                  )}
                  {opportunity.company && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{opportunity.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Currency Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {availableCurrencies.length > 0 ? (
                    availableCurrencies.map((curr) => (
                      <option key={curr.id} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="GHS">GHS - Ghana Cedi</option>
                      <option value="USD">USD - US Dollar</option>
                    </>
                  )}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => console.log('Edit opportunity')}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                onClick={() => router.push(`/quotations/create?leadId=${opportunity.id}&leadName=${encodeURIComponent(`${opportunity.firstName} ${opportunity.lastName}`)}&leadEmail=${opportunity.email || ''}&leadPhone=${opportunity.phone || ''}&leadCompany=${opportunity.company || ''}`)}
              >
                <FileBarChart className="w-4 h-4" />
                Create Quote
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Opportunity Intelligence"
              subtitle="AI-powered insights for this opportunity"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card key="deal-value" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deal Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrencyAmount(opportunity.dealValue || 0)}
                </p>
              </div>
                <div className="p-2 rounded-full bg-green-100">
                  <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
            <Card key="win-probability" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Probability</p>
                <p className="text-2xl font-bold text-gray-900">{opportunity.probability || 0}%</p>
              </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
            <Card key="interactions" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Interactions</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalInteractions}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <MessageSquare className={`w-5 h-5 text-${theme.primary}`} />
              </div>
            </div>
          </Card>
          
            <Card key="last-activity" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Activity</p>
                <p className="text-lg font-bold text-gray-900">
                    {metrics.lastActivity}
                </p>
              </div>
                <div className="p-2 rounded-full bg-orange-100">
                  <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card>
          </div>
        </div>
          
        {/* Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Tasks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddTaskModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                  </span>
                </div>
              </div>
                    {task.dueDate && (
                      <div className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
              </div>
                    )}
            </div>
                ))}
                {tasks.length > 3 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    +{tasks.length - 3} more tasks
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks assigned</p>
              </div>
            )}
          </Card>

          {/* Products */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddProductModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
        </div>
            {products.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-blue-900">{product.product?.name || 'Unknown Product'}</h4>
                        {product.source === 'lead_creation' && (
                          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            Original
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.interestLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                        product.interestLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.interestLevel}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">Qty: {product.quantity}</p>
                    {product.notes && (
                      <p className="text-xs text-gray-600 mt-1">{product.notes}</p>
                    )}
                  </div>
                ))}
                {products.length > 3 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    +{products.length - 3} more products
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products interested</p>
              </div>
            )}
          </Card>
          
          {/* Quotations */}
            <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quotations</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/quotations/create?leadId=${opportunity.id}&leadName=${encodeURIComponent(`${opportunity.firstName} ${opportunity.lastName}`)}&leadEmail=${opportunity.email || ''}&leadPhone=${opportunity.phone || ''}&leadCompany=${opportunity.company || ''}`)}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                New Quote
              </Button>
                </div>
            
            {(() => {
              console.log('🔍 Rendering quotations section:', {
                hasQuotations: !!opportunity.quotations,
                quotationsLength: opportunity.quotations?.length || 0,
                quotations: opportunity.quotations
              });
              return opportunity.quotations && opportunity.quotations.length > 0;
            })() ? (
              <div className="space-y-3">
                {opportunity.quotations?.map((quotation) => (
                  <div key={quotation.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/quotations/${quotation.id}`)}>
            <div className="flex items-center justify-between">
                <div>
                        <h4 className="font-medium text-gray-900 text-sm">{quotation.number}</h4>
                        <p className="text-xs text-gray-600">{quotation.subject}</p>
                </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrencyAmount(quotation.total)}</p>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          quotation.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          quotation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          quotation.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quotation.status}
                  </span>
                </div>
                </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {quotation.lines.length} item(s) • {formatDate(quotation.createdAt)}
                </div>
                </div>
                ))}
                </div>
            ) : (
              <div className="text-center py-8">
                <FileBarChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No quotations yet</p>
              </div>
            )}
          </Card>

          {/* Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Users</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddUserModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {assignedUsers.length > 0 ? (
              <div className="space-y-3">
                {assignedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.role && (
                        <p className="text-xs text-blue-600">{user.role}</p>
                      )}
                </div>
              </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users assigned</p>
              </div>
            )}
            </Card>

          {/* Sources */}
              <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sources</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  success('Add Source clicked! (Feature coming soon)');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
                </div>
            {(opportunity.source || (Array.isArray(sources) && sources.length > 0)) ? (
              <div className="space-y-2">
                {/* Opportunity's primary source */}
                {opportunity.source && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{opportunity.source}</span>
                </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Primary</span>
                </div>
                )}
                
                {/* Additional sources */}
                {Array.isArray(sources) && sources.slice(0, opportunity.source ? 2 : 3).map((source: any) => (
                  <div key={source.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{source.name}</span>
                </div>
                    <span className="text-xs text-gray-500">{source.category}</span>
                </div>
                ))}
                
                {Array.isArray(sources) && (sources.length > (opportunity.source ? 2 : 3)) && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    +{sources.length - (opportunity.source ? 2 : 3)} more sources
                  </p>
                )}
                </div>
            ) : (
              <div className="text-center py-8">
                <Link className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No sources assigned</p>
              </div>
            )}
          </Card>

          {/* Emails */}
                <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Emails</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddEmailModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {emailHistory && emailHistory.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {emailHistory.map((email) => (
                  <div key={email.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{email.subject}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{email.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            email.status === 'SENT' ? 'bg-green-100 text-green-800' :
                            email.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            email.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {email.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {email.sentAt ? new Date(email.sentAt).toLocaleDateString() : 'Not sent'}
                          </span>
                        </div>
                      </div>
                    </div>
                      </div>
                    ))}
                  </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No emails sent</p>
          </div>
            )}
                </Card>

          {/* SMS */}
            <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">SMS</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddSMSModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {smsHistory && smsHistory.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {smsHistory.map((sms) => (
                  <div key={sms.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{sms.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            sms.status === 'SENT' ? 'bg-green-100 text-green-800' :
                            sms.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            sms.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sms.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {sms.sentAt ? new Date(sms.sentAt).toLocaleDateString() : 'Not sent'}
                          </span>
                          <span className="text-xs text-gray-500">
                            To: {sms.to}
                  </span>
                </div>
                </div>
                </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No SMS sent</p>
              </div>
            )}
            </Card>

          {/* Comments */}
            <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <Button
                  variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddCommentModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                </Button>
            </div>
            {comments.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.createdByUser?.name || 'Unknown User'}
                        </span>
                        {comment.isInternal && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Internal
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No comments</p>
              </div>
            )}
          </Card>

          {/* Files */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Files</h3>
                <Button
                  variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddFileModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                </Button>
            </div>
            {files.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {file.fileName}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {file.category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {file.description && (
                      <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {file.uploadedByUser?.name || 'Unknown User'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                <Button
                  variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => window.open(file.filePath, '_blank')}
                >
                          Download
                </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No files attached</p>
              </div>
            )}
          </Card>

          {/* Meetings & Calls */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Meetings & Calls</h3>
                <Button
                  variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddMeetingModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                </Button>
              </div>
            {meetings.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {meetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        meeting.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        meeting.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{meeting.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(meeting.scheduledAt).toLocaleDateString()} at {new Date(meeting.scheduledAt).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">Duration: {meeting.duration} minutes</p>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
                    )}
                  </div>
                ))}
                {meetings.length > 3 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    +{meetings.length - 3} more meetings
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No meetings scheduled</p>
              </div>
            )}
            </Card>
          </div>

        {/* Activity Timeline */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                <Activity className={`w-5 h-5 text-${theme.primary}`} />
        </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                <p className="text-sm text-gray-600">
                  Track the opportunity's journey from creation to closing
                  {activities.length > 0 && (
                    <span className="ml-2 text-blue-600">({activities.length} activities)</span>
                  )}
                </p>
      </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAllActivities(!showAllActivities)}
            >
              {showAllActivities ? 'Show Less' : 'Show All'}
            </Button>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-4">
              {(showAllActivities ? activities : activities.slice(0, 5)).map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'CREATED' ? 'bg-green-100 text-green-600' :
                    activity.type === 'UPDATED' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'EMAIL' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'CALL' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'CREATED' ? <Plus className="w-4 h-4" /> :
                     activity.type === 'UPDATED' ? <Edit className="w-4 h-4" /> :
                     activity.type === 'EMAIL' ? <Mail className="w-4 h-4" /> :
                     activity.type === 'CALL' ? <Phone className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                      {activity.user && (
                        <span className="text-xs text-blue-600">
                          by {activity.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h4>
              <p className="text-gray-500">Activities will appear here as you interact with this opportunity.</p>
        </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      {showAddTaskModal && (
        <AddLeadTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          onSave={(task) => {
            setTasks(prev => [...prev, task]);
            success('Task added successfully!');
          }}
        />
      )}

      {showAddCommentModal && (
        <AddLeadCommentModal
          isOpen={showAddCommentModal}
          onClose={() => setShowAddCommentModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          onSave={(comment) => {
            setComments(prev => [...prev, comment]);
            success('Comment added successfully!');
          }}
        />
      )}

      {showAddFileModal && (
        <AddLeadFileModal
          isOpen={showAddFileModal}
          onClose={() => setShowAddFileModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          onSave={(file) => {
            setFiles(prev => [...prev, file]);
            success('File uploaded successfully!');
          }}
        />
      )}

      {showAddEmailModal && (
        <AddLeadEmailModal
          isOpen={showAddEmailModal}
          onClose={() => setShowAddEmailModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          leadEmail={opportunity.email || ''}
          onSave={handleAddEmail}
        />
      )}

      {showAddSMSModal && (
        <AddLeadSMSModal
          isOpen={showAddSMSModal}
          onClose={() => setShowAddSMSModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          leadPhone={opportunity.phone}
          onSave={handleAddSMS}
        />
      )}

      {showAddProductModal && (
        <AddLeadProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          onSave={(product) => {
            setProducts(prev => [...prev, product]);
            success('Product added successfully!');
          }}
        />
      )}

      {showAddUserModal && (
        <AddLeadUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          onSave={(user) => {
            setAssignedUsers(prev => [...prev, user]);
            success('User assigned successfully!');
          }}
        />
      )}

      {showAddMeetingModal && (
        <AddLeadMeetingModal
          isOpen={showAddMeetingModal}
          onClose={() => setShowAddMeetingModal(false)}
          leadId={opportunity.id}
          leadName={`${opportunity.firstName} ${opportunity.lastName}`}
          onSave={(meeting) => {
            setMeetings(prev => [...prev, meeting]);
            success('Meeting scheduled successfully!');
          }}
        />
      )}

      {/* Task Slideout */}
      {selectedTask && (
        <TaskSlideout
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
      />
    </>
  );
}