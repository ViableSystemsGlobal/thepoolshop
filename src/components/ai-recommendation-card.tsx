'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, TrendingUp, AlertCircle, Target, Loader2, RefreshCw, Database, X } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { AIRecommendationDetailSlideout } from './ai-recommendation-detail-slideout';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  action?: string;
  href?: string;
}

interface AIRecommendationCardProps {
  title: string;
  subtitle: string;
  recommendations?: Recommendation[];
  onRecommendationComplete: (id: string) => void;
  icon?: React.ReactNode;
  className?: string;
  page?: string;
  context?: any;
  enableAI?: boolean;
}

export function AIRecommendationCard({ 
  title, 
  subtitle, 
  recommendations: initialRecommendations, 
  onRecommendationComplete,
  icon,
  className = '',
  page,
  context,
  enableAI = true
}: AIRecommendationCardProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations || []);
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataAnalyzed, setDataAnalyzed] = useState<any>(null);
  const [showDataView, setShowDataView] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showDetailSlideout, setShowDetailSlideout] = useState(false);

  // Fetch AI recommendations when component mounts or page changes
  useEffect(() => {
    if (enableAI && page) {
      // Always fetch AI recommendations when enableAI is true and page is provided
      // Only use initialRecommendations as fallback when AI is disabled
      fetchAIRecommendations();
    } else if (initialRecommendations && !enableAI) {
      // Only use initialRecommendations when AI is explicitly disabled
      setRecommendations(initialRecommendations);
    }
  }, [page, enableAI]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAIRecommendations = async (forceRefresh = false) => {
    if (!page) return;
    
    // Check client-side cache first (1 hour TTL)
    // Include context ID in cache key for context-specific requests
    const contextId = context?.leadId || context?.opportunityId || context?.accountId || '';
    const cacheKey = contextId 
      ? `ai_recommendations_${page}_${contextId}`
      : `ai_recommendations_${page}`;
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const cacheAge = Date.now() - cachedData.timestamp;
          
          if (cacheAge < CACHE_DURATION) {
            console.log(`✅ Using client-side cache for ${page} (age: ${Math.round(cacheAge / 1000 / 60)} minutes)`);
            setRecommendations(cachedData.recommendations);
            if (cachedData.dataAnalyzed) {
              setDataAnalyzed(cachedData.dataAnalyzed);
            }
            setAiEnabled(true);
            return;
          }
        }
      } catch (e) {
        // Cache read failed, continue to fetch
        console.log('⚠️ Failed to read cache:', e);
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          page,
          context
        })
      });

      const data = await response.json();
      
      // Log the data analyzed for debugging
      if (data.dataAnalyzed) {
        console.log(`📊 Data analyzed by AI for ${page}:`, {
          contextId: contextId || 'none',
          dataKeys: Object.keys(data.dataAnalyzed || {}),
          accountName: (data.dataAnalyzed as any)?.name,
          opportunities: (data.dataAnalyzed as any)?.opportunitiesCount,
          error: (data.dataAnalyzed as any)?.error
        });
        setDataAnalyzed(data.dataAnalyzed);
      }
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        setAiEnabled(true);
        
        // Cache in localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            recommendations: data.recommendations,
            dataAnalyzed: data.dataAnalyzed,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.log('⚠️ Failed to cache in localStorage:', e);
        }
        
        if (data.cached) {
          console.log(`💾 Received cached recommendations from server (age: ${data.cacheAge} minutes)`);
        }
      } else {
        // Use fallback recommendations if AI is not available
        setRecommendations(getFallbackRecommendations());
        setAiEnabled(false);
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError('Failed to load AI recommendations');
      setRecommendations(getFallbackRecommendations());
      setAiEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackRecommendations = (): Recommendation[] => {
    const fallbackRecs = {
      'crm-dashboard': [
        { id: '1', title: 'Follow up leads', description: 'Contact new leads within 24 hours', priority: 'high' as const, completed: false, action: 'Call leads' },
        { id: '2', title: 'Update opportunities', description: 'Review and update opportunity stages', priority: 'medium' as const, completed: false, action: 'Update pipeline' },
        { id: '3', title: 'Analyze conversion', description: 'Review lead to opportunity conversion rates', priority: 'low' as const, completed: false, action: 'Generate report' }
      ],
      'opportunities': [
        { id: '1', title: 'Close deals', description: 'Focus on high-value opportunities', priority: 'high' as const, completed: false, action: 'Schedule calls' },
        { id: '2', title: 'Update pipeline', description: 'Review opportunity stages and probabilities', priority: 'medium' as const, completed: false, action: 'Update stages' },
        { id: '3', title: 'Follow up', description: 'Contact prospects with pending quotes', priority: 'low' as const, completed: false, action: 'Send emails' }
      ],
      'products': [
        { id: '1', title: 'Restock items', description: 'Order low-stock products', priority: 'high' as const, completed: false, action: 'Create purchase orders' },
        { id: '2', title: 'Update pricing', description: 'Review and adjust product pricing', priority: 'medium' as const, completed: false, action: 'Update prices' },
        { id: '3', title: 'Add products', description: 'Expand product catalog', priority: 'low' as const, completed: false, action: 'Add new items' }
      ]
    };

    return fallbackRecs[page as keyof typeof fallbackRecs] || fallbackRecs['crm-dashboard'];
  };

  const handleRefresh = () => {
    if (enableAI && page) {
      fetchAIRecommendations(true); // Force refresh, bypass cache
    }
  };

  // Helper function to get proper gradient background classes
  const getGradientBackgroundClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'bg-gradient-to-br from-purple-600 to-purple-700',
      'blue-600': 'bg-gradient-to-br from-blue-600 to-blue-700',
      'green-600': 'bg-gradient-to-br from-green-600 to-green-700',
      'orange-600': 'bg-gradient-to-br from-orange-600 to-orange-700',
      'red-600': 'bg-gradient-to-br from-red-600 to-red-700',
      'indigo-600': 'bg-gradient-to-br from-indigo-600 to-indigo-700',
      'pink-600': 'bg-gradient-to-br from-pink-600 to-pink-700',
      'teal-600': 'bg-gradient-to-br from-teal-600 to-teal-700',
    };
    return colorMap[theme.primary] || 'bg-gradient-to-br from-blue-600 to-blue-700';
  };

  // Helper function to get proper small icon background classes
  const getSmallIconBackgroundClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'blue-600': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'green-600': 'bg-gradient-to-br from-green-500 to-green-600',
      'orange-600': 'bg-gradient-to-br from-orange-500 to-orange-600',
      'red-600': 'bg-gradient-to-br from-red-500 to-red-600',
      'indigo-600': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'pink-600': 'bg-gradient-to-br from-pink-500 to-pink-600',
      'teal-600': 'bg-gradient-to-br from-teal-500 to-teal-600',
    };
    return colorMap[theme.primary] || 'bg-gradient-to-br from-blue-500 to-blue-600';
  };

  const handleComplete = (id: string) => {
    setCompletedItems(prev => [...prev, id]);
    onRecommendationComplete(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`p-2 bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg h-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <div className={`p-1 rounded-lg ${getGradientBackgroundClasses()} shadow-lg`}>
            {icon || <Sparkles className="w-3 h-3 text-white" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          ) : aiEnabled ? (
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          ) : (
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
          )}
          <span className="text-xs text-gray-500">
            {isLoading ? 'Loading...' : aiEnabled ? 'AI' : 'Static'}
          </span>
          {enableAI && page && (
            <>
              {dataAnalyzed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDataView(!showDataView)}
                  className="p-0.5 h-4 w-4 ml-1"
                  title="View data analyzed"
                >
                  <Database className="w-2 h-2 text-gray-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-0.5 h-4 w-4 ml-1"
              >
                <RefreshCw className={`w-2 h-2 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-1 mb-1">
          <div className={`w-3 h-3 ${getSmallIconBackgroundClasses()} rounded-full flex items-center justify-center`}>
            <Sparkles className="w-2 h-2 text-white" />
          </div>
          <h4 className="text-xs font-semibold text-gray-800">Recommendations</h4>
        </div>

        <div className={`grid ${recommendations.length > 3 ? 'grid-cols-1' : 'grid-cols-3'} gap-1`}>
          {isLoading ? (
            // Loading state
            Array.from({ length: recommendations.length || 5 }).map((_, index) => (
              <div key={index} className="p-1 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-3 p-2 text-center text-xs text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : (
            // Normal recommendations
            recommendations.map((rec, index) => (
            <div 
              key={rec.id}
              onClick={() => {
                setSelectedRecommendation(rec);
                setShowDetailSlideout(true);
              }}
              className={`p-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                completedItems.includes(rec.id) 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`px-1 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getPriorityColor(rec.priority)}`}>
                  {getPriorityIcon(rec.priority)}
                  <span className="capitalize text-xs">{rec.priority}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComplete(rec.id);
                  }}
                  disabled={completedItems.includes(rec.id)}
                  className={`p-0.5 h-3 w-3 flex-shrink-0 ${
                    completedItems.includes(rec.id) 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Check className="w-2 h-2" />
                </Button>
              </div>
              <h5 className="text-xs font-medium text-gray-900 mb-1">{rec.title}</h5>
              <p className={`text-xs text-gray-600 leading-tight ${recommendations.length > 3 ? 'line-clamp-2' : 'line-clamp-1'}`}>{rec.description}</p>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Data View Modal */}
      {showDataView && dataAnalyzed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDataView(false)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Data Analyzed by AI</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataView(false)}
                className="p-1 h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] bg-white">
              <pre className="text-xs bg-gray-50 p-3 rounded-lg border overflow-x-auto">
                {JSON.stringify(dataAnalyzed, null, 2)}
              </pre>
            </div>
          </Card>
        </div>
      )}

      {/* Recommendation Detail Slideout */}
      <AIRecommendationDetailSlideout
        isOpen={showDetailSlideout}
        onClose={() => {
          setShowDetailSlideout(false);
          setSelectedRecommendation(null);
        }}
        recommendation={selectedRecommendation}
        page={page}
        dataAnalyzed={dataAnalyzed}
      />

      <div className="mt-1 pt-1 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {completedItems.length} of {recommendations.length} completed
          </span>
          <div className="flex items-center space-x-1">
            <div className={`w-1 h-1 rounded-full ${aiEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
            <span className={`font-medium ${aiEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
              {aiEnabled ? 'AI Powered' : 'Static Data'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
