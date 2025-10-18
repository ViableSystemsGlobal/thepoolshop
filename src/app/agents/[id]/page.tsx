"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import {
  ArrowLeft,
  Edit,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Users,
  Phone,
  Mail,
  User
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Agent {
  id: string;
  agentCode: string;
  status: string;
  hireDate: string;
  territory?: string;
  team?: string;
  commissionRate: number;
  targetMonthly?: number;
  targetQuarterly?: number;
  targetAnnual?: number;
  notes?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    role: string;
  };
  manager?: {
    id: string;
    agentCode: string;
    user: {
      name: string;
      email: string;
    };
  };
  totalCommissions: number;
  commissionCount: number;
  pendingCommissions: number;
  paidCommissions: number;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getThemeColor } = useTheme();
  const { success, error: showError } = useToast();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAgent(params.id as string);
    }
  }, [params.id]);

  const fetchAgent = async (agentId: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching agent details for:', agentId);
      
      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Agent not found');
        }
        throw new Error('Failed to fetch agent');
      }
      
      const data = await response.json();
      console.log('📊 Agent data:', data);
      setAgent(data.agent);
    } catch (error) {
      console.error('❌ Error fetching agent:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to load agent');
      router.push('/agents');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Agent not found</p>
          <Button 
            onClick={() => router.push('/agents')}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.INACTIVE}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => router.push('/agents')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agent.user.name}</h1>
            <p className="text-gray-600">{agent.agentCode}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(agent.status)}
          <Link href={`/agents/${agent.id}/edit`}>
            <Button
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
              className="hover:opacity-90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(agent.totalCommissions, 'GHS')}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{agent.commissionRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(agent.pendingCommissions, 'GHS')}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{agent.commissionCount}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{agent.user.name}</p>
                <p className="text-sm text-gray-500">Full Name</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{agent.user.email}</p>
                <p className="text-sm text-gray-500">Email Address</p>
              </div>
            </div>
            
            {agent.user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{agent.user.phone}</p>
                  <p className="text-sm text-gray-500">Phone Number</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{agent.user.role}</p>
                <p className="text-sm text-gray-500">Role</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{new Date(agent.hireDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Hire Date</p>
              </div>
            </div>
            
            {agent.territory && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{agent.territory}</p>
                  <p className="text-sm text-gray-500">Territory</p>
                </div>
              </div>
            )}
            
            {agent.team && (
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{agent.team}</p>
                  <p className="text-sm text-gray-500">Team</p>
                </div>
              </div>
            )}
            
            {agent.manager && (
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{agent.manager.user.name}</p>
                  <p className="text-sm text-gray-500">Manager ({agent.manager.agentCode})</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Targets */}
      {(agent.targetMonthly || agent.targetQuarterly || agent.targetAnnual) && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agent.targetMonthly && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(agent.targetMonthly, 'GHS')}
                  </p>
                  <p className="text-sm text-gray-500">Monthly Target</p>
                </div>
              )}
              
              {agent.targetQuarterly && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(agent.targetQuarterly, 'GHS')}
                  </p>
                  <p className="text-sm text-gray-500">Quarterly Target</p>
                </div>
              )}
              
              {agent.targetAnnual && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(agent.targetAnnual, 'GHS')}
                  </p>
                  <p className="text-sm text-gray-500">Annual Target</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {agent.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{agent.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
