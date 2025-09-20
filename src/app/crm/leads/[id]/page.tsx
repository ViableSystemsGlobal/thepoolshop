'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, Calendar, User, Clock, CheckCircle, AlertCircle, XCircle, Play, Link, Tag, TrendingUp, Users, MessageSquare, FileText, Video, PhoneCall, Star, Target, Plus, Activity, History, DollarSign, UserPlus, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { EditLeadModal } from '@/components/modals/edit-lead-modal';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import { MainLayout } from '@/components/layout/main-layout';
import { AddLeadTaskModal } from '@/components/modals/add-lead-task-modal';
import { AddLeadCommentModal } from '@/components/modals/add-lead-comment-modal';
import { AddLeadFileModal } from '@/components/modals/add-lead-file-modal';
import { AddLeadEmailModal } from '@/components/modals/add-lead-email-modal';
import { AddLeadSMSModal } from '@/components/modals/add-lead-sms-modal';
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

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  leadType: 'INDIVIDUAL' | 'COMPANY';
  company?: string;
  subject?: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  assignedTo?: User[];
  interestedProducts?: Product[];
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function LeadDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showAddSMSModal, setShowAddSMSModal] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [smsHistory, setSmsHistory] = useState<any[]>([]);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalInteractions: 0,
    responseRate: 0,
    conversionProbability: 0,
    lastActivity: 'Never'
  });
  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Follow up on recent inquiry',
      description: 'This lead showed interest in pool products 2 days ago. Consider sending a personalized follow-up email.',
      priority: 'high' as const,
      action: 'Send follow-up email',
      completed: false
    },
    {
      id: '2',
      title: 'Schedule product demonstration',
      description: 'Based on their company size and interest, a product demo could accelerate the sales process.',
      priority: 'medium' as const,
      action: 'Schedule demo call',
      completed: false
    }
  ]);

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'lead_created',
      title: 'Lead Created',
      description: 'Lead was created and assigned to the system',
      timestamp: new Date().toISOString(),
      user: 'System',
      icon: UserPlus,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'email_sent',
      title: 'Welcome Email Sent',
      description: 'Initial welcome email sent to the lead',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      user: 'System Administrator',
      icon: Mail,
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'status_changed',
      title: 'Status Updated',
      description: 'Lead status changed from NEW to CONTACTED',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      user: 'System Administrator',
      icon: CheckCircle,
      color: 'bg-yellow-500'
    },
    {
      id: 4,
      type: 'call_scheduled',
      title: 'Call Scheduled',
      description: 'Follow-up call scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      user: 'System Administrator',
      icon: PhoneCall,
      color: 'bg-purple-500'
    }
  ]);

  const [sources, setSources] = useState<any[]>([]);

  const leadId = params.id as string;

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLead();
      fetchSources();
    }
  }, [leadId]);

  useEffect(() => {
    if (lead?.id) {
      fetchTasks();
      fetchSmsHistory();
      fetchEmailHistory();
      fetchComments();
    }
  }, [lead?.id]);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/lead-sources');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setSources(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      setSources([]); // Set empty array on error
    }
  };

  const fetchTasks = async () => {
    if (!lead?.id) return;
    
    try {
      const response = await fetch(`/api/tasks?leadId=${lead.id}`);
      if (response.ok) {
        const data = await response.json();
        // The API returns { tasks: [], pagination: {} }
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]); // Set empty array on error
    }
  };

  const fetchSmsHistory = async () => {
    if (!lead?.id) return;
    
    try {
      const response = await fetch(`/api/lead-sms?leadId=${lead.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSmsHistory(Array.isArray(data.sms) ? data.sms : []);
      }
    } catch (error) {
      console.error('Error fetching SMS history:', error);
      setSmsHistory([]);
    }
  };

  const fetchEmailHistory = async () => {
    if (!lead?.id) return;
    
    try {
      const response = await fetch(`/api/lead-emails?leadId=${lead.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(Array.isArray(data.emails) ? data.emails : []);
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
      setEmailHistory([]);
    }
  };

  const fetchComments = async () => {
    if (!lead?.id) return;
    
    try {
      const response = await fetch(`/api/lead-comments?leadId=${lead.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data.comments) ? data.comments : []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLead(data.lead);
        
        // Calculate metrics based on lead data
        const leadData = data.lead;
        const daysSinceCreated = Math.floor((new Date().getTime() - new Date(leadData.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        setMetrics({
          totalInteractions: leadData.assignedTo?.length || 0,
          responseRate: leadData.status === 'CONTACTED' ? 85 : 0,
          conversionProbability: leadData.status === 'QUALIFIED' ? 75 : leadData.status === 'CONTACTED' ? 45 : 15,
          lastActivity: daysSinceCreated === 0 ? 'Today' : daysSinceCreated === 1 ? 'Yesterday' : `${daysSinceCreated} days ago`
        });
      } else {
        error('Failed to fetch lead details');
        router.push('/crm/leads');
      }
    } catch (err) {
      console.error('Error fetching lead:', err);
      error('Failed to fetch lead details');
      router.push('/crm/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationComplete = (recommendationId: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId ? { ...rec, completed: true } : rec
      )
    );
    success('Recommendation completed successfully!');
  };

  const handleAddTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        success('Task created successfully!');
        // Refresh tasks list
        fetchTasks();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to create task');
      }
    } catch (err) {
      error('Failed to create task');
    }
  };

  const handleAddComment = async (commentData: any) => {
    try {
      const response = await fetch('/api/lead-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        success('Comment added successfully!');
        // Refresh comments list
        fetchComments();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to add comment');
      }
    } catch (err) {
      error('Failed to add comment');
    }
  };

  const handleAddFile = async (fileData: FormData) => {
    try {
      const response = await fetch('/api/lead-files', {
        method: 'POST',
        credentials: 'include',
        body: fileData,
      });

      if (response.ok) {
        success('File uploaded successfully!');
        // TODO: Refresh files list
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to upload file');
      }
    } catch (err) {
      error('Failed to upload file');
    }
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
        fetchEmailHistory();
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
        fetchSmsHistory();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to send SMS');
      }
    } catch (err) {
      error('Failed to send SMS');
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  const handleEditLead = async (leadData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    leadType: 'INDIVIDUAL' | 'COMPANY';
    company?: string;
    subject?: string;
    source?: string;
    status: string;
    assignedTo?: User[];
    interestedProducts?: Product[];
    followUpDate?: string;
    notes?: string;
  }) => {
    if (!lead) return;

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchLead();
        setShowEditModal(false);
        success('Lead updated successfully!');
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to update lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      error('Failed to update lead');
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        success('Lead deleted successfully!');
        router.push('/crm/leads');
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to delete lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      error('Failed to delete lead');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'CONTACTED':
        return <Play className="w-5 h-5 text-yellow-500" />;
      case 'QUALIFIED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CONVERTED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'LOST':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CONVERTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LOST':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading lead details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!lead) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h2>
            <p className="text-gray-600 mb-4">The lead you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push('/crm/leads')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/crm/leads')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Leads
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {lead.firstName} {lead.lastName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {lead.subject || 'No Subject'}
                </p>
                
                {/* Contact Information */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.company && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Implement label functionality
                  console.log('Label clicked');
                }}
              >
                <Tag className="w-4 h-4" />
                Label
              </Button>
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                onClick={() => {
                  // TODO: Implement convert to opportunity functionality
                  console.log('Convert to opportunity clicked');
                }}
              >
                <TrendingUp className="w-4 h-4" />
                Convert to Opportunity
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
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
              title="Lead Intelligence"
              subtitle="AI-powered insights for this lead"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
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
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.responseRate}%</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <Target className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.conversionProbability}%</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <TrendingUp className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Activity</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.lastActivity}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <Clock className={`w-5 h-5 text-${theme.primary}`} />
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
                  success('Add Product clicked! (Feature coming soon)');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {lead.interestedProducts && lead.interestedProducts.length > 0 ? (
              <div className="space-y-2">
                {lead.interestedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">{product.name}</p>
                      {product.sku && (
                        <p className="text-sm text-blue-700">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products interested</p>
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
                  success('Add User clicked! (Feature coming soon)');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {lead.assignedTo && lead.assignedTo.length > 0 ? (
              <div className="space-y-3">
                {lead.assignedTo.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
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
            {(lead.source || (Array.isArray(sources) && sources.length > 0)) ? (
              <div className="space-y-2">
                {/* Lead's primary source */}
                {lead.source && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{lead.source}</span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Primary</span>
                  </div>
                )}
                
                {/* Additional sources */}
                {Array.isArray(sources) && sources.slice(0, lead.source ? 2 : 3).map((source: any) => (
                  <div key={source.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{source.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{source.category}</span>
                  </div>
                ))}
                
                {Array.isArray(sources) && (sources.length > (lead.source ? 2 : 3)) && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    +{sources.length - (lead.source ? 2 : 3)} more sources
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
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No files attached</p>
            </div>
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
                  success('Add Meeting/Call clicked! (Feature coming soon)');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meetings scheduled</p>
            </div>
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
                <p className="text-sm text-gray-600">Track the lead's journey from creation to conversion</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="relative flex items-start gap-4">
                  <div className="relative">
                    <div className={`p-2 rounded-full ${activity.color} text-white`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-0.5 h-8 bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Modals */}
      {showEditModal && lead && (
        <EditLeadModal
          lead={lead}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditLead}
        />
      )}

      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteLead}
          title="Delete Lead"
          message={`Are you sure you want to delete ${lead?.firstName} ${lead?.lastName}? This action cannot be undone.`}
          itemName="lead"
        />
      )}

      {showAddTaskModal && (
        <AddLeadTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSave={handleAddTask}
          leadId={lead?.id || ''}
          leadName={lead ? `${lead.firstName} ${lead.lastName}` : ''}
        />
      )}

      {showAddCommentModal && (
        <AddLeadCommentModal
          isOpen={showAddCommentModal}
          onClose={() => setShowAddCommentModal(false)}
          onSave={handleAddComment}
          leadId={lead?.id || ''}
          leadName={lead ? `${lead.firstName} ${lead.lastName}` : ''}
        />
      )}

      {showAddFileModal && (
        <AddLeadFileModal
          isOpen={showAddFileModal}
          onClose={() => setShowAddFileModal(false)}
          onSave={handleAddFile}
          leadId={lead?.id || ''}
          leadName={lead ? `${lead.firstName} ${lead.lastName}` : ''}
        />
      )}

      {showAddEmailModal && (
        <AddLeadEmailModal
          isOpen={showAddEmailModal}
          onClose={() => setShowAddEmailModal(false)}
          onSave={handleAddEmail}
          leadId={lead?.id || ''}
          leadName={lead ? `${lead.firstName} ${lead.lastName}` : ''}
          leadEmail={lead?.email || ''}
        />
      )}

      {showAddSMSModal && (
        <AddLeadSMSModal
          isOpen={showAddSMSModal}
          onClose={() => setShowAddSMSModal(false)}
          onSave={handleAddSMS}
          leadId={lead?.id || ''}
          leadName={lead ? `${lead.firstName} ${lead.lastName}` : ''}
          leadPhone={lead?.phone || ''}
        />
      )}

      {selectedTask && (
        <TaskSlideout
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            // Refresh tasks when slideout is closed in case task was updated
            fetchTasks();
          }}
        />
      )}
    </MainLayout>
  );
}
