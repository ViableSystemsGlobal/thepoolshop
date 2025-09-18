"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { DataTable } from "@/components/ui/data-table";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  Filter, 
  Download, 
  Plus,
  ShoppingCart,
  Target,
  RefreshCw,
  Eye,
  Edit,
  MoreHorizontal,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Hash,
  Building,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface BackorderProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  price?: number;
  cost?: number;
  baseCurrency: string;
  stockStatus: 'out-of-stock' | 'low-stock' | 'in-stock';
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  maxReorderPoint: number;
  totalValue: number;
  stockItems: Array<{
    id: string;
    warehouse?: {
      id: string;
      name: string;
      code: string;
    };
    quantity: number;
    available: number;
    reserved: number;
    reorderPoint: number;
    averageCost: number;
    totalValue: number;
  }>;
  lastUpdated: string;
}

interface BackorderSummary {
  total: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
  criticalItems: number;
}

export default function BackordersPage() {
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();

  const [products, setProducts] = useState<BackorderProduct[]>([]);
  const [summary, setSummary] = useState<BackorderSummary>({
    total: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
    criticalItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [warehouses, setWarehouses] = useState<Array<{id: string, name: string, code: string}>>([]);

  // AI Recommendations for backorders
  const aiRecommendations = [
    {
      id: 'urgent-reorder',
      title: 'Urgent Reorder Required',
      description: `${summary.criticalItems} critical items need immediate attention`,
      priority: 'high' as const,
      completed: false
    },
    {
      id: 'optimize-reorder-points',
      title: 'Optimize Reorder Points',
      description: 'Review and adjust reorder points based on demand patterns',
      priority: 'medium' as const,
      completed: false
    },
    {
      id: 'supplier-negotiation',
      title: 'Supplier Negotiation',
      description: 'Negotiate better terms for frequently out-of-stock items',
      priority: 'medium' as const,
      completed: false
    }
  ];

  const handleRecommendationComplete = (id: string) => {
    success(`Recommendation "${id}" marked as completed!`);
  };

  const fetchBackorders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append('status', selectedStatus);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedWarehouse) params.append('warehouse', selectedWarehouse);

      const response = await fetch(`/api/backorders?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch backorders');
      }
      const data = await response.json();
      setProducts(data.products || []);
      setSummary(data.summary || summary);
    } catch (error) {
      console.error('Error fetching backorders:', error);
      showError('Failed to load backorders data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.warehouses || []);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  useEffect(() => {
    fetchBackorders();
    fetchCategories();
    fetchWarehouses();
  }, [selectedStatus, selectedCategory, selectedWarehouse]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStockStatusInfo = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> };
      case 'low-stock':
        return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-4 w-4" /> };
      default:
        return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> };
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      const items = selectedItems.map(itemId => {
        const product = products.find(p => p.id === itemId);
        return {
          productId: itemId,
          productName: product?.name,
          warehouseId: product?.stockItems[0]?.warehouse?.id,
          newReorderPoint: product?.maxReorderPoint ? product.maxReorderPoint * 1.5 : 10,
          quantity: product?.maxReorderPoint ? Math.ceil(product.maxReorderPoint * 2) : 20,
          unitCost: product?.cost || 0
        };
      });

      const response = await fetch('/api/backorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: bulkAction,
          items,
          notes: `Bulk ${bulkAction} for ${selectedItems.length} items`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process bulk action');
      }

      const result = await response.json();
      success(result.message);
      setIsBulkActionOpen(false);
      setSelectedItems([]);
      setBulkAction("");
      fetchBackorders();
    } catch (error) {
      console.error('Error processing bulk action:', error);
      showError('Failed to process bulk action');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['SKU', 'Product Name', 'Category', 'Stock Status', 'Total Stock', 'Available', 'Reorder Point', 'Total Value', 'Last Updated'].join(','),
      ...filteredProducts.map(product => [
        `"${product.sku}"`,
        `"${product.name}"`,
        `"${product.category.name}"`,
        `"${getStockStatusInfo(product.stockStatus).label}"`,
        product.totalStock,
        product.totalAvailable,
        product.maxReorderPoint,
        product.totalValue,
        new Date(product.lastUpdated).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backorders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Loading backorders...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backorders</h1>
            <p className="text-gray-600">Manage out-of-stock and low-stock products</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button 
              onClick={() => setIsFiltersOpen(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button 
              onClick={fetchBackorders}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Backorder Management AI"
              subtitle="Your intelligent assistant for inventory optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Items</p>
                  <p className="text-xl font-bold text-red-600">{summary.criticalItems}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-xl font-bold text-red-600">{summary.outOfStock}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-xl font-bold text-yellow-600">{summary.lowStock}</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-100">
                  <TrendingDown className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-orange-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(summary.totalValue)}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-orange-100">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Backorders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Backorder Products ({filteredProducts.length})</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Products that are out of stock or below reorder point
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                {selectedItems.length > 0 && (
                  <Button 
                    onClick={() => setIsBulkActionOpen(true)}
                    className={`${theme.buttonBackground} text-white`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Bulk Actions ({selectedItems.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredProducts}
              columns={[
                {
                  key: 'product',
                  label: 'Product',
                  render: (product) => (
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-purple-100 mr-3">
                        <Package className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'category',
                  label: 'Category',
                  render: (product) => (
                    <span className="text-sm text-gray-600">{product.category.name}</span>
                  )
                },
                {
                  key: 'stockStatus',
                  label: 'Status',
                  render: (product) => {
                    const statusInfo = getStockStatusInfo(product.stockStatus);
                    return (
                      <div className="flex items-center">
                        <div className={`p-1 rounded ${statusInfo.color}`}>
                          {statusInfo.icon}
                        </div>
                        <span className="ml-2 font-medium">{statusInfo.label}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'stock',
                  label: 'Stock',
                  render: (product) => (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.totalStock} {product.stockItems[0]?.warehouse?.code || 'pcs'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Available: {product.totalAvailable}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'reorderPoint',
                  label: 'Reorder Point',
                  render: (product) => (
                    <div className="text-sm text-gray-900">
                      {product.maxReorderPoint}
                    </div>
                  )
                },
                {
                  key: 'warehouses',
                  label: 'Warehouses',
                  render: (product) => (
                    <div className="space-y-1">
                      {product.stockItems.map((item, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Building className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-gray-600">
                            {item.warehouse?.name || 'No Warehouse'}: {item.available}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  key: 'value',
                  label: 'Value',
                  render: (product) => (
                    <div className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(product.totalValue)}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (product) => (
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "View Product",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => window.open(`/products/${product.id}`, '_blank')
                        },
                        {
                          label: "Adjust Stock",
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => {
                            // TODO: Implement stock adjustment
                            console.log('Adjust stock for', product.id);
                          }
                        },
                        {
                          label: "Create Purchase Order",
                          icon: <ShoppingCart className="h-4 w-4" />,
                          onClick: () => {
                            // TODO: Implement purchase order creation
                            console.log('Create PO for', product.id);
                          }
                        }
                      ]}
                    />
                  )
                }
              ]}
              itemsPerPage={10}
              enableSelection={true}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              getRowClassName={(product) => {
                if (product.stockStatus === 'out-of-stock') {
                  return 'bg-red-50 hover:bg-red-100';
                } else if (product.stockStatus === 'low-stock') {
                  return 'bg-yellow-50 hover:bg-yellow-100';
                }
                return '';
              }}
            />
          </CardContent>
        </Card>

        {/* Filters Modal */}
        {isFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <p className="text-sm text-gray-600">Filter backorder products</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFiltersOpen(false)}
                  className="h-8 w-8"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Stock Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedCategory("");
                      setSelectedWarehouse("");
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsFiltersOpen(false)}
                    className={theme.buttonBackground}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Modal */}
        {isBulkActionOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bulk Actions</h2>
                    <p className="text-sm text-gray-600">{selectedItems.length} items selected</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsBulkActionOpen(false)}
                  className="h-8 w-8"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Action</option>
                    <option value="adjust_reorder_point">Adjust Reorder Points</option>
                    <option value="create_purchase_order">Create Purchase Orders</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkActionOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className={theme.buttonBackground}
                  >
                    Execute Action
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
