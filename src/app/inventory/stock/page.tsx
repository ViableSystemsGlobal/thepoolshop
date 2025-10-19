"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  BarChart3,
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";

interface Product {
  id: string;
  name: string;
  sku: string;
  uomBase: string;
  active: boolean;
  price: number;
  cost: number;
  originalPrice?: number;
  originalPriceCurrency?: string;
  originalCostCurrency?: string;
  baseCurrency?: string;
  importCurrency: string;
  stockItems?: Array<{
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
  }>;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

// Component that uses useSearchParams
function StockPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency, changeCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStockItems, setSelectedStockItems] = useState<string[]>([]);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success } = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Read URL parameters on mount
  useEffect(() => {
    const stockStatusParam = searchParams.get('stockStatus');
    if (stockStatusParam) {
      setStockStatus(stockStatusParam);
    }
  }, [searchParams]);

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

  const handleViewProduct = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

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
  const inStockProducts = products.filter(p => {
    const totalAvailable = p.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
    return totalAvailable > 0;
  }).length;
  const lowStockProducts = products.filter(p => {
    const totalAvailable = p.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
    const maxReorderPoint = p.stockItems?.reduce((max, item) => Math.max(max, item.reorderPoint), 0) || 0;
    return totalAvailable > 0 && totalAvailable <= maxReorderPoint;
  }).length;
  const outOfStockProducts = products.filter(p => {
    const totalAvailable = p.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
    return totalAvailable === 0;
  }).length;
  const totalInventoryCost = products.reduce((sum, p) => {
    const stockValue = p.stockItems?.reduce((sum, item) => {
      // Convert USD to GHS if needed (assuming cost is in USD when importCurrency is null)
      const costInUSD = item.averageCost || 0;
      const quantity = item.quantity || 0;
      const usdToGhsRate = 12.5; // USD to GHS conversion rate
      const valueInGHS = (costInUSD * quantity) * usdToGhsRate;
      return sum + valueInGHS;
    }, 0) || 0;
    return sum + stockValue;
  }, 0);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.sku.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && product.category?.id !== selectedCategory) {
      return false;
    }

    // Stock status filter
    if (stockStatus !== "all") {
      const totalAvailable = product.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
      const maxReorderPoint = product.stockItems?.reduce((max, item) => Math.max(max, item.reorderPoint), 0) || 0;
      
      if (stockStatus === "in-stock" && totalAvailable <= maxReorderPoint) return false;
      // "low-stock" should include BOTH out of stock (0) AND low stock (below reorder point)
      if (stockStatus === "low-stock" && totalAvailable > maxReorderPoint) return false;
      if (stockStatus === "out-of-stock" && totalAvailable > 0) return false;
    }

    // Price range filter
    if (priceRange.min && product.price && product.price < parseFloat(priceRange.min)) return false;
    if (priceRange.max && product.price && product.price > parseFloat(priceRange.max)) return false;

    return true;
  });

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success("Recommendation completed! Great job!");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStockStatus("all");
    setPriceRange({ min: "", max: "" });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== "all") count++;
    if (stockStatus !== "all") count++;
    if (priceRange.min || priceRange.max) count++;
    return count;
  };

  const getStockStatus = (product: Product) => {
    const totalAvailable = product.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
    const maxReorderPoint = product.stockItems?.reduce((max, item) => Math.max(max, item.reorderPoint), 0) || 0;
    
    if (totalAvailable === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (totalAvailable <= maxReorderPoint) return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const getRowClassName = (product: Product) => {
    const totalAvailable = product.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
    const maxReorderPoint = product.stockItems?.reduce((max, item) => Math.max(max, item.reorderPoint), 0) || 0;
    
    // Highlight out of stock items in red
    if (totalAvailable === 0) {
      return "bg-red-50 hover:bg-red-100";
    }
    
    // Highlight low stock items in yellow
    if (totalAvailable > 0 && totalAvailable <= maxReorderPoint) {
      return "bg-yellow-50 hover:bg-yellow-100";
    }
    
    return "";
  };

  if (isLoading) {
    return (
      <>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Loading stock data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInventoryCost, 'GHS')}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-xl font-bold text-green-600">{inStockProducts}</p>
                  <p className="text-xs text-gray-500">out of {totalProducts} products</p>
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


        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products Stock ({filteredProducts.length})</CardTitle>
                <CardDescription>
                  Click on any product to view detailed stock movements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pb-0">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsMoreFiltersOpen(true)}
                >
                  More Filters
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </Button>
                
                <Dialog open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>More Filters</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Status
                        </label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={stockStatus}
                          onChange={(e) => setStockStatus(e.target.value)}
                        >
                          <option value="all">All Stock Status</option>
                          <option value="in-stock">In Stock</option>
                          <option value="low-stock">Low Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          />
                          <Input
                            type="number"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button 
                          variant="outline" 
                          onClick={handleClearFilters}
                          className="text-gray-600"
                        >
                          Clear All
                        </Button>
                        <Button 
                          onClick={() => setIsMoreFiltersOpen(false)}
                          className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
          <CardContent className="p-0">
            <DataTable
              data={filteredProducts}
              enableSelection={true}
              selectedItems={selectedStockItems}
              onSelectionChange={setSelectedStockItems}
              onRowClick={handleViewProduct}
              getRowClassName={getRowClassName}
              bulkActions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { downloadCSV } = await import('@/lib/export-utils');
                        const exportData = filteredProducts
                          .filter(p => selectedStockItems.includes(p.id))
                          .map(product => {
                            const totalAvailable = product.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
                            const totalReserved = product.stockItems?.reduce((sum, item) => sum + item.reserved, 0) || 0;
                            const totalQuantity = product.stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                            const totalValue = totalQuantity * (product.cost || 0);
                            const maxReorderPoint = product.stockItems?.reduce((max, item) => Math.max(max, item.reorderPoint), 0) || 0;
                            const warehouseNames = product.stockItems?.map(item => item.warehouse?.name).filter(Boolean) || [];
                            
                            return {
                              'Product Name': product.name,
                              'SKU': product.sku,
                              'Category': product.category?.name || 'Uncategorized',
                              'Available Stock': totalAvailable,
                              'Reserved': totalReserved,
                              'Unit Price': product.price || 0,
                              'Cost Price': product.cost || 0,
                              'Total Value': totalValue,
                              'Warehouse': warehouseNames.join(', ') || 'N/A',
                              'Status': totalAvailable > 0 ? 'In Stock' : 'Out of Stock'
                            };
                          });
                        downloadCSV(exportData, `stock_export_${new Date().toISOString().split('T')[0]}.csv`);
                        success(`Successfully exported ${selectedStockItems.length} stock item(s)`);
                      } catch (error) {
                        success('Export functionality coming soon!');
                      }
                    }}
                    disabled={selectedStockItems.length === 0}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Export
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => success('Adjust stock functionality coming soon!')}
                    disabled={selectedStockItems.length === 0}
                    className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  render: (product) => {
                    const totalQuantity = product.stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    return (
                      <div className="text-sm text-gray-600">
                        {totalQuantity} {product.uomBase}
                      </div>
                    );
                  }
                },
                {
                  key: 'available',
                  label: 'Available',
                  render: (product) => {
                    const totalAvailable = product.stockItems?.reduce((sum, item) => sum + item.available, 0) || 0;
                    return (
                      <div className="text-sm text-gray-600">
                        {totalAvailable}
                      </div>
                    );
                  }
                },
                {
                  key: 'reserved',
                  label: 'Reserved',
                  render: (product) => {
                    const totalReserved = product.stockItems?.reduce((sum, item) => sum + item.reserved, 0) || 0;
                    return (
                      <div className="text-sm text-gray-600">
                        {totalReserved}
                      </div>
                    );
                  }
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
                  key: 'costPrice',
                  label: 'Cost Price',
                  render: (product) => (
                    <div className="text-sm text-gray-600">
                      {formatCurrencyWithSymbol(product.cost || 0, currency, product.originalCostCurrency || product.importCurrency || 'USD')}
                    </div>
                  )
                },
                {
                  key: 'warehouse',
                  label: 'Warehouse',
                  render: (product) => {
                    const warehouseNames = product.stockItems?.map(item => item.warehouse?.name).filter(Boolean) || [];
                    return (
                      <div className="text-sm text-gray-600">
                        {warehouseNames.length > 0 ? (
                          <div className="space-y-1">
                            {warehouseNames.map((name, index) => (
                              <div key={index}>{name}</div>
                            ))}
                          </div>
                        ) : (
                          'No Warehouse'
                        )}
                      </div>
                    );
                  }
                },
                {
                  key: 'costValue',
                  label: 'Cost Value',
                  render: (product) => {
                    const stockValue = product.stockItems?.reduce((sum, item) => {
                      // Convert USD to GHS (consistent with metric calculation)
                      const costInUSD = item.averageCost || 0;
                      const quantity = item.quantity || 0;
                      const usdToGhsRate = 12.5; // USD to GHS conversion rate
                      const valueInGHS = (costInUSD * quantity) * usdToGhsRate;
                      return sum + valueInGHS;
                    }, 0) || 0;
                    return (
                      <div className="text-sm text-gray-600">
                        {formatCurrency(stockValue, 'GHS')}
                      </div>
                    );
                  }
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
    </>
  );
}

// Main export with Suspense boundary
export default function StockPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 ml-3">Loading stock data...</p>
        </div>
      </div>
    }>
      <StockPageContent />
    </Suspense>
  );
}