"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { 
  ArrowLeft, 
  ArrowRight,
  Package, 
  DollarSign, 
  Tag, 
  Hash, 
  FileText, 
  Calendar, 
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockItem {
  id: string;
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  images?: string | null;
  attributes?: any;
  uomBase: string;
  uomSell: string;
  price?: number;
  cost?: number;
  importCurrency: string;
  active: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  stockItem?: StockItem;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else if (response.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product details");
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/products/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/products');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const handleMoreActions = () => {
    const actions = [
      'Duplicate Product',
      'Export Product',
      'View History',
      'Archive Product'
    ];
    
    const action = window.prompt(`More actions for "${product?.name}":\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEnter number (1-4):`);
    
    if (action) {
      const actionIndex = parseInt(action) - 1;
      if (actionIndex >= 0 && actionIndex < actions.length) {
        console.log(`Selected action: ${actions[actionIndex]} for product: ${product?.name}`);
        // Here you would implement the specific action
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
            <Button onClick={() => router.push('/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Parse images from JSON string
  let images: string[] = [];
  if (product.images) {
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        images = [];
      }
    } else if (Array.isArray(product.images)) {
      images = product.images;
    }
  }

  // Calculate profit margin
  const profitMargin = product.price && product.cost 
    ? ((product.price - product.cost) / product.price) * 100 
    : 0;

  // Stock status
  const stockStatus = (product.stockItem?.available || 0) === 0 
    ? 'out-of-stock' 
    : (product.stockItem?.available || 0) < 20 
      ? 'low-stock' 
      : 'in-stock';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/products')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.sku}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMoreActions}
              className="flex items-center"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              More Actions
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Product Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Image and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Image */}
                <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`h-full w-full flex items-center justify-center ${images.length > 0 ? 'hidden' : 'flex'}`}>
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    product.active
                      ? `bg-${theme.primaryBg} text-${theme.primaryText}`
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    stockStatus === 'out-of-stock'
                      ? "bg-red-100 text-red-800"
                      : stockStatus === 'low-stock'
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                  }`}>
                    {stockStatus === 'out-of-stock' ? 'Out of Stock' : 
                     stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      ${product.price ? product.price.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Selling Price</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      ${product.cost ? product.cost.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Cost Price</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold flex items-center justify-center ${
                      profitMargin > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profitMargin > 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                      {profitMargin.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Profit Margin</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {product.stockItem?.quantity || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Quantity</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {product.stockItem?.reserved || 0}
                    </div>
                    <div className="text-sm text-gray-600">Reserved</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${
                      (product.stockItem?.available || 0) === 0
                        ? "text-red-600"
                        : (product.stockItem?.available || 0) < 20
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}>
                      {product.stockItem?.available || 0}
                    </div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <span className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Base Unit</span>
                    <span className="text-sm text-gray-900">{product.uomBase}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Selling Unit</span>
                    <span className="text-sm text-gray-900">{product.uomSell}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Import Currency</span>
                    <span className="text-sm text-gray-900">{product.importCurrency}</span>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Product ID</span>
                    <span className="text-sm text-gray-900 font-mono">{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <span className="text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stock Movements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Stock Movements
                  </CardTitle>
                  <CardDescription>
                    Recent stock movements for this product
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/inventory/stock-movements?product=${product.id}`)}
                  className="flex items-center"
                >
                  View All Movements
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StockMovementsSummary productId={product.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

// Stock Movements Summary Component
function StockMovementsSummary({ productId }: { productId: string }) {
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [productId]);

  const fetchMovements = async () => {
    try {
      const response = await fetch(`/api/stock-movements?productId=${productId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMovementTypeInfo = (type: string) => {
    const types: any = {
      'RECEIPT': { label: 'Receipt', icon: '↓', color: 'text-green-600' },
      'ADJUSTMENT': { label: 'Adjustment', icon: '↻', color: 'text-blue-600' },
      'TRANSFER_IN': { label: 'Transfer In', icon: '→', color: 'text-purple-600' },
      'TRANSFER_OUT': { label: 'Transfer Out', icon: '←', color: 'text-orange-600' },
      'SALE': { label: 'Sale', icon: '↑', color: 'text-emerald-600' },
      'RETURN': { label: 'Return', icon: '↗', color: 'text-cyan-600' },
      'DAMAGE': { label: 'Damage', icon: '⚠', color: 'text-red-600' },
      'THEFT': { label: 'Theft', icon: '✗', color: 'text-red-700' },
      'EXPIRY': { label: 'Expiry', icon: '📅', color: 'text-yellow-600' },
      'OTHER': { label: 'Other', icon: '📄', color: 'text-gray-600' }
    };
    return types[type] || types['OTHER'];
  };

  const getQuantityColor = (quantity: number) => {
    return quantity > 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading movements...</div>;
  }

  if (movements.length === 0) {
    return <div className="text-center py-4 text-gray-500">No stock movements recorded yet.</div>;
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => {
        const typeInfo = getMovementTypeInfo(movement.type);
        return (
          <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`text-lg ${typeInfo.color}`}>
                {typeInfo.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{typeInfo.label}</div>
                <div className="text-xs text-gray-500">
                  {new Date(movement.createdAt).toLocaleDateString()} at {new Date(movement.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${getQuantityColor(movement.quantity)}`}>
                {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.uomBase}
              </div>
              {movement.reference && (
                <div className="text-xs text-gray-500">{movement.reference}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
