"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { CurrencyToggle, useCurrency, formatCurrency as formatCurrencyWithSymbol } from "@/components/ui/currency-toggle";
import { 
  Search, 
  Filter, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign,
  MoreHorizontal,
  Edit,
  BarChart3
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { DataTable } from "@/components/ui/data-table";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";

interface Product {
  id: string;
  name: string;
  sku: string;
  uomBase: string;
  active: boolean;
  price: number;
  originalPrice?: number;
  originalPriceCurrency?: string;
  originalCostCurrency?: string;
  baseCurrency?: string;
  importCurrency: string;
  stockItem?: {
    id: string;
    productId: string;
    quantity: number;
    reserved: number;
    available: number;
    averageCost: number;
    totalValue: number;
    reorderPoint: number;
    warehouseId?: string;
    createdAt: string;
    updatedAt: string;
    warehouse?: {
      id: string;
      name: string;
      code: string;
    };
  };
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function StockPage() {
  const { currency, changeCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStockItems, setSelectedStockItems] = useState<string[]>([]);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success } = useToast();

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Restock critical items',
      description: 'Several products are below reorder point and need immediate restocking.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Review slow-moving inventory',
      description: 'Identify products with low turnover rates for optimization.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Optimize warehouse layout',
      description: 'Reorganize stock placement based on product movement patterns.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stockItem && p.stockItem.available > p.stockItem.reorderPoint).length;
  const lowStockProducts = products.filter(p => p.stockItem && p.stockItem.available > 0 && p.stockItem.available <= p.stockItem.reorderPoint).length;
  const outOfStockProducts = products.filter(p => !p.stockItem || p.stockItem.available === 0).length;
  const totalInventoryCost = products.reduce((sum, p) => sum + (p.stockItem?.totalValue || 0), 0);

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success("Recommendation completed! Great job!");
  };

  const getStockStatus = (product: Product) => {
    if (!product.stockItem) return { status: "No Stock", color: "bg-gray-100 text-gray-800" };
    if (product.stockItem.available === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (product.stockItem.available <= product.stockItem.reorderPoint) return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Loading stock data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Overview</h1>
            <p className="text-gray-600">View stock levels for all products</p>
          </div>
          <CurrencyToggle value={currency} onChange={changeCurrency} />
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Inventory Management AI"
              subtitle="Your intelligent assistant for stock optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <Package className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-xl font-bold text-green-600">{inStockProducts}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-xl font-bold text-orange-600">{lowStockProducts}</p>
                </div>
                <div className="p-2 rounded-full bg-orange-100">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-xl font-bold text-red-600">{outOfStockProducts}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrencyWithSymbol(totalInventoryCost, currency, 'USD')}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products Stock ({totalProducts})</CardTitle>
            <CardDescription>
              Click on any product to view detailed stock movements
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={products}
              enableSelection={true}
              selectedItems={selectedStockItems}
              onSelectionChange={setSelectedStockItems}
              bulkActions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { downloadCSV } = await import('@/lib/export-utils');
                        const exportData = products
                          .filter(p => selectedStockItems.includes(p.id))
                          .map(product => ({
                            'Product Name': product.name,
                            'SKU': product.sku,
                            'Category': product.category?.name || 'Uncategorized',
                            'Available Stock': product.available,
                            'Reserved': product.reserved,
                            'Unit Price': product.unitPrice,
                            'Average Cost': product.averageCost,
                            'Total Value': product.totalValue,
                            'Reorder Point': product.reorderPoint,
                            'Warehouse': product.warehouse?.name || 'N/A',
                            'Status': product.available > 0 ? 'In Stock' : 'Out of Stock'
                          }));
                        downloadCSV(exportData, `stock_export_${new Date().toISOString().split('T')[0]}.csv`);
                        success(`Successfully exported ${selectedStockItems.length} stock item(s)`);
                      } catch (error) {
                        success('Export functionality coming soon!');
                      }
                    }}
                    disabled={selectedStockItems.length === 0}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => success('Adjust stock functionality coming soon!')}
                    disabled={selectedStockItems.length === 0}
                  >
                    Adjust Stock
                  </Button>
                </div>
              }
              columns={[
                {
                  key: 'product',
                  label: 'Product',
                  render: (product) => (
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku}</div>
                    </div>
                  )
                },
                {
                  key: 'category',
                  label: 'Category',
                  render: (product) => (
                    <span className="text-sm text-gray-600">
                      {product.category?.name || 'No Category'}
                    </span>
                  )
                },
                {
                  key: 'stockLevel',
                  label: 'Stock Level',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {product.stockItem?.quantity || 0} {product.uomBase}
                    </div>
                  )
                },
                {
                  key: 'available',
                  label: 'Available',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {product.stockItem?.available || 0}
                    </div>
                  )
                },
                {
                  key: 'reserved',
                  label: 'Reserved',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {product.stockItem?.reserved || 0}
                    </div>
                  )
                },
                {
                  key: 'unitPrice',
                  label: 'Unit Price',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {formatCurrencyWithSymbol(product.price || 0, currency, product.originalPriceCurrency || product.baseCurrency || 'GHS')}
                    </div>
                  )
                },
                {
                  key: 'avgCost',
                  label: 'Avg Cost',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {formatCurrencyWithSymbol(product.stockItem?.averageCost || 0, currency, product.originalCostCurrency || product.importCurrency || 'USD')}
                    </div>
                  )
                },
                {
                  key: 'reorderPoint',
                  label: 'Reorder Point',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {product.stockItem?.reorderPoint || 0} {product.uomBase}
                    </div>
                  )
                },
                {
                  key: 'warehouse',
                  label: 'Warehouse',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {product.stockItem?.warehouse?.name || 'No Warehouse'}
                    </div>
                  )
                },
                {
                  key: 'costValue',
                  label: 'Cost Value',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {formatCurrencyWithSymbol(product.stockItem?.totalValue || 0, currency, product.originalCostCurrency || product.importCurrency || 'USD')}
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    );
                  }
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
                          label: "View Details",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => window.open(`/products/${product.id}`, '_blank')
                        },
                        {
                          label: "Edit Product",
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => window.open(`/products/${product.id}`, '_blank')
                        },
                        {
                          label: "Stock Movements",
                          icon: <BarChart3 className="h-4 w-4" />,
                          onClick: () => window.open(`/products/${product.id}/stock-movements`, '_blank')
                        }
                      ]}
                    />
                  )
                }
              ]}
              itemsPerPage={10}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}