"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import {
  DollarSign,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";

interface Commission {
  id: string;
  type: string;
  status: string;
  baseAmount: number;
  rate: number;
  commissionAmount: number;
  currency: string;
  earnedDate: string;
  paidDate?: string;
  agent: {
    agentCode: string;
    user: {
      name: string;
      email: string;
    };
  };
  invoice?: {
    number: string;
    account?: { name: string };
  };
  quotation?: {
    number: string;
    account?: { name: string };
  };
  order?: {
    orderNumber: string;
    distributor?: { businessName: string };
  };
  opportunity?: {
    name: string;
    account?: { name: string };
  };
}

export default function CommissionsPage() {
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalCommissions: 0,
    pendingCommissions: 0,
    approvedCommissions: 0,
    paidCommissions: 0
  });

  // AI Recommendations
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Pending Commission Review',
      description: 'Review and approve pending commissions to keep your team motivated',
      action: 'View Pending',
      actionType: 'action' as const,
      priority: 'high' as const,
      completed: false,
      onAction: () => {
        setStatusFilter('PENDING');
        success('Filter Applied', 'Showing pending commissions only');
      }
    },
    {
      id: '2',
      title: 'Commission Payout Schedule',
      description: 'Approve commissions to prepare for the next payout cycle',
      action: 'Review Approved',
      actionType: 'insight' as const,
      priority: 'medium' as const,
      completed: false,
      onAction: () => {
        setStatusFilter('APPROVED');
        success('Filter Applied', 'Showing approved commissions ready for payout');
      }
    },
    {
      id: '3',
      title: 'Commission Analytics',
      description: 'Analyze commission trends to optimize your compensation structure',
      action: 'View All',
      actionType: 'filter' as const,
      priority: 'low' as const,
      completed: false,
      onAction: () => {
        setStatusFilter('ALL');
        success('Filter Reset', 'Showing all commissions');
      }
    }
  ]);

  const handleRecommendationComplete = (id: string) => {
    console.log('Recommendation completed:', id);
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  useEffect(() => {
    filterCommissions();
  }, [commissions, searchTerm, statusFilter, typeFilter]);

  const fetchCommissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/commissions');
      if (!response.ok) throw new Error('Failed to fetch commissions');
      
      const data = await response.json();
      setCommissions(data.commissions);
      
      // Calculate metrics
      const total = data.commissions.reduce((sum: number, c: Commission) => sum + c.commissionAmount, 0);
      const pending = data.commissions
        .filter((c: Commission) => c.status === 'PENDING')
        .reduce((sum: number, c: Commission) => sum + c.commissionAmount, 0);
      const approved = data.commissions
        .filter((c: Commission) => c.status === 'APPROVED')
        .reduce((sum: number, c: Commission) => sum + c.commissionAmount, 0);
      const paid = data.commissions
        .filter((c: Commission) => c.status === 'PAID')
        .reduce((sum: number, c: Commission) => sum + c.commissionAmount, 0);
      
      setMetrics({
        totalCommissions: total,
        pendingCommissions: pending,
        approvedCommissions: approved,
        paidCommissions: paid
      });
    } catch (error) {
      console.error('Error fetching commissions:', error);
      showError('Error', 'Failed to load commissions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCommissions = () => {
    let filtered = commissions;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.agent.user.name?.toLowerCase().includes(term) ||
        c.agent.agentCode.toLowerCase().includes(term) ||
        c.invoice?.number.toLowerCase().includes(term) ||
        c.quotation?.number.toLowerCase().includes(term) ||
        c.order?.orderNumber.toLowerCase().includes(term)
      );
    }

    setFilteredCommissions(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DISPUTED: 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {status}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INVOICE_SALE: 'Invoice Sale',
      QUOTATION_SENT: 'Quotation Sent',
      ORDER_PLACED: 'Order Placed',
      OPPORTUNITY_WON: 'Opportunity Won',
      RECURRING_REVENUE: 'Recurring Revenue',
      BONUS: 'Bonus'
    };
    return labels[type] || type;
  };

  const getSourceInfo = (commission: Commission) => {
    if (commission.invoice) {
      return {
        label: commission.invoice.number,
        customer: commission.invoice.account?.name || 'N/A'
      };
    }
    if (commission.quotation) {
      return {
        label: commission.quotation.number,
        customer: commission.quotation.account?.name || 'N/A'
      };
    }
    if (commission.order) {
      return {
        label: commission.order.orderNumber,
        customer: commission.order.distributor?.businessName || 'N/A'
      };
    }
    if (commission.opportunity) {
      return {
        label: commission.opportunity.name,
        customer: commission.opportunity.account?.name || 'N/A'
      };
    }
    return { label: '-', customer: '-' };
  };

  const columns = [
    {
      key: 'agent',
      label: 'Agent',
      render: (commission: Commission) => (
        <div>
          <div className="font-medium text-gray-900">{commission.agent.user.name}</div>
          <div className="text-sm text-gray-500">{commission.agent.agentCode}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (commission: Commission) => (
        <div className="text-sm text-gray-900">{getTypeLabel(commission.type)}</div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      render: (commission: Commission) => {
        const source = getSourceInfo(commission);
        return (
          <div>
            <div className="text-sm text-gray-900">{source.label}</div>
            <div className="text-xs text-gray-500">{source.customer}</div>
          </div>
        );
      }
    },
    {
      key: 'baseAmount',
      label: 'Base Amount',
      render: (commission: Commission) => (
        <div className="text-sm text-gray-900">
          {commission.currency} {commission.baseAmount.toLocaleString()}
        </div>
      )
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (commission: Commission) => (
        <div className="text-sm text-gray-900">{commission.rate}%</div>
      )
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (commission: Commission) => (
        <div className="text-sm font-medium text-gray-900">
          {commission.currency} {commission.commissionAmount.toLocaleString()}
        </div>
      )
    },
    {
      key: 'earnedDate',
      label: 'Earned Date',
      render: (commission: Commission) => (
        <div className="text-sm text-gray-900">
          {new Date(commission.earnedDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (commission: Commission) => getStatusBadge(commission.status)
    }
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading commissions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
            <p className="text-gray-600">Track and manage sales commissions</p>
          </div>
          <Button
            style={{ backgroundColor: getThemeColor(), color: 'white' }}
            className="hover:opacity-90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Commission Insights AI"
              subtitle="Optimize your commission structure"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-xl font-bold text-gray-900">GHS {metrics.totalCommissions.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">GHS {metrics.pendingCommissions.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-100">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-xl font-bold text-blue-600">GHS {metrics.approvedCommissions.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-xl font-bold text-green-600">GHS {metrics.paidCommissions.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search commissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DISPUTED">Disputed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Types</option>
                <option value="INVOICE_SALE">Invoice Sale</option>
                <option value="QUOTATION_SENT">Quotation Sent</option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="OPPORTUNITY_WON">Opportunity Won</option>
                <option value="RECURRING_REVENUE">Recurring Revenue</option>
                <option value="BONUS">Bonus</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Commissions Table */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Commissions List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCommissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL"
                    ? "No commissions found matching your filters" 
                    : "No commissions yet."}
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredCommissions}
                columns={columns}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
