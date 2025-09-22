'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/theme-context';
import { useAbilities } from '@/hooks/use-abilities';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  FileText, 
  Map, 
  Megaphone,
  ChevronRight,
  ChevronDown,
  Plus,
  TrendingUp,
  Target,
  Handshake,
  Route,
  MessageSquare
} from 'lucide-react';

interface DRMMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
  stats?: {
    label: string;
    value: string;
  };
}

export default function DRMPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { hasAbility } = useAbilities();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const drmModules: DRMMenuItem[] = [
    {
      id: 'distributor-leads',
      title: 'Distributor Leads',
      description: 'Manage potential distributor applications and inquiries',
      icon: <Users className="w-6 h-6" />,
      path: '/drm/distributor-leads',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: {
        label: 'Active Applications',
        value: '12'
      }
    },
    {
      id: 'distributors',
      title: 'Distributors (Active)',
      description: 'Manage active distributor relationships and performance',
      icon: <Building2 className="w-6 h-6" />,
      path: '/drm/distributors',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: {
        label: 'Active Distributors',
        value: '8'
      }
    },
    {
      id: 'agreements',
      title: 'Agreements',
      description: 'Manage distributor contracts and legal documents',
      icon: <FileText className="w-6 h-6" />,
      path: '/drm/agreements',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: {
        label: 'Active Contracts',
        value: '15'
      }
    },
    {
      id: 'routes-mapping',
      title: 'Routes & Mapping',
      description: 'Plan and manage distributor routes and territories',
      icon: <Map className="w-6 h-6" />,
      path: '/drm/routes-mapping',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      stats: {
        label: 'Active Routes',
        value: '24'
      }
    },
    {
      id: 'engagement',
      title: 'Engagement',
      description: 'Track distributor communication and engagement activities',
      icon: <Megaphone className="w-6 h-6" />,
      path: '/drm/engagement',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      stats: {
        label: 'This Month',
        value: '156'
      }
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleModuleClick = (path: string) => {
    router.push(path);
  };

  if (!session?.user) {
    return <div>Please sign in to access DRM.</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Distributor Relationship Management</h1>
            <p className="text-gray-600">Manage your distributor network and relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/crm')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View CRM
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distributors</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Route className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Engagement</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* DRM Modules */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">DRM Modules</h2>
          
          {drmModules.map((module) => (
            <Card key={module.id} className="overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(module.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <div className={module.color}>
                        {module.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {module.title}
                      </h3>
                      <p className="text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {module.stats && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{module.stats.label}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {module.stats.value}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleClick(module.path);
                        }}
                        className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                        style={{
                          backgroundColor: theme.primary,
                          color: 'white'
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Access
                      </Button>
                      {expandedSection === module.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {expandedSection === module.id && (
                <div className="border-t bg-gray-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Quick Actions</h4>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModuleClick(module.path)}
                          className="w-full justify-start"
                        >
                          View All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModuleClick(`${module.path}?action=create`)}
                          className="w-full justify-start"
                        >
                          Add New
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Recent Activity</h4>
                      <div className="text-sm text-gray-600">
                        <p>• 3 new applications this week</p>
                        <p>• 2 contracts renewed</p>
                        <p>• 5 route updates</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Performance</h4>
                      <div className="text-sm text-gray-600">
                        <p>• 95% satisfaction rate</p>
                        <p>• 12% growth this month</p>
                        <p>• 8 active partnerships</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Network Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Active Distributors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24</div>
              <div className="text-sm text-gray-600">Coverage Routes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">156</div>
              <div className="text-sm text-gray-600">Monthly Interactions</div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
