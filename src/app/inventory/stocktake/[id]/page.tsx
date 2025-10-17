'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { useTheme } from '@/contexts/theme-context';
import { 
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useToast } from '@/contexts/toast-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StocktakeItem {
  id: string;
  productId: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  notes?: string;
  product: {
    id: string;
    sku: string;
    name: string;
    barcode: string;
    uomBase: string;
  };
  stockItem: {
    quantity: number;
    available: number;
  };
}

interface StocktakeSession {
  id: string;
  sessionNumber: string;
  name: string;
  status: string;
  startedAt: string;
  warehouse: {
    id: string;
    name: string;
  };
  items: StocktakeItem[];
}

export default function StocktakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [session, setSession] = useState<StocktakeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [countedQty, setCountedQty] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
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
    const loadParams = async () => {
      const resolvedParams = await params;
      setSessionId(resolvedParams.id);
    };
    loadParams();
  }, [params]);
  
  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);
  
  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch(`/api/inventory/stocktake/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else {
        showError('Stocktake session not found');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      showError('Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBarcodeScan = (barcode: string, product: any) => {
    if (product) {
      setCurrentProduct(product);
      // Check if already counted
      const existingItem = session?.items.find(item => item.productId === product.id);
      if (existingItem) {
        setCountedQty(existingItem.countedQuantity);
        setItemNotes(existingItem.notes || '');
      } else {
        setCountedQty(0);
        setItemNotes('');
      }
    } else {
      showError(`Product not found: ${barcode}`);
    }
  };
  
  const saveCount = async () => {
    if (!currentProduct) {
      showError('Please scan a product first');
      return;
    }
    
    if (countedQty < 0) {
      showError('Counted quantity cannot be negative');
      return;
    }
    
    if (!sessionId) {
      showError('Session not loaded');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/inventory/stocktake/${sessionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          countedQuantity: countedQty,
          notes: itemNotes,
          barcode: currentProduct.barcode
        })
      });
      
      if (response.ok) {
        success(`✓ Counted: ${currentProduct.name}`);
        fetchSession(); // Refresh
        setCurrentProduct(null);
        setCountedQty(0);
        setItemNotes('');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to save count');
      }
    } catch (error) {
      console.error('Error saving count:', error);
      showError('Failed to save count');
    } finally {
      setIsSaving(false);
    }
  };
  
  const completeStocktake = async () => {
    if (!confirm('Complete this stocktake? This will create stock adjustments for all variances.')) {
      return;
    }
    
    if (!sessionId) {
      showError('Session not loaded');
      return;
    }
    
    try {
      const response = await fetch(`/api/inventory/stocktake/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      
      if (response.ok) {
        success('Stocktake completed! Stock adjustments created.');
        router.push('/inventory/stocktake');
      } else {
        showError('Failed to complete stocktake');
      }
    } catch (error) {
      console.error('Error completing stocktake:', error);
      showError('Failed to complete stocktake');
    }
  };
  
  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">Loading...</div>
      </>
    );
  }
  
  if (!session) {
    return (
      <>
        <div className="text-center py-12 text-red-500">Session not found</div>
      </>
    );
  }
  
  const totalVariance = session.items.reduce((sum, item) => sum + Math.abs(item.variance), 0);
  const itemsWithVariance = session.items.filter(item => item.variance !== 0).length;
  
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/inventory/stocktake">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{session.name}</h1>
              <p className="text-gray-600">{session.sessionNumber} • {session.warehouse.name}</p>
            </div>
          </div>
          
          {session.status === 'IN_PROGRESS' && (
            <Button 
              onClick={completeStocktake} 
              className={`gap-2 text-white ${getButtonBackgroundClasses()}`}
            >
              <CheckCircle className="h-4 w-4" />
              Complete Stocktake
            </Button>
          )}
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Counted</p>
                  <p className="text-2xl font-bold">{session.items.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Variance</p>
                  <p className="text-2xl font-bold">{itemsWithVariance}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Variance</p>
                  <p className="text-2xl font-bold">{totalVariance.toFixed(0)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Scanning Section */}
        {session.status === 'IN_PROGRESS' && (
          <Card>
            <CardHeader>
              <CardTitle>Scan & Count</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <BarcodeScanner
                  onScan={handleBarcodeScan}
                  autoLookup={true}
                  title="Scan Product for Counting"
                  description="Scan the product barcode to record physical count"
                />
                <div className="text-sm text-gray-500 flex items-center">
                  Or search manually in the list below
                </div>
              </div>
              
              {currentProduct && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{currentProduct.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {currentProduct.sku}</p>
                      <p className="text-sm text-gray-600">
                        System Qty: {currentProduct.stockItems?.[0]?.quantity || 0} {currentProduct.uomBase}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Counted Quantity *</label>
                        <Input
                          type="number"
                          value={countedQty}
                          onChange={(e) => setCountedQty(Number(e.target.value))}
                          min="0"
                          step="0.01"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Variance</label>
                        <div className={`p-2 border rounded-md font-bold ${
                          countedQty - (currentProduct.stockItems?.[0]?.quantity || 0) > 0 
                            ? 'text-green-600 bg-green-50' 
                            : countedQty - (currentProduct.stockItems?.[0]?.quantity || 0) < 0
                            ? 'text-red-600 bg-red-50'
                            : 'text-gray-600'
                        }`}>
                          {countedQty - (currentProduct.stockItems?.[0]?.quantity || 0) > 0 && '+'}
                          {countedQty - (currentProduct.stockItems?.[0]?.quantity || 0)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                      <Input
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        placeholder="Any observations..."
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={saveCount}
                        disabled={isSaving}
                        className="flex-1 gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Count'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentProduct(null);
                          setCountedQty(0);
                          setItemNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Counted Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Counted Items ({session.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {session.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items counted yet. Scan products to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-right py-3 px-4">System</th>
                      <th className="text-right py-3 px-4">Counted</th>
                      <th className="text-right py-3 px-4">Variance</th>
                      <th className="text-left py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.items.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-gray-500">{item.product.sku}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.systemQuantity} {item.product.uomBase}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {item.countedQuantity} {item.product.uomBase}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                            item.variance > 0 
                              ? 'bg-green-100 text-green-800' 
                              : item.variance < 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.variance > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : item.variance < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {item.variance > 0 && '+'}{item.variance}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

