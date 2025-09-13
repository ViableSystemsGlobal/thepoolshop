"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowRight
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  uomBase: string;
  active: boolean;
  stockItem?: {
    id: string;
    quantity: number;
    available: number;
    reserved: number;
  };
  category?: {
    id: string;
    name: string;
  };
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  // Check if we're filtering by a specific product
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const productParam = searchParams.get('product');
    if (productParam) {
      setSelectedProductId(productParam);
    }
    fetchProducts();
  }, [searchParams]);

  // Set search term when products are loaded and we have a product param
  useEffect(() => {
    const productParam = searchParams.get('product');
    if (productParam && products.length > 0) {
      const product = products.find(p => p.id === productParam);
      if (product) {
        setSearchTerm(product.name);
      }
    }
  }, [products, searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
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

  const getStockStatus = (product: Product) => {
    if (!product.stockItem) {
      return { status: "No Stock", color: "bg-gray-100 text-gray-800", icon: <XCircle className="h-4 w-4" /> };
    }
    
    const available = product.stockItem.available;
    if (available > 10) {
      return { status: "In Stock", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> };
    } else if (available > 0) {
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="h-4 w-4" /> };
    } else {
      return { status: "Out of Stock", color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> };
    }
  };

  const filteredProducts = (products || []).filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === "all" || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = ["all", ...Array.from(new Set((products || []).map(p => p.category?.name).filter(Boolean)))];

  const totalProducts = (products || []).length;
  const inStockProducts = (products || []).filter(p => p.stockItem && p.stockItem.available > 10).length;
  const lowStockProducts = (products || []).filter(p => p.stockItem && p.stockItem.available > 0 && p.stockItem.available <= 10).length;
  const outOfStockProducts = (products || []).filter(p => !p.stockItem || p.stockItem.available === 0).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Overview</h1>
            <p className="text-gray-600">View stock levels for all products</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-${theme.primaryBg}`}>
                  <Package className={`h-6 w-6 text-${theme.primary}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className={`text-2xl font-bold text-${theme.primary}`}>{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">{inStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
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
            <CardTitle>Products Stock ({filteredProducts.length})</CardTitle>
            <CardDescription>
              Click on any product to view detailed stock movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stock Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Available</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Reserved</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.stockItem?.quantity || 0} {product.uomBase}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.stockItem?.available || 0} {product.uomBase}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.stockItem?.reserved || 0} {product.uomBase}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                            {stockStatus.icon}
                            <span className="ml-1">{stockStatus.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}