'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { useTheme } from '@/contexts/theme-context';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/contexts/toast-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StocktakeSession {
  id: string;
  sessionNumber: string;
  name: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  warehouse: {
    id: string;
    name: string;
  };
  _count: {
    items: number;
  };
}

export default function StocktakePage() {
  const [sessions, setSessions] = useState<StocktakeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const { success, error: showError } = useToast();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  // Helper function to get proper button background classes
  const getButtonBackgroundClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'bg-purple-600 hover:bg-purple-700',
      'blue-600': 'bg-blue-600 hover:bg-blue-700',
      'green-600': 'bg-green-600 hover:bg-green-700',
      'orange-600': 'bg-orange-600 hover:bg-orange-700',
      'red-600': 'bg-red-600 hover:bg-red-700',
      'indigo-600': 'bg-indigo-600 hover:bg-indigo-700',
      'pink-600': 'bg-pink-600 hover:bg-pink-700',
      'teal-600': 'bg-teal-600 hover:bg-teal-700',
    };
    return colorMap[theme.primary] || 'bg-blue-600 hover:bg-blue-700';
  };
  
  useEffect(() => {
    fetchSessions();
    fetchWarehouses();
  }, []);
  
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/inventory/stocktake');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.stocktakes || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.warehouses || []);
        if (data.warehouses?.length > 0) {
          setSelectedWarehouse(data.warehouses[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };
  
  const createSession = async () => {
    if (!selectedWarehouse) {
      showError('Please select a warehouse');
      return;
    }
    
    try {
      const response = await fetch('/api/inventory/stocktake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: selectedWarehouse,
          name: newSessionName || `Stocktake ${new Date().toLocaleDateString()}`,
          notes: ''
        })
      });
      
      if (response.ok) {
        const newSession = await response.json();
        success('Stocktake session created');
        router.push(`/inventory/stocktake/${newSession.id}`);
      } else {
        showError('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      showError('Failed to create session');
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const badges: any = {
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Physical Inventory Count</h1>
            <p className="text-gray-600">Scan products to perform stocktake and count physical inventory</p>
          </div>
          
          <Button 
            onClick={() => setShowNewSessionDialog(true)} 
            className={`gap-2 text-white ${getButtonBackgroundClasses()}`}
          >
            <Plus className="h-4 w-4" />
            New Stocktake
          </Button>
        </div>
        
        {/* New Session Dialog */}
        {showNewSessionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Stocktake Session</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Name</label>
                  <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder={`Stocktake ${new Date().toLocaleDateString()}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Warehouse *</label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewSessionDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createSession}
                  className={`flex-1 text-white ${getButtonBackgroundClasses()}`}
                >
                  Create & Start
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Sessions List */}
        {isLoading ? (
          <div className="text-center py-12">Loading sessions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(session => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(session.status)}
                      <div>
                        <CardTitle className="text-base">{session.name}</CardTitle>
                        <p className="text-xs text-gray-500">{session.sessionNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(session.status)}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Warehouse:</span>
                      <span className="font-medium">{session.warehouse.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Counted:</span>
                      <span className="font-medium">{session._count.items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {session.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">
                          {new Date(session.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Link href={`/inventory/stocktake/${session.id}`}>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        {session.status === 'IN_PROGRESS' ? 'Continue Counting' : 'View Details'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && sessions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No stocktake sessions yet</p>
              <p className="text-sm text-gray-400 mt-2">Create one to start counting inventory</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

