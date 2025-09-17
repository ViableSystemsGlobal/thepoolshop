'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface AIRecommendationCardProps {
  title: string;
  subtitle: string;
  recommendations: Recommendation[];
  onRecommendationComplete: (id: string) => void;
  icon?: React.ReactNode;
}

export function AIRecommendationCard({ 
  title, 
  subtitle, 
  recommendations, 
  onRecommendationComplete,
  icon 
}: AIRecommendationCardProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [completedItems, setCompletedItems] = useState<string[]>([]);

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
    <Card className="p-2 bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-lg bg-gradient-to-br from-${theme.primary} to-${theme.primaryDark} shadow-lg`}>
            {icon || <Sparkles className="w-3 h-3 text-white" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">AI Active</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-1 mb-1">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-white" />
          </div>
          <h4 className="text-xs font-semibold text-gray-800">Today's Top Recommendations</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.id}
              className={`p-1.5 rounded-lg border transition-all duration-200 ${
                completedItems.includes(rec.id) 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-0.5">
                    <span className={`px-1 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getPriorityColor(rec.priority)}`}>
                      {getPriorityIcon(rec.priority)}
                      <span className="capitalize text-xs">{rec.priority}</span>
                    </span>
                  </div>
                  <h5 className="text-xs font-medium text-gray-900 mb-0.5 truncate">{rec.title}</h5>
                  <p className="text-xs text-gray-600 leading-tight line-clamp-2">{rec.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComplete(rec.id)}
                  disabled={completedItems.includes(rec.id)}
                  className={`ml-1 p-0.5 h-4 w-4 flex-shrink-0 ${
                    completedItems.includes(rec.id) 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Check className="w-2 h-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {completedItems.length} of {recommendations.length} completed
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <span className="text-blue-600 font-medium">AI Powered</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
