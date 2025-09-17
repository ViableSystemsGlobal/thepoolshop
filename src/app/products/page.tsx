"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { formatCurrency } from "@/lib/utils";
import { CurrencyToggle, useCurrency, formatCurrency as formatCurrencyWithSymbol } from "@/components/ui/currency-toggle";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { BulkImportModal } from "@/components/modals/bulk-import-modal";
import { AddCategoryModal } from "@/components/modals/add-category-modal";
import { EditProductModal } from "@/components/modals/edit-product-modal";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { StockAdjustmentModal } from "@/components/modals/stock-adjustment-modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { DataTable } from "@/components/ui/data-table";
import { GRNGenerationModal } from "@/components/modals/grn-generation-modal";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Upload,
  Download,
  Copy,
  Archive,
  History,
  FileText,
  BarChart3
} from "lucide-react";

// TypeScript interfaces for API data
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
  images?: string | null; // JSON string in database
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

// Mock data for now
const mockProducts = [
  {
    id: 1,
    sku: "PROD-001",
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics",
    price: 299.99,
    stock: 45,
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    sku: "PROD-002", 
    name: "Ergonomic Office Chair",
    description: "Comfortable office chair with lumbar support",
    category: "Furniture",
    price: 199.99,
    stock: 12,
    status: "active",
    createdAt: "2024-01-14"
  },
  {
    id: 3,
    sku: "PROD-003",
    name: "Smart Fitness Tracker",
    description: "Advanced fitness tracker with heart rate monitoring",
    category: "Electronics", 
    price: 149.99,
    stock: 0,
    status: "inactive",
    createdAt: "2024-01-13"
  }
];

