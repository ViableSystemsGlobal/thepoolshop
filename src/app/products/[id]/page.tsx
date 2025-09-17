"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { formatCurrency } from "@/lib/utils";
import { CurrencyToggle, useCurrency, formatCurrency as formatCurrencyWithSymbol } from "@/components/ui/currency-toggle";
import { EditProductModal } from "@/components/modals/edit-product-modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
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
  AlertTriangle,
  Copy,
  Download,
  ChevronLeft,
  ChevronRight,
  History,
  Archive,
  Upload,
  X
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
  originalPrice?: number;
  originalCost?: number;
  originalPriceCurrency?: string;
  originalCostCurrency?: string;
  baseCurrency?: string;
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
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();
  const { currency, changeCurrency } = useCurrency();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  const nextImage = () => {
    if (product && product.images) {
      let images: string[] = [];
      if (typeof product.images === 'string') {
        try {
          images = JSON.parse(product.images);
        } catch (e) {
          images = [];
        }
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images) {
      let images: string[] = [];
      if (typeof product.images === 'string') {
        try {
          images = JSON.parse(product.images);
        } catch (e) {
          images = [];
        }
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const fetchDocuments = async () => {
    if (!product) return;
    try {
      const response = await fetch(`/api/products/${product.id}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !product) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', product.id);

    try {
      const response = await fetch('/api/products/documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        success('Document uploaded successfully');
        fetchDocuments(); // Refresh documents list
      } else {
        showError('Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      showError('Error uploading document');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/products/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showError('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      showError('Error downloading document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/products/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Document deleted successfully');
        fetchDocuments(); // Refresh documents list
      } else {
        showError('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showError('Error deleting document');
    }
  };

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

  // Fetch documents when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents' && product) {
      fetchDocuments();
    }
  }, [activeTab, product]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh product data
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        console.log('Refreshing product with ID:', params.id); // Debug log
        const response = await fetch(`/api/products/${params.id}`);
        console.log('Response status:', response.status); // Debug log
        
        if (response.ok) {
          const data = await response.json();
          console.log('Updated product data:', data); // Debug log
          setProduct(data); // API returns product directly, not wrapped in data.product
          setError(null); // Clear any previous errors
        } else if (response.status === 404) {
          console.error('Product not found after edit, ID:', params.id);
          setError("Product not found");
        } else {
          console.error('Failed to load product, status:', response.status);
          setError("Failed to load product");
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          success('Product deleted successfully');
          router.push('/products');
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showError('Network error. Please try again.');
      }
    }
  };

  const handleDuplicateProduct = () => {
    success('Duplicate product functionality coming soon!');
  };

  const handleExportProduct = () => {
    success('Export product functionality coming soon!');
  };

  const handleViewHistory = () => {
    // Navigate to product-specific stock movements page
    router.push(`/products/${product?.id}/stock-movements`);
  };

  const handleArchiveProduct = () => {
    success('Archive product functionality coming soon!');
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

  // Calculate profit margin using converted prices in the same currency
  const calculateProfitMargin = () => {
    if (!product.price || !product.cost) return 0;
    
    // Simple conversion rates - same as in currency-toggle.tsx
    const conversionRates: { [key: string]: { [key: string]: number } } = {
      'USD': { 'GHS': 12.5, 'EUR': 0.85 },
      'GHS': { 'USD': 0.08, 'EUR': 0.068 },
      'EUR': { 'USD': 1.18, 'GHS': 14.7 }
    };
    
    // Convert selling price to selected currency
    const sellingCurrency = product.originalPriceCurrency || product.baseCurrency || 'GHS';
    let sellingPriceInSelectedCurrency = product.price;
    if (sellingCurrency !== currency) {
      const rate = conversionRates[sellingCurrency]?.[currency];
      if (rate) {
        sellingPriceInSelectedCurrency = product.price * rate;
      }
    }
    
    // Convert cost price to selected currency
    const costCurrency = product.originalCostCurrency || product.importCurrency || 'USD';
    let costPriceInSelectedCurrency = product.cost;
    if (costCurrency !== currency) {
      const rate = conversionRates[costCurrency]?.[currency];
      if (rate) {
        costPriceInSelectedCurrency = product.cost * rate;
      }
    }
    
    if (sellingPriceInSelectedCurrency <= 0) return 0;
    
    return ((sellingPriceInSelectedCurrency - costPriceInSelectedCurrency) / sellingPriceInSelectedCurrency) * 100;
  };
  
  const profitMargin = calculateProfitMargin();

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
            <CurrencyToggle value={currency} onChange={changeCurrency} />
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
            <div className="relative">
              <DropdownMenu
                trigger={
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                  >
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    More Actions
                  </Button>
                }
                items={[
                  {
                    label: "Duplicate Product",
                    icon: <Copy className="h-4 w-4" />,
                    onClick: handleDuplicateProduct
                  },
                  {
                    label: "Export Product",
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExportProduct
                  },
                  {
                    label: "View Stock History",
                    icon: <History className="h-4 w-4" />,
                    onClick: handleViewHistory
                  },
                  {
                    label: "Archive Product",
                    icon: <Archive className="h-4 w-4" />,
                    onClick: handleArchiveProduct,
                    className: "text-amber-600 hover:text-amber-700"
                  },
                  {
                    label: "Delete Product",
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: handleDelete,
                    className: "text-red-600 hover:text-red-700"
                  }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? `border-${theme.primary} text-${theme.primaryText}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? `border-${theme.primary} text-${theme.primaryText}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Documents
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
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
                <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden relative group">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
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
                      {/* Navigation Arrows - Only show if multiple images */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          {/* Image Counter */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
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
                      {formatCurrencyWithSymbol(product.price || 0, currency, product.originalPriceCurrency || product.baseCurrency || 'GHS')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Selling Price
                      {product.originalPriceCurrency && product.originalPriceCurrency !== currency && (
                        <div className="text-xs text-gray-500 mt-1">
                          Original: {formatCurrencyWithSymbol(product.price || 0, product.originalPriceCurrency || 'GHS', product.originalPriceCurrency || 'GHS')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrencyWithSymbol(product.cost || 0, currency, product.originalCostCurrency || product.importCurrency || 'USD')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cost Price
                      {product.originalCostCurrency && product.originalCostCurrency !== currency && (
                        <div className="text-xs text-gray-500 mt-1">
                          Original: {formatCurrencyWithSymbol(product.cost || 0, product.originalCostCurrency || 'USD', product.originalCostCurrency || 'USD')}
                        </div>
                      )}
                    </div>
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
                    <span className="text-sm font-medium text-gray-500">Selling Currency</span>
                    <span className="text-sm text-gray-900">{product.originalPriceCurrency || product.baseCurrency || 'GHS'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Cost Currency</span>
                    <span className="text-sm text-gray-900">{product.originalCostCurrency || product.importCurrency || 'USD'}</span>
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
                  onClick={() => router.push(`/products/${product.id}/stock-movements`)}
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
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  Upload product-related documents such as manuals, certificates, or specifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="document-upload"
                    className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isUploading ? 'Uploading...' : 'Click to upload documents'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOC, DOCX, TXT, JPG, PNG files up to 10MB
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Product Documents
                </CardTitle>
                <CardDescription>
                  Manage and download product documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                    <p className="text-gray-600">
                      Upload documents to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{doc.filename}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        product={product}
      />
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
              {movement.unitCost && movement.unitCost > 0 && (
                <div className="text-xs text-gray-600">
                  ${movement.unitCost.toFixed(2)}/unit
                </div>
              )}
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
