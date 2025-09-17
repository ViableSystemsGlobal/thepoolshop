'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, Building, TrendingUp, FileText, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/main-layout';
import { useTheme } from '@/contexts/theme-context';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import Link from 'next/link';

interface CRMStats {
  leads: number;
  accounts: number;
  opportunities: number;
  quotations: number;
}

export default function CRMDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  // All state hooks must be called before any conditional returns
  const [stats, setStats] = useState<CRMStats>({
    leads: 0,
    accounts: 0,
    opportunities: 0,
    quotations: 0,
  });
  const [loading, setLoading] = useState(true);

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Focus on high-priority leads',
      description: '3 leads require immediate attention and follow-up within 24 hours.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Review opportunity pipeline',
      description: 'Analyze 5 opportunities that are close to closing this month.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Update account activities',
      description: 'Log recent interactions and update account status across the CRM.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [leadsRes, accountsRes, opportunitiesRes, quotationsRes] = await Promise.all([
        fetch('/api/leads', { credentials: 'include' }),
        fetch('/api/accounts', { credentials: 'include' }),
        fetch('/api/opportunities', { credentials: 'include' }),
        fetch('/api/quotations', { credentials: 'include' }),
      ]);

      const [leads, accounts, opportunities, quotations] = await Promise.all([
        leadsRes.ok ? leadsRes.json() : [],
        accountsRes.ok ? accountsRes.json() : [],
        opportunitiesRes.ok ? opportunitiesRes.json() : [],
        quotationsRes.ok ? quotationsRes.json() : [],
      ]);

      setStats({
        leads: leads.length,
        accounts: accounts.length,
        opportunities: opportunities.length,
        quotations: quotations.length,
      });
    } catch (error) {
      console.error('Error fetching CRM stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
  };

  const quickActions = [
    {
      title: 'Add Lead',
      description: 'Create a new sales lead',
      icon: UserCheck,
      href: '/crm/leads',
      color: `bg-${theme.primary}`,
    },
    {
      title: 'Add Account',
      description: 'Create a new customer account',
      icon: Building,
      href: '/crm/accounts',
      color: `bg-${theme.primary}`,
    },
    {
      title: 'Create Quotation',
      description: 'Generate a new quotation',
      icon: FileText,
      href: '/crm/quotations',
      color: `bg-${theme.primary}`,
    },
    {
      title: 'View Opportunities',
      description: 'Manage sales opportunities',
      icon: TrendingUp,
      href: '/crm/opportunities',
      color: `bg-${theme.primary}`,
    },
  ];

  const statCards = [
    {
      title: 'Leads',
      value: stats.leads,
      icon: UserCheck,
      href: '/crm/leads',
      color: `text-${theme.primary}`,
      bgColor: `bg-${theme.primaryBg}`,
    },
    {
      title: 'Accounts',
      value: stats.accounts,
      icon: Building,
      href: '/crm/accounts',
      color: `text-${theme.primary}`,
      bgColor: `bg-${theme.primaryBg}`,
    },
    {
      title: 'Opportunities',
      value: stats.opportunities,
      icon: TrendingUp,
      href: '/crm/opportunities',
      color: `text-${theme.primary}`,
      bgColor: `bg-${theme.primaryBg}`,
    },
    {
      title: 'Quotations',
      value: stats.quotations,
      icon: FileText,
      href: '/crm/quotations',
      color: `text-${theme.primary}`,
      bgColor: `bg-${theme.primaryBg}`,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-gray-600">Manage your customer relationships and sales pipeline</p>
        </div>
      </div>

      {/* AI Recommendation and Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendation Card - Left Side */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="CRM Intelligence"
            subtitle="Your AI-powered sales assistant"
            recommendations={aiRecommendations}
            onRecommendationComplete={handleRecommendationComplete}
          />
        </div>

        {/* Metrics Cards - Right Side */}
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity to display</p>
            <p className="text-sm">Start by creating your first lead or account</p>
          </div>
        </Card>
      </div>
      </div>
    </MainLayout>
  );
}
