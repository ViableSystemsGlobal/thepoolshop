'use client';

import { X, ArrowRight, Users, Calendar, Target, TrendingUp, AlertCircle, ExternalLink, CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'next/navigation';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  action?: string;
  href?: string;
}

interface AIRecommendationDetailSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  page?: string;
  dataAnalyzed?: any;
}

export function AIRecommendationDetailSlideout({
  isOpen,
  onClose,
  recommendation,
  page,
  dataAnalyzed
}: AIRecommendationDetailSlideoutProps) {
  const { getThemeColor, getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const router = useRouter();

  if (!recommendation || !isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <Target className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  // Get actionable items based on the recommendation and page
  const getActionableItems = () => {
    const items: any[] = [];
    const title = recommendation.title.toLowerCase();
    const desc = recommendation.description.toLowerCase();
    
    if (page === 'leads') {
      // Check recommendation title/description for specific actions
      if (title.includes('stale') || title.includes('over 3 days') || desc.includes('over 3 days')) {
        items.push({
          label: 'View Stale Leads',
          icon: <Clock className="w-4 h-4" />,
          href: '/crm/leads?status=NEW',
          description: `View ${dataAnalyzed?.newLeadsOver3Days || 0} new leads over 3 days old`
        });
      }
      
      if (title.includes('unassigned') || desc.includes('unassigned')) {
        items.push({
          label: 'Assign Leads',
          icon: <Users className="w-4 h-4" />,
          href: '/crm/leads',
          description: `Assign ${dataAnalyzed?.unassignedLeads || 0} unassigned leads`
        });
      }
      
      if (title.includes('follow-up') || desc.includes('follow-up') || desc.includes('follow up')) {
        items.push({
          label: 'View Follow-ups',
          icon: <Calendar className="w-4 h-4" />,
          href: '/crm/leads',
          description: `Manage ${dataAnalyzed?.overdueFollowUps || 0} overdue follow-ups`
        });
      }
      
      if (title.includes('qualify') || desc.includes('qualify')) {
        items.push({
          label: 'Qualify Leads',
          icon: <Target className="w-4 h-4" />,
          href: '/crm/leads?status=NEW',
          description: `Review and qualify ${dataAnalyzed?.newLeads || 0} new leads`
        });
      }
      
      if (title.includes('convert') || desc.includes('convert') || desc.includes('opportunity')) {
        items.push({
          label: 'Convert to Opportunities',
          icon: <TrendingUp className="w-4 h-4" />,
          href: '/crm/opportunities',
          description: `Convert qualified leads to opportunities`
        });
      }
      
      // Default actions if no specific match
      if (items.length === 0) {
        items.push(
          {
            label: 'View All Leads',
            icon: <Users className="w-4 h-4" />,
            href: '/crm/leads',
            description: 'Browse and manage all leads'
          },
          {
            label: 'New Leads',
            icon: <Clock className="w-4 h-4" />,
            href: '/crm/leads?status=NEW',
            description: `View ${dataAnalyzed?.newLeads || 0} new leads`
          }
        );
      }
    } else if (page === 'opportunities') {
      // Opportunities-specific actions
      if (title.includes('stuck') || title.includes('negotiation') || desc.includes('negotiation') || desc.includes('30+ days')) {
        items.push({
          label: 'View Stuck Opportunities',
          icon: <AlertCircle className="w-4 h-4" />,
          href: '/crm/opportunities?stage=NEGOTIATION',
          description: `View ${dataAnalyzed?.stuckInNegotiation || 0} opportunities stuck in negotiation`
        });
      }
      
      if (title.includes('quote') || desc.includes('quote') || desc.includes('quotation')) {
        items.push({
          label: 'View Quotations',
          icon: <FileText className="w-4 h-4" />,
          href: '/quotations',
          description: `View quotations linked to opportunities`
        });
      }
      
      if (title.includes('close') || title.includes('won') || desc.includes('close') || desc.includes('win')) {
        items.push({
          label: 'Close Opportunities',
          icon: <CheckCircle className="w-4 h-4" />,
          href: '/crm/opportunities?stage=NEGOTIATION',
          description: `Move high-probability opportunities to closed won`
        });
      }
      
      if (title.includes('high') && (title.includes('probability') || title.includes('value') || desc.includes('probability') || desc.includes('value'))) {
        items.push({
          label: 'High-Value Opportunities',
          icon: <TrendingUp className="w-4 h-4" />,
          href: '/crm/opportunities',
          description: `Focus on ${dataAnalyzed?.highProbability || 0} high-probability opportunities`
        });
      }
      
      if (title.includes('overdue') || desc.includes('overdue') || desc.includes('close date')) {
        items.push({
          label: 'Overdue Close Dates',
          icon: <Calendar className="w-4 h-4" />,
          href: '/crm/opportunities',
          description: `Review ${dataAnalyzed?.overdueCloseDates || 0} opportunities with overdue close dates`
        });
      }
      
      // Default actions if no specific match
      if (items.length === 0) {
        items.push(
          {
            label: 'View All Opportunities',
            icon: <TrendingUp className="w-4 h-4" />,
            href: '/crm/opportunities',
            description: 'Browse and manage all opportunities'
          },
          {
            label: 'Pipeline View',
            icon: <Target className="w-4 h-4" />,
            href: '/crm/opportunities',
            description: `View ${dataAnalyzed?.pipelineValue || 0} in pipeline value`
          }
        );
      }
    }
    
    return items;
  };

  const actionableItems = getActionableItems();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-all duration-1000 ease-in-out ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transition: 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={onClose}
      />

      {/* Slide-out Panel - Slides In from Right */}
      <div 
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-all duration-1000 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1200ms ease-in-out'
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg transition-transform duration-300 ${getPriorityColor(recommendation.priority)} ${isOpen ? 'scale-100' : 'scale-95'}`}>
                {getPriorityIcon(recommendation.priority)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 transition-opacity duration-500">{recommendation.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${getPriorityColor(recommendation.priority)}`}>
                    {getPriorityIcon(recommendation.priority)}
                    <span className="ml-1 capitalize">{recommendation.priority} Priority</span>
                  </span>
                  {recommendation.completed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 ml-4"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Full Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {recommendation.description}
              </p>
            </div>

            {/* Data Context */}
            {dataAnalyzed && (page === 'leads' || page === 'opportunities') && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {page === 'leads' ? 'Current Lead Metrics' : 'Current Opportunity Metrics'}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {page === 'leads' ? (
                    <>
                      <div>
                        <span className="text-gray-500">Total Leads:</span>
                        <span className="ml-2 font-semibold text-gray-900">{dataAnalyzed.total || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">New:</span>
                        <span className="ml-2 font-semibold text-blue-600">{dataAnalyzed.newLeads || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Qualified:</span>
                        <span className="ml-2 font-semibold text-green-600">{dataAnalyzed.qualified || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Conversion Rate:</span>
                        <span className="ml-2 font-semibold text-gray-900">{dataAnalyzed.conversionRate || 0}%</span>
                      </div>
                      {dataAnalyzed.unassignedLeads > 0 && (
                        <div>
                          <span className="text-gray-500">Unassigned:</span>
                          <span className="ml-2 font-semibold text-orange-600">{dataAnalyzed.unassignedLeads}</span>
                        </div>
                      )}
                      {dataAnalyzed.overdueFollowUps > 0 && (
                        <div>
                          <span className="text-gray-500">Overdue Follow-ups:</span>
                          <span className="ml-2 font-semibold text-red-600">{dataAnalyzed.overdueFollowUps}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-500">Total Opportunities:</span>
                        <span className="ml-2 font-semibold text-gray-900">{dataAnalyzed.total || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Open:</span>
                        <span className="ml-2 font-semibold text-blue-600">{dataAnalyzed.newOpportunities || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Won:</span>
                        <span className="ml-2 font-semibold text-green-600">{dataAnalyzed.won || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Win Rate:</span>
                        <span className="ml-2 font-semibold text-gray-900">{dataAnalyzed.winRate || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Pipeline Value:</span>
                        <span className="ml-2 font-semibold text-blue-600">{dataAnalyzed.pipelineValue || 0}</span>
                      </div>
                      {dataAnalyzed.stuckInNegotiation > 0 && (
                        <div>
                          <span className="text-gray-500">Stuck (30+ days):</span>
                          <span className="ml-2 font-semibold text-orange-600">{dataAnalyzed.stuckInNegotiation}</span>
                        </div>
                      )}
                      {dataAnalyzed.overdueCloseDates > 0 && (
                        <div>
                          <span className="text-gray-500">Overdue Close Dates:</span>
                          <span className="ml-2 font-semibold text-red-600">{dataAnalyzed.overdueCloseDates}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actionable Steps */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Take Action</h3>
              <div className="space-y-2">
                {actionableItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                        onClose();
                      }
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">{item.label}</h4>
                          {item.description && (
                            <p className="text-xs text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Action */}
            {recommendation.action && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Suggested Action</h3>
                <p className="text-sm text-blue-800">{recommendation.action}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {recommendation.href && (
              <Button
                onClick={() => {
                  router.push(recommendation.href!);
                  onClose();
                }}
                className="text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: getThemeColor() }}
              >
                View Related Data
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

