"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  Package, 
  CreditCard, 
  FileText, 
  Settings,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  Grid3X3,
  Plus,
  Folder,
  DollarSign,
  Ruler,
  Tag
} from "lucide-react";

export default function ProductSettingsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const productSettings = [
    {
      id: "categories",
      title: "Categories",
      description: "Manage product categories, subcategories, and organization structure.",
      icon: Folder,
      href: "/settings/products/categories",
      status: "active",
      lastUpdated: "2 hours ago"
    },
    {
      id: "price-lists",
      title: "Price Lists",
      description: "Configure pricing strategies, currency settings, and channel-specific pricing.",
      icon: DollarSign,
      href: "/settings/products/price-lists",
      status: "active",
      lastUpdated: "1 day ago"
    },
    {
      id: "units",
      title: "Units of Measure",
      description: "Define measurement units, conversion factors, and packaging standards.",
      icon: Ruler,
      href: "/settings/products/units",
      status: "active",
      lastUpdated: "Just now"
    },
    {
      id: "attributes",
      title: "Product Attributes",
      description: "Customize product specifications, variants, and attribute templates.",
      icon: Tag,
      href: "/settings/products/attributes",
      status: "pending",
      lastUpdated: "Never"
    }
  ];

  const filteredSettings = productSettings.filter(setting =>
    setting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Settings</h1>
              <p className="text-gray-600">Configure your product catalog, pricing, and inventory settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">1,247</div>
              <p className="text-xs text-gray-500">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Categories</CardTitle>
              <Folder className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">23</div>
              <p className="text-xs text-gray-500">
                5 subcategories
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Price Lists</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">8</div>
              <p className="text-xs text-gray-500">
                3 currencies
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Units of Measure</CardTitle>
              <Ruler className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">12</div>
              <p className="text-xs text-gray-500">
                Standard units
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Product Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSettings.map((setting) => (
              <Card 
                key={setting.id} 
                className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => router.push(setting.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <setting.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                            {setting.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            setting.status === 'active' 
                              ? 'bg-gray-100 text-gray-700' 
                              : 'bg-gray-50 text-gray-500'
                          }`}>
                            {setting.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {setting.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    <Package className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Import Products</h3>
                    <p className="text-sm text-gray-600">Bulk import from CSV/Excel</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create Price List</h3>
                    <p className="text-sm text-gray-600">Set up new pricing strategy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    <Folder className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Add Category</h3>
                    <p className="text-sm text-gray-600">Create new product category</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Added 15 new products</p>
                    <p className="text-xs text-gray-500">2 hours ago • Electronics category</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Updated Retail Price List</p>
                    <p className="text-xs text-gray-500">1 day ago • 5% price increase</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Folder className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Created "Smart Home" category</p>
                    <p className="text-xs text-gray-500">3 days ago • Electronics subcategory</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
