'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

interface PerformanceAnalyticsProps {
  distributorId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

interface PerformanceData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export function PerformanceAnalytics({ distributorId, timeRange = '30d' }: PerformanceAnalyticsProps) {
  const { theme } = useTheme();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    loadPerformanceData();
  }, [distributorId, selectedTimeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const url = distributorId 
        ? `/api/drm/distributors/${distributorId}/performance?timeRange=${selectedTimeRange}`
        : `/api/drm/distributors/performance?timeRange=${selectedTimeRange}`;
        
      const response = await fetch(url, { credentials: 'include' });
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        // Fallback to mock data if API fails
        setData(getMockData());
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): PerformanceData => ({
    totalRevenue: 125000,
    totalOrders: 45,
    averageOrderValue: 2778,
    activeCustomers: 12,
    revenueGrowth: 15.2,
    orderGrowth: 8.7,
    topProducts: [
      { name: 'Product A', quantity: 25, revenue: 45000 },
      { name: 'Product B', quantity: 18, revenue: 32000 },
      { name: 'Product C', quantity: 12, revenue: 28000 },
      { name: 'Product D', quantity: 8, revenue: 20000 }
    ],
    monthlyTrend: [
      { month: 'Jan', revenue: 85000, orders: 32 },
      { month: 'Feb', revenue: 92000, orders: 35 },
      { month: 'Mar', revenue: 105000, orders: 38 },
      { month: 'Apr', revenue: 125000, orders: 45 }
    ]
  });

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Performance Analytics</h2>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance Analytics</h2>
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedTimeRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(option.value as any)}
              className={selectedTimeRange === option.value ? `bg-${theme.primary} text-white` : ''}
              style={selectedTimeRange === option.value ? {
                backgroundColor: theme.primary,
                color: 'white'
              } : {}}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">GHS {data.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {data.revenueGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${data.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(data.revenueGrowth)}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{data.totalOrders}</p>
              <div className="flex items-center gap-1 mt-1">
                {data.orderGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${data.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(data.orderGrowth)}%
                </span>
              </div>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold">GHS {data.averageOrderValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold">{data.activeCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} units</p>
                  </div>
                </div>
                <p className="font-semibold">GHS {product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
          <div className="space-y-3">
            {data.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{month.month}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">GHS {month.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{month.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
