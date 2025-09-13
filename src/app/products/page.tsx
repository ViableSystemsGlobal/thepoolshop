"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { BulkImportModal } from "@/components/modals/bulk-import-modal";
import { AddCategoryModal } from "@/components/modals/add-category-modal";
import { EditProductModal } from "@/components/modals/edit-product-modal";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { StockAdjustmentModal } from "@/components/modals/stock-adjustment-modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
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
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

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

  const handleDuplicateProduct = (product: Product) => {
    // TODO: Implement duplicate product functionality
    console.log(`Duplicating product: ${product.name}`);
    // This would open a modal with the product data pre-filled
  };

  const handleExportProduct = (product: Product) => {
    // TODO: Implement export product functionality
    console.log(`Exporting product: ${product.name}`);
    // This would generate a CSV/PDF export
  };

  const handleViewHistory = (product: Product) => {
    // TODO: Implement view history functionality
    console.log(`Viewing history for product: ${product.name}`);
    // This would show a history modal/page
  };

  const handleArchiveProduct = (product: Product) => {
    // TODO: Implement archive product functionality
    console.log(`Archiving product: ${product.name}`);
    // This would set the product as inactive/archived
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className={`h-4 w-4 text-${theme.primary}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${theme.primary}`}>{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : "Total products"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className={`h-4 w-4 text-${theme.primary}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${theme.primary}`}>
              {products.filter(p => p.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In stock and available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className={`h-4 w-4 text-${theme.primary}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${theme.primary}`}>
              {products.filter(p => (p.stockItem?.available || 0) < 20 && (p.stockItem?.available || 0) > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className={`h-4 w-4 text-${theme.primary}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${theme.primary}`}>
              {products.filter(p => (p.stockItem?.available || 0) === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Search and filter your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price ? product.price.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (product.stockItem?.available || 0) === 0 
                          ? "text-red-600" 
                          : (product.stockItem?.available || 0) < 20 
                            ? "text-amber-600" 
                            : `text-${theme.primary}`
                      }`}>
                        {product.stockItem?.available || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.active
                          ? `bg-${theme.primaryBg} text-${theme.primaryText}`
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
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
        onSuccess={() => {
          // Refresh the products list
          fetchProducts();
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
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
      </div>
    </MainLayout>
  );
}
