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
  className?: string;
}

export function AIRecommendationCard({ 
  title, 
  subtitle, 
  recommendations, 
  onRecommendationComplete,
  icon,
  className = ''
}: AIRecommendationCardProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [completedItems, setCompletedItems] = useState<string[]>([]);

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
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">AI</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-1 mb-1">
          <div className={`w-3 h-3 ${getSmallIconBackgroundClasses()} rounded-full flex items-center justify-center`}>
            <Sparkles className="w-2 h-2 text-white" />
          </div>
          <h4 className="text-xs font-semibold text-gray-800">Recommendations</h4>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.id}
              className={`p-1 rounded-lg border transition-all duration-200 ${
                completedItems.includes(rec.id) 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
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
                  onClick={() => handleComplete(rec.id)}
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
              <p className="text-xs text-gray-600 leading-tight line-clamp-1">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1 pt-1 border-t border-gray-200">
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
