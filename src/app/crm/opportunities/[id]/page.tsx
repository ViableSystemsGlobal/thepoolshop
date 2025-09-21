'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, Calendar, User, Clock, CheckCircle, AlertCircle, XCircle, Play, Link, Tag, TrendingUp, Users, MessageSquare, FileText, Video, PhoneCall, Star, Target, Plus, Activity, History, DollarSign, UserPlus, FileCheck, FileBarChart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { MainLayout } from '@/components/layout/main-layout';

interface Opportunity {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  leadType: 'INDIVIDUAL' | 'COMPANY';
  company?: string;
  subject?: string;
  source?: string;
  status: string;
  assignedTo?: any[];
  interestedProducts?: any[];
  followUpDate?: string;
  notes?: string;
  dealValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OpportunityDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const { success, error } = useToast();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalInteractions: 0,
    conversionProbability: 0,
    lastActivity: 'No activity',
  });

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
    if (session?.user && params.id) {
      fetchOpportunity();
    }
  }, [session, params.id]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/opportunities/${params.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data.opportunity);
        updateMetrics(data.opportunity);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageInfo = (status: string) => {
    return pipelineStages.find(stage => stage.key === status) || pipelineStages[0];
  };

  if (!session?.user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please sign in to view opportunity details.</p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!opportunity) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Opportunity not found.</p>
        </div>
      </MainLayout>
    );
  }

  const stageInfo = getStageInfo(opportunity.status);

  return (
    <MainLayout>
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
                onClick={() => router.push(`/quotations?opportunityId=${opportunity.id}`)}
              >
                <FileBarChart className="w-4 h-4" />
                Create Quote
              </Button>
              <Button
                variant="destructive"
                onClick={() => console.log('Delete opportunity')}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deal Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(opportunity.dealValue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Probability</p>
                <p className="text-2xl font-bold text-gray-900">{opportunity.probability || 0}%</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Close</p>
                <p className="text-lg font-bold text-gray-900">
                  {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : 'Not set'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Stage</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageInfo.color}`}>
                    <stageInfo.icon className="w-3 h-3 mr-1" />
                    {stageInfo.label}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Opportunity Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunity Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Name</label>
                  <p className="text-sm text-gray-900">{opportunity.firstName} {opportunity.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Company</label>
                  <p className="text-sm text-gray-900">{opportunity.company || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">{opportunity.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm text-gray-900">{opportunity.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Source</label>
                  <p className="text-sm text-gray-900">{opportunity.source || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Owner</label>
                  <p className="text-sm text-gray-900">{opportunity.owner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(opportunity.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(opportunity.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {opportunity.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{opportunity.notes}</p>
              </Card>
            )}

            {/* Interested Products */}
            {opportunity.interestedProducts && opportunity.interestedProducts.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested Products</h3>
                <div className="space-y-3">
                  {opportunity.interestedProducts.map((product: any, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">{product.name}</h4>
                      {product.sku && <p className="text-sm text-blue-700">SKU: {product.sku}</p>}
                      {product.description && <p className="text-sm text-gray-600 mt-1">{product.description}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pipeline Stage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Stage</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageInfo.color}`}>
                    <stageInfo.icon className="w-3 h-3 mr-1" />
                    {stageInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deal Value</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(opportunity.dealValue || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Win Probability</span>
                  <span className="text-sm font-medium text-gray-900">{opportunity.probability || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expected Close</span>
                  <span className="text-sm font-medium text-gray-900">
                    {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : 'Not set'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push(`/quotations?opportunityId=${opportunity.id}`)}
                >
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Create Quote
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => console.log('Send email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => console.log('Schedule meeting')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => console.log('Add note')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
