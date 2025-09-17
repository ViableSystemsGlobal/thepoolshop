"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/utils";
import { 
  Building, 
  MapPin, 
  Calendar, 
  Hash, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ArrowRightLeft,
  AlertTriangle,
  XCircle as XCircleIcon,
  FileText
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: {
    name: string;
  };
  stockItem: {
    quantity: number;
    averageCost: number;
    totalValue: number;
  };
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reference?: string;
  reason?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
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
}

export default function WarehouseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'products' | 'movements'>('products');

  const warehouseId = params.id as string;

  const fetchWarehouseDetails = async () => {
    try {
      const response = await fetch(`/api/warehouses/${warehouseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse details');
      }
      const data = await response.json();
      setWarehouse(data.warehouse);
    } catch (error) {
      console.error('Error fetching warehouse details:', error);
      showError('Failed to load warehouse details');
    }
  };

  const fetchWarehouseProducts = async () => {
    try {
      const response = await fetch(`/api/warehouses/${warehouseId}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching warehouse products:', error);
      showError('Failed to load warehouse products');
    }
  };

  const fetchWarehouseStockMovements = async () => {
    try {
      const response = await fetch(`/api/stock-movements?warehouseId=${warehouseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse stock movements');
      }
      const data = await response.json();
      setStockMovements(data.movements || []);
    } catch (error) {
      console.error('Error fetching warehouse stock movements:', error);
      showError('Failed to load warehouse stock movements');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchWarehouseDetails(),
        fetchWarehouseProducts(),
        fetchWarehouseStockMovements()
      ]);
      setIsLoading(false);
    };

    if (warehouseId) {
      loadData();
    }
  }, [warehouseId]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovements = stockMovements.filter(movement =>
    movement.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.stockItem?.totalValue || 0), 0);
  const totalQuantity = products.reduce((sum, product) => sum + (product.stockItem?.quantity || 0), 0);

  // Helper functions for stock movements
  const getMovementTypeInfo = (type: string) => {
    const types: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
      RECEIPT: { label: "Receipt", icon: <TrendingUp className="h-4 w-4" />, color: "bg-green-100 text-green-600" },
      SALE: { label: "Sale", icon: <TrendingDown className="h-4 w-4" />, color: "bg-red-100 text-red-600" },
      ADJUSTMENT: { label: "Adjustment", icon: <RotateCcw className="h-4 w-4" />, color: "bg-blue-100 text-blue-600" },
      TRANSFER_IN: { label: "Transfer In", icon: <ArrowRightLeft className="h-4 w-4" />, color: "bg-purple-100 text-purple-600" },
      TRANSFER_OUT: { label: "Transfer Out", icon: <ArrowRightLeft className="h-4 w-4" />, color: "bg-orange-100 text-orange-600" },
      RETURN: { label: "Return", icon: <TrendingUp className="h-4 w-4" />, color: "bg-cyan-100 text-cyan-600" },
      DAMAGE: { label: "Damage", icon: <AlertTriangle className="h-4 w-4" />, color: "bg-red-100 text-red-600" },
      THEFT: { label: "Theft", icon: <XCircleIcon className="h-4 w-4" />, color: "bg-red-100 text-red-700" },
      EXPIRY: { label: "Expiry", icon: <Calendar className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-600" },
      OTHER: { label: "Other", icon: <FileText className="h-4 w-4" />, color: "bg-gray-100 text-gray-600" }
    };
    return types[type] || types.OTHER;
  };

  const getQuantityColor = (quantity: number) => {
    return quantity > 0 ? "text-green-600" : "text-red-600";
  };

  const getQuantityIcon = (quantity: number) => {
    return quantity > 0 ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Loading warehouse details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!warehouse) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Warehouse not found</h3>
            <p className="text-gray-600 mb-4">The warehouse you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push('/warehouses')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Warehouses
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push('/warehouses')} 
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{warehouse.name}</h1>
                <p className="text-gray-600">Warehouse Details & Inventory</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => router.push(`/warehouses/${warehouseId}/edit`)}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Warehouse
              </Button>
            </div>
          </div>

          {/* Warehouse Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Warehouse Code</p>
                    <p className="text-2xl font-bold text-blue-600">{warehouse.code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-green-600">{totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-purple-600">{totalQuantity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Hash className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warehouse Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Warehouse Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {warehouse.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${
                        warehouse.isActive ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(warehouse.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {warehouse.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900 mt-1">{warehouse.address}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {warehouse.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <p className="text-sm text-gray-900 mt-1">{warehouse.city}</p>
                    </div>
                  )}
                  
                  {warehouse.country && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <p className="text-sm text-gray-900 mt-1">{warehouse.country}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      {warehouse.city && warehouse.country ? (
                        <p className="text-sm text-gray-900">
                          {warehouse.city}, {warehouse.country}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">No location set</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">
                        Last updated: {new Date(warehouse.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'products'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package className="h-4 w-4 inline mr-2" />
                    Products in Warehouse
                  </button>
                  <button
                    onClick={() => setActiveTab('movements')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'movements'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 inline mr-2" />
                    Stock Movements
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={activeTab === 'products' ? "Search products..." : "Search movements..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'products' ? (
                // Products Tab
                filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No products found' : 'No products in warehouse'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'This warehouse doesn\'t have any products yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">SKU</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Cost</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Total Value</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-purple-100 mr-3">
                                  <Package className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.sku}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{product.category.name}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900">
                                {product.stockItem?.quantity || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">
                                {formatCurrency(product.stockItem?.averageCost || 0)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(product.stockItem?.totalValue || 0)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
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
                                    onClick: () => router.push(`/products/${product.id}`)
                                  },
                                  {
                                    label: "Adjust Stock",
                                    icon: <Package className="h-4 w-4" />,
                                    onClick: () => {
                                      // TODO: Implement stock adjustment
                                      console.log('Adjust stock for', product.id);
                                    }
                                  }
                                ]}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                // Stock Movements Tab
                filteredMovements.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No movements found' : 'No stock movements'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'This warehouse doesn\'t have any stock movements yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Reason</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Stock After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMovements.map((movement) => {
                          const typeInfo = getMovementTypeInfo(movement.type);
                          return (
                            <tr key={movement.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium text-gray-900">{movement.product.name}</div>
                                  <div className="text-sm text-gray-500">{movement.product.sku}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className={`p-1 rounded ${typeInfo.color}`}>
                                    {typeInfo.icon}
                                  </div>
                                  <span className="ml-2 font-medium">{typeInfo.label}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className={`flex items-center font-medium ${getQuantityColor(movement.quantity)}`}>
                                  {getQuantityIcon(movement.quantity)}
                                  <span className="ml-1">
                                    {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.uomBase}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {movement.reference || '-'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {movement.reason || '-'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-gray-600">
                                  {new Date(movement.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(movement.createdAt).toLocaleTimeString()}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {(() => {
                                    // Calculate stock level after this movement
                                    const currentStock = movement.stockItem.quantity;
                                    const movementIndex = filteredMovements.findIndex(m => m.id === movement.id);
                                    const movementsAfterThis = filteredMovements.slice(0, movementIndex);
                                    
                                    let stockAfterThisMovement = currentStock;
                                    movementsAfterThis.forEach(m => {
                                      stockAfterThisMovement -= m.quantity;
                                    });
                                    
                                    return stockAfterThisMovement;
                                  })()} {movement.product.uomBase}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Available: {(() => {
                                    const currentAvailable = movement.stockItem.available;
                                    const movementIndex = filteredMovements.findIndex(m => m.id === movement.id);
                                    const movementsAfterThis = filteredMovements.slice(0, movementIndex);
                                    
                                    let availableAfterThisMovement = currentAvailable;
                                    movementsAfterThis.forEach(m => {
                                      availableAfterThisMovement -= m.quantity;
                                    });
                                    
                                    return availableAfterThisMovement;
                                  })()}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
