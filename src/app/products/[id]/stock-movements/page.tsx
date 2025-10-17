"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Search, 
  Filter, 
  Package, 
  TrendingUp, 
  TrendingDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Eye,
  Download
} from "lucide-react";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reference?: string;
  reason?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  origin?: string; // e.g., "Vendor ABC", "Warehouse Main", "Customer Return"
  product: {
    id: string;
    name: string;
    sku: string;
    uomBase: string;
  };
  stockItem: {
    id: string;
    quantity: number;
    available: number;
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  fromWarehouse?: {
    id: string;
    name: string;
    code: string;
  };
  toWarehouse?: {
    id: string;
    name: string;
    code: string;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
}

export default function ProductStockMovementsPage() {
  const params = useParams();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");

  // AI Recommendations for stock movements
  const aiRecommendations = [
    {
      id: 'reorder-point',
      title: 'Set Reorder Point',
      description: 'Based on movement patterns, set automated reorder notifications',
      priority: 'high' as const,
      completed: false
    },
    {
      id: 'demand-forecast',
      title: 'Improve Demand Forecasting',
      description: 'Review supplier lead times to optimize stock levels',
      priority: 'medium' as const,
      completed: false
    },
    {
      id: 'adjustment-review',
      title: 'Review Adjustments',
      description: 'High frequency of adjustments indicates potential inventory issues',
      priority: 'high' as const,
      completed: false
    }
  ];

  const handleRecommendationComplete = (id: string) => {
    success(`Recommendation "${id}" marked as completed!`);
  };

  const movementTypes = [
    { value: "RECEIPT", label: "Receipt", icon: <ArrowDown className="h-4 w-4" />, color: "text-green-600" },
    { value: "ADJUSTMENT", label: "Adjustment", icon: <RotateCcw className="h-4 w-4" />, color: "text-blue-600" },
    { value: "TRANSFER_IN", label: "Transfer In", icon: <ArrowRightLeft className="h-4 w-4" />, color: "text-purple-600" },
    { value: "TRANSFER_OUT", label: "Transfer Out", icon: <ArrowRightLeft className="h-4 w-4" />, color: "text-orange-600" },
    { value: "SALE", label: "Sale", icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-600" },
    { value: "RETURN", label: "Return", icon: <ArrowUp className="h-4 w-4" />, color: "text-cyan-600" },
    { value: "DAMAGE", label: "Damage", icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600" },
    { value: "THEFT", label: "Theft", icon: <XCircle className="h-4 w-4" />, color: "text-red-700" },
    { value: "EXPIRY", label: "Expiry", icon: <Calendar className="h-4 w-4" />, color: "text-yellow-600" },
    { value: "OTHER", label: "Other", icon: <FileText className="h-4 w-4" />, color: "text-gray-600" }
  ];


  const fetchProduct = async () => {
    try {
      setIsProductLoading(true);
      console.log('Fetching product with ID:', params.id);
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Product data received:', data);
        setProduct(data);
      } else {
        console.error('Failed to fetch product:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsProductLoading(false);
    }
  };

  const fetchMovements = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("productId", params.id as string);
      if (selectedType !== "all") {
        queryParams.append("type", selectedType);
        console.log('Filtering by type:', selectedType);
      }

      const url = `/api/stock-movements?${queryParams}`;
      console.log('Fetching movements from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Received movements:', data.movements?.length || 0);
        setMovements(data.movements || []);
      } else {
        console.error('Failed to fetch stock movements');
      }
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, selectedType]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchMovements();
    }
  }, [params.id, selectedType, fetchMovements]);

  // Debug: Log when selectedType changes
  useEffect(() => {
    console.log('selectedType changed to:', selectedType);
  }, [selectedType]);

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find(t => t.value === type) || movementTypes[movementTypes.length - 1];
  };

  const filteredMovements = movements.filter(movement => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      movement.reference?.toLowerCase().includes(searchLower) ||
      movement.reason?.toLowerCase().includes(searchLower) ||
      movement.notes?.toLowerCase().includes(searchLower);
    
    // Date filtering
    const movementDate = new Date(movement.createdAt);
    const matchesDateFrom = !dateFrom || movementDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || movementDate <= new Date(dateTo + 'T23:59:59');
    
    // Warehouse filtering
    const matchesWarehouse = selectedWarehouse === "all" || 
      (selectedWarehouse === "main" && movement.warehouse?.name === "Main Warehouse") ||
      (selectedWarehouse === "retail" && movement.warehouse?.name === "Retail Store") ||
      (selectedWarehouse === "poolshop" && movement.warehouse?.name === "PoolShop Main");
    
    // Type filtering is handled server-side, so we only need to filter by search term, date, and warehouse
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesWarehouse;
  });

  const getQuantityColor = (quantity: number) => {
    return quantity > 0 ? "text-green-600" : "text-red-600";
  };

  const getQuantityIcon = (quantity: number) => {
    return quantity > 0 ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
  };

  // Helper function to get proper focus ring classes
  const getFocusRingClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'focus-visible:ring-purple-500',
      'blue-600': 'focus-visible:ring-blue-500',
      'green-600': 'focus-visible:ring-green-500',
      'orange-600': 'focus-visible:ring-orange-500',
      'red-600': 'focus-visible:ring-red-500',
      'indigo-600': 'focus-visible:ring-indigo-500',
      'pink-600': 'focus-visible:ring-pink-500',
      'teal-600': 'focus-visible:ring-teal-500',
    };
    return colorMap[theme.primary] || 'focus-visible:ring-blue-500';
  };

  // Export function for stock movements
  const handleExport = () => {
    const csvContent = [
      // CSV Header
      ['Type', 'Quantity', 'Reference', 'Reason', 'Notes', 'Date', 'Origin/Destination'].join(','),
      // CSV Data
      ...filteredMovements.map(movement => {
        const typeInfo = getMovementTypeInfo(movement.type);
        const origin = movement.type === 'TRANSFER' 
          ? `${movement.fromWarehouse?.name || 'Unknown'} → ${movement.toWarehouse?.name || 'Unknown'}`
          : movement.warehouse?.name || 'Unknown';
        
        return [
          `"${typeInfo.label}"`,
          movement.quantity,
          `"${movement.reference || ''}"`,
          `"${movement.reason || ''}"`,
          `"${movement.notes || ''}"`,
          new Date(movement.createdAt).toLocaleDateString(),
          `"${origin}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-movements-${product?.name || 'product'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || isProductLoading) {
    return (
      <>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading stock movements...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/products/${params.id}`)}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Stock Movements - {isProductLoading ? 'Loading...' : (product?.name || 'Unknown Product')}
              </h1>
              <p className="text-gray-600">SKU: {isProductLoading ? 'Loading...' : (product?.sku || 'N/A')}</p>
            </div>
          </div>
        </div>

        {/* AI Card and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - 2/3 width */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Stock Movement Insights"
              subtitle="Your intelligent assistant for inventory optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - 1/3 width */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Movements</p>
                  <p className={`text-xl font-bold text-${theme.primary}`}>{movements.length}</p>
                </div>
                <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                  <Package className={`w-5 h-5 text-${theme.primary}`} />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Ins</p>
                  <p className="text-xl font-bold text-green-600">
                    {movements.filter(m => m.quantity > 0).length}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Outs</p>
                  <p className="text-xl font-bold text-red-600">
                    {movements.filter(m => m.quantity < 0).length}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Adjustments</p>
                  <p className="text-xl font-bold text-blue-600">
                    {movements.filter(m => m.type === 'ADJUSTMENT').length}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Movements Table with Search */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Movements ({filteredMovements.length})</CardTitle>
            <CardDescription>
              Complete history of stock movements for {product?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by reference, reason, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 focus-visible:ring-2 focus-visible:ring-offset-2 ${getFocusRingClasses()}`}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      console.log('Select changed to:', e.target.value);
                      setSelectedType(e.target.value);
                    }}
                    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getFocusRingClasses().replace('focus-visible:ring-', 'focus:ring-')} bg-white text-gray-900`}
                  >
                    <option value="all">All Types</option>
                    {movementTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1"
                    onClick={() => setShowMoreFilters(true)}
                  >
                    <Filter className="h-4 w-4" />
                    <span>More Filters</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                  
                  <Dialog open={showMoreFilters} onOpenChange={setShowMoreFilters}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>More Filters</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date From
                          </label>
                          <Input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (dateTo && selectedDate && new Date(selectedDate) > new Date(dateTo)) {
                                // If selected date is after date to, clear date to
                                setDateTo("");
                              }
                              setDateFrom(selectedDate);
                            }}
                            className={getFocusRingClasses()}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date To
                          </label>
                          <Input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (dateFrom && selectedDate && new Date(selectedDate) < new Date(dateFrom)) {
                                // If selected date is before date from, clear it
                                setDateTo("");
                              } else {
                                setDateTo(selectedDate);
                              }
                            }}
                            className={getFocusRingClasses()}
                          />
                          {dateFrom && dateTo && new Date(dateTo) < new Date(dateFrom) && (
                            <p className="text-red-500 text-xs mt-1">Date To cannot be before Date From</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warehouse
                          </label>
                          <select
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getFocusRingClasses().replace('focus-visible:ring-', 'focus:ring-')} bg-white text-gray-900`}
                          >
                            <option value="all">All Warehouses</option>
                            <option value="main">Main Warehouse</option>
                            <option value="retail">Retail Store</option>
                            <option value="poolshop">PoolShop Main</option>
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDateFrom("");
                              setDateTo("");
                              setSelectedWarehouse("all");
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            onClick={() => setShowMoreFilters(false)}
                            className={`bg-${getThemeClasses().primary} hover:bg-${getThemeClasses().primaryDark} text-white`}
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <DataTable
              data={filteredMovements}
              columns={[
                {
                  key: 'type',
                  label: 'Type',
                  render: (movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type);
                    return (
                      <div className="flex items-center">
                        <div className={`p-1 rounded ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </div>
                        <span className="ml-2 font-medium">{typeInfo.label}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'quantity',
                  label: 'Quantity',
                  render: (movement) => (
                    <div className={`flex items-center font-medium ${getQuantityColor(movement.quantity)}`}>
                      {getQuantityIcon(movement.quantity)}
                      <span className="ml-1">
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.uomBase}
                      </span>
                    </div>
                  )
                },
      {
        key: 'origin',
        label: 'Origin/Destination',
        render: (movement) => {
                    // Generate origin based on movement type and warehouse information
                    const getOrigin = () => {
                      switch (movement.type) {
                        case 'RECEIPT':
                          return 'Supplier';
                        case 'SALE':
                          return 'Customer';
                        case 'TRANSFER_IN':
                          return movement.warehouse?.name || 'Unknown Warehouse';
                        case 'TRANSFER_OUT':
                          return movement.warehouse?.name || 'Unknown Warehouse';
                        case 'TRANSFER':
                          // For combined transfer type, show both warehouses
                          if (movement.fromWarehouse && movement.toWarehouse) {
                            return `${movement.fromWarehouse.name} → ${movement.toWarehouse.name}`;
                          } else if (movement.fromWarehouse) {
                            return `${movement.fromWarehouse.name} → Other`;
                          } else if (movement.toWarehouse) {
                            return `Other → ${movement.toWarehouse.name}`;
                          }
                          return 'Warehouse Transfer';
                        case 'RETURN':
                          return 'Customer Return';
                        case 'ADJUSTMENT':
                          return movement.warehouse?.name || 'System Adjustment';
                        case 'DAMAGE':
                        case 'THEFT':
                        case 'EXPIRY':
                          return movement.warehouse?.name || 'Internal';
                        default:
                          return movement.warehouse?.name || 'Unknown';
                      }
                    };

                    return (
                      <span className="text-sm text-gray-600">
                        {movement.origin || getOrigin()}
                      </span>
                    );
                  }
                },
                {
                  key: 'reference',
                  label: 'Reference',
                  render: (movement) => (
                    <span className="text-sm text-gray-600">
                      {movement.reference || '-'}
                    </span>
                  )
                },
                {
                  key: 'reason',
                  label: 'Reason',
                  render: (movement) => (
                    <span className="text-sm text-gray-600">
                      {movement.reason || '-'}
                    </span>
                  )
                },
                {
                  key: 'date',
                  label: 'Date',
                  render: (movement) => (
                    <div>
                      <div className="text-sm text-gray-600">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'stockAfter',
                  label: 'Stock After',
                  render: (movement) => (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {(() => {
                          // Show current stock level
                          return movement.stockItem.quantity;
                        })()} {movement.product.uomBase}
                      </div>
                      <div className="text-xs text-gray-500">
                        Available: {movement.stockItem.available}
                      </div>
                    </div>
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