export default function ProductsPage() {
  const router = useRouter();
  const { currency, changeCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Review low stock items',
      description: 'You have products running low on stock that need immediate restocking.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Update product pricing',
      description: 'Analyze and update pricing for products with high demand.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Optimize product categories',
      description: 'Reorganize product categories for better customer navigation.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  // Fetch products and categories on component mount
  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Listen for the custom event to open Add Category modal
  React.useEffect(() => {
    const handleOpenAddCategoryModal = () => {
      setIsAddCategoryModalOpen(true);
    };

    window.addEventListener('openAddCategoryModal', handleOpenAddCategoryModal);
    
    return () => {
      window.removeEventListener('openAddCategoryModal', handleOpenAddCategoryModal);
    };
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      } else {
        console.error('Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower));
    const matchesCategory = selectedCategory === "all" || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = ["all", ...Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))];

  // Action handlers
  const handleViewProduct = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleProductEditSuccess = () => {
    fetchProducts(); // Refresh the products list to show updated images
  };

  const handleDuplicateProduct = (product: Product) => {
    // TODO: Implement duplicate product functionality
    console.log('Duplicate product:', product.id);
    success('Duplicate product functionality coming soon!');
  };

  const handleExportProduct = (product: Product) => {
    // TODO: Implement export product functionality
    console.log('Export product:', product.id);
    success('Export product functionality coming soon!');
  };

  const handleViewHistory = (product: Product) => {
    // Navigate to product details page with history tab
    router.push(`/products/${product.id}?tab=history`);
  };

  const handleArchiveProduct = (product: Product) => {
    // TODO: Implement archive product functionality
    console.log('Archive product:', product.id);
    success('Archive product functionality coming soon!');
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      const response = await fetch('/api/products/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (response.ok) {
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        success(`Successfully deleted ${selectedProducts.length} product(s)`);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete products');
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      showError('Failed to delete products');
    }
  };

  const handleBulkExport = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      const response = await fetch('/api/products/bulk-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (response.ok) {
        const { data, filename } = await response.json();
        const { downloadCSV } = await import('@/lib/export-utils');
        downloadCSV(data, filename);
        success(`Successfully exported ${selectedProducts.length} product(s)`);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to export products');
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      showError('Failed to export products');
    }
  };

  const handleGenerateGRN = () => {
    if (selectedProducts.length === 0) {
      showError('Please select products to generate GRN');
      return;
    }
    setIsGRNModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove product from local state
        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        success("Product Deleted", `"${selectedProduct.name}" has been successfully deleted.`);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete product:', errorData.error);
        showError("Delete Failed", errorData.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showError("Network Error", 'Unable to connect to server. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success("Recommendation completed! Great job!");
  };


  const handleAddStock = (product: Product) => {
    setSelectedProduct(product);
    setIsStockAdjustmentOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <CurrencyToggle value={currency} onChange={changeCurrency} />
          <Button 
            variant="outline"
            onClick={() => router.push('/inventory/stock-movements')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Stock Movements
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button 
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* AI Recommendation and Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendation Card - Left Side */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="Product Management AI"
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
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                <Package className={`w-5 h-5 text-${theme.primary}`} />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-xl font-bold text-green-600">{products.filter(p => p.active).length}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-xl font-bold text-orange-600">{products.filter(p => (p.stockItem?.available || 0) < 20 && (p.stockItem?.available || 0) > 0).length}</p>
              </div>
              <div className="p-2 rounded-full bg-orange-100">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{products.filter(p => (p.stockItem?.available || 0) === 0).length}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <Package className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Products Table with Search */}
      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categoryOptions.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <DataTable
            data={filteredProducts}
            enableSelection={true}
            selectedItems={selectedProducts}
            onSelectionChange={setSelectedProducts}
            bulkActions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateGRN}
                  disabled={selectedProducts.length === 0}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Generate GRN
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={selectedProducts.length === 0}
                >
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedProducts.length === 0}
                >
                  Delete
                </Button>
              </div>
            }
            columns={[
              {
                key: 'product',
                label: 'Product',
                render: (product) => (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                      {(() => {
                        // Parse images from JSON string or handle null/array
                        let images = [];
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
                        
                        if (images.length > 0) {
                          return (
                            <>
                              <img
                                src={images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="h-full w-full flex items-center justify-center" style={{display: 'none'}}>
                                <Package className="h-5 w-5 text-gray-500" />
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'sku',
                label: 'SKU',
                render: (product) => (
                  <span className="text-sm text-gray-900">{product.sku}</span>
                )
              },
              {
                key: 'category',
                label: 'Category',
                render: (product) => (
                  <span className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</span>
                )
              },
              {
                key: 'price',
                label: 'Price',
                render: (product) => (
                  <span className="text-sm text-gray-900">
                    {formatCurrencyWithSymbol(product.price || 0, currency, product.originalPriceCurrency || product.baseCurrency || 'GHS')}
                  </span>
                )
              },
              {
                key: 'stock',
                label: 'Stock',
                render: (product) => (
                  <span className={`text-sm font-medium ${
                    (product.stockItem?.available || 0) === 0 
                      ? "text-red-600" 
                      : (product.stockItem?.available || 0) < 20 
                        ? "text-amber-600" 
                        : `text-${theme.primary}`
                  }`}>
                    {product.stockItem?.available || 0}
                  </span>
                )
              },
              {
                key: 'status',
                label: 'Status',
                render: (product) => (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.active
                      ? `bg-${theme.primaryBg} text-${theme.primaryText}`
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (product) => (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProduct(product)}
                      title="View Product Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAddStock(product)}
                      title="Add Stock"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product)}
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <DropdownMenu
                        trigger={
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="More Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: "Duplicate Product",
                            icon: <Copy className="h-4 w-4" />,
                            onClick: () => handleDuplicateProduct(product)
                          },
                          {
                            label: "Export Product",
                            icon: <Download className="h-4 w-4" />,
                            onClick: () => handleExportProduct(product)
                          },
                          {
                            label: "View History",
                            icon: <History className="h-4 w-4" />,
                            onClick: () => handleViewHistory(product)
                          },
                          {
                            label: "Archive Product",
                            icon: <Archive className="h-4 w-4" />,
                            onClick: () => handleArchiveProduct(product),
                            className: "text-amber-600 hover:text-amber-700"
                          }
                        ]}
                      />
                    </div>
                  </div>
                )
              }
            ]}
            itemsPerPage={10}
          />
        )}
      </Card>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // Refresh the products list
          fetchProducts();
          setIsAddModalOpen(false);
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          // Refresh the products list or show success message
          console.log('Products imported successfully!');
        }}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSuccess={() => {
          // Refresh categories and products to update category filter
          fetchCategories();
          fetchProducts();
          setIsAddCategoryModalOpen(false);
        }}
      />


      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleProductEditSuccess}
        product={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        itemName={selectedProduct?.name || ""}
        isLoading={isDeleting}
      />

      {/* Stock Adjustment Modal */}
      {isStockAdjustmentOpen && selectedProduct && (
        <StockAdjustmentModal
          isOpen={isStockAdjustmentOpen}
          onClose={() => setIsStockAdjustmentOpen(false)}
          product={selectedProduct}
          onSuccess={() => {
            fetchProducts();
            setIsStockAdjustmentOpen(false);
          }}
        />
      )}

      {/* GRN Generation Modal */}
      <GRNGenerationModal
        isOpen={isGRNModalOpen}
        onClose={() => setIsGRNModalOpen(false)}
        products={products.filter(p => selectedProducts.includes(p.id))}
      />
      </div>
    </MainLayout>
  );
}
