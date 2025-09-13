"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { AddCategoryModal } from "@/components/modals/add-category-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Plus, 
  Search, 
  Folder, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  ChevronRight,
  Settings,
  MoreHorizontal
} from "lucide-react";

// Mock data for categories
const mockCategories = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and accessories",
    parentId: null,
    productCount: 15,
    status: "active",
    createdAt: "2024-01-10",
    children: [
      {
        id: 3,
        name: "Smartphones",
        description: "Mobile phones and accessories",
        parentId: 1,
        productCount: 5,
        status: "active",
        createdAt: "2024-01-08"
      },
      {
        id: 4,
        name: "Audio Equipment",
        description: "Headphones, speakers, and audio devices",
        parentId: 1,
        productCount: 10,
        status: "active",
        createdAt: "2024-01-07"
      }
    ]
  },
  {
    id: 2,
    name: "Furniture",
    description: "Office and home furniture",
    parentId: null,
    productCount: 8,
    status: "active",
    createdAt: "2024-01-09",
    children: [
      {
        id: 5,
        name: "Office Chairs",
        description: "Ergonomic and standard office chairs",
        parentId: 2,
        productCount: 6,
        status: "active",
        createdAt: "2024-01-06"
      }
    ]
  },
  {
    id: 6,
    name: "Clothing",
    description: "Apparel and fashion accessories",
    parentId: null,
    productCount: 12,
    status: "active",
    createdAt: "2024-01-05",
    children: []
  }
];

export default function CategoriesSettingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1, 2]);

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.children?.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getTotalProducts = () => {
    return mockCategories.reduce((total, category) => {
      return total + category.productCount + (category.children?.reduce((childTotal, child) => childTotal + child.productCount, 0) || 0);
    }, 0);
  };

  const getTotalCategories = () => {
    return mockCategories.length + mockCategories.reduce((total, category) => total + (category.children?.length || 0), 0);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
              <p className="text-gray-600">Organize your products with categories and subcategories</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Subcategory
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalCategories()}</div>
              <p className="text-xs text-muted-foreground">
                Including subcategories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Main Categories</CardTitle>
              <Folder className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockCategories.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Top-level categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
              <Folder className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockCategories.reduce((total, category) => total + (category.children?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Nested categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {getTotalProducts()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>
              Search and manage your product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Bulk Actions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Category Hierarchy</CardTitle>
            <CardDescription>
              Manage your category structure and organization
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  {/* Main Category */}
                  <div className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleExpanded(category.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <ChevronRight 
                            className={`h-4 w-4 text-gray-500 transition-transform ${
                              expandedCategories.includes(category.id) ? 'rotate-90' : ''
                            }`} 
                          />
                        </button>
                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Folder className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {category.productCount} products
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.children?.length || 0} subcategories
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.includes(category.id) && category.children && category.children.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      {category.children.map((subcategory) => (
                        <div key={subcategory.id} className="p-6 pl-16 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Folder className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {subcategory.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {subcategory.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {subcategory.productCount} products
                                </div>
                                <div className="text-xs text-gray-500">
                                  Subcategory
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            console.log('Category created successfully!');
          }}
        />
      </div>
    </MainLayout>
  );
}
