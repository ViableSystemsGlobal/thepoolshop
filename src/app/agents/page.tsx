"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import {
  Users,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Award,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu } from "@/components/ui/dropdown-menu-custom";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Agent {
  id: string;
  agentCode: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  manager?: {
    id: string;
    name: string;
  };
  territory?: string;
  team?: string;
  commissionRate: number;
  targetMonthly?: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  commissionCount: number;
}

export default function AgentsPage() {
  const { getThemeColor } = useTheme();
  const { success, error: showError } = useToast();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalCommissions: 0,
    pendingCommissions: 0
  });

  // AI Recommendations
  const [aiRecommendations] = useState([
    {
      id: '1',
      title: 'Top Performing Agents',
      description: 'Identify your best performers to replicate their strategies',
      action: 'View Top Agents',
      actionType: 'filter' as const,
      priority: 'high' as const,
      completed: false,
      onAction: () => {
        setStatusFilter('ACTIVE');
        success('Filter Applied', 'Showing active agents only');
      }
    },
    {
      id: '2',
      title: 'Commission Structure Analysis',
      description: 'Review commission rates to ensure competitive compensation',
      action: 'Analyze Rates',
      actionType: 'insight' as const,
      priority: 'medium' as const,
      completed: false,
      onAction: () => {
        success('Insight', 'Review individual agent commission rates in the table below');
      }
    },
    {
      id: '3',
      title: 'Territory Coverage',
      description: 'Ensure all territories have adequate sales coverage',
      action: 'View Coverage',
      actionType: 'warning' as const,
      priority: 'medium' as const,
      completed: false,
      onAction: () => {
        success('Tip', 'Check the Territory/Team column to identify gaps');
      }
    }
  ]);

  const handleRecommendationComplete = (id: string) => {
    console.log('Recommendation completed:', id);
  };

  useEffect(() => {
    console.log('🚀 Agents page mounted, starting fetchAgents...');
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, statusFilter]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching agents...');
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      
      const data = await response.json();
      console.log('📊 Agents data:', data);
      setAgents(data.agents);
      
      // Calculate metrics
      const activeAgents = data.agents.filter((a: Agent) => a.status === 'ACTIVE');
      const totalCommissions = data.agents.reduce((sum: number, a: Agent) => sum + a.totalCommissions, 0);
      const pendingCommissions = data.agents.reduce((sum: number, a: Agent) => sum + a.pendingCommissions, 0);
      
      setMetrics({
        totalAgents: data.agents.length,
        activeAgents: activeAgents.length,
        totalCommissions,
        pendingCommissions
      });
      console.log('✅ Agents loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      showError('Error', 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.user.name?.toLowerCase().includes(term) ||
        agent.user.email?.toLowerCase().includes(term) ||
        agent.agentCode.toLowerCase().includes(term) ||
        agent.territory?.toLowerCase().includes(term) ||
        agent.team?.toLowerCase().includes(term)
      );
    }

    setFilteredAgents(filtered);
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete agent');
      }

      success('Success', 'Agent deleted successfully');
      fetchAgents();
    } catch (error: any) {
      showError('Error', error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.INACTIVE}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    {
      key: 'agentCode',
      label: 'Agent Code',
      render: (agent: Agent) => (
        <div className="font-medium text-gray-900">{agent.agentCode}</div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (agent: Agent) => (
        <div>
          <div className="font-medium text-gray-900">{agent.user.name}</div>
          <div className="text-sm text-gray-500">{agent.user.email}</div>
        </div>
      )
    },
    {
      key: 'territory',
      label: 'Territory / Team',
      render: (agent: Agent) => (
        <div>
          <div className="text-sm text-gray-900">{agent.territory || '-'}</div>
          <div className="text-xs text-gray-500">{agent.team || '-'}</div>
        </div>
      )
    },
    {
      key: 'commissionRate',
      label: 'Commission Rate',
      render: (agent: Agent) => (
        <div className="text-sm text-gray-900">{agent.commissionRate}%</div>
      )
    },
    {
      key: 'commissions',
      label: 'Commissions',
      render: (agent: Agent) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(agent.totalCommissions, 'GHS')}
          </div>
          <div className="text-xs text-gray-500">
            {agent.commissionCount} transactions
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (agent: Agent) => getStatusBadge(agent.status)
    },
    {
      key: 'actions',
      label: '',
      render: (agent: Agent) => (
        <DropdownMenu
          trigger={
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
          }
          items={[
            {
              label: 'View Details',
              icon: <Eye className="h-4 w-4" />,
              onClick: () => window.location.href = `/agents/${agent.id}`
            },
            {
              label: 'Edit',
              icon: <Edit className="h-4 w-4" />,
              onClick: () => window.location.href = `/agents/${agent.id}/edit`
            },
            {
              label: 'Delete',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDeleteAgent(agent.id),
              className: 'text-red-600'
            }
          ]}
        />
      )
    }
  ];

  console.log('🔄 Agents page render - isLoading:', isLoading, 'agents count:', agents.length);

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading agents...</p>
            <p className="mt-2 text-sm text-gray-500">Debug: isLoading = {isLoading.toString()}</p>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Agents</h1>
            <p className="text-gray-600">Manage your sales team and track performance</p>
          </div>
          <Link href="/agents/new">
            <Button
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </Link>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              title="Agent Performance AI"
              subtitle="Optimize your sales team performance"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Agents</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalAgents}</p>
                </div>
                <div className="p-2 rounded-full" style={{ backgroundColor: `${getThemeColor()}20` }}>
                  <Users className="w-5 h-5" style={{ color: getThemeColor() }} />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-xl font-bold text-green-600">{metrics.activeAgents}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.totalCommissions, 'GHS')}</p>
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
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(metrics.pendingCommissions, 'GHS')}</p>
                </div>
                <div className="p-2 rounded-full bg-orange-100">
                  <Award className="w-5 h-5 text-orange-600" />
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
                  placeholder="Search agents..."
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Agents Table */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Agents List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "ALL" 
                    ? "No agents found matching your filters" 
                    : "No agents yet. Add your first agent to get started."}
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredAgents}
                columns={columns}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
