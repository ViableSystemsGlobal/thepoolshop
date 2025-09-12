"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +0% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +0% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Quotations</CardTitle>
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                -0% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$0</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +0% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600">
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start h-12 text-left" variant="outline">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Add New Product</div>
                    <div className="text-sm text-gray-500">Create a new product in your catalog</div>
                  </div>
                </div>
              </Button>
              
              <Button className="w-full justify-start h-12 text-left" variant="outline">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Create Quotation</div>
                    <div className="text-sm text-gray-500">Generate a new quotation for a customer</div>
                  </div>
                </div>
              </Button>
              
              <Button className="w-full justify-start h-12 text-left" variant="outline">
                <div className="flex items-center w-full">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Add New Customer</div>
                    <div className="text-sm text-gray-500">Register a new customer account</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-gray-600">
                Latest updates in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-500 text-sm">Start by adding your first product or customer</p>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Actions Today */}
          <Card className="border-0 shadow-sm bg-white lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Top 5 Actions Today</CardTitle>
              <CardDescription className="text-gray-600">
                AI-suggested actions to improve your sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Follow up on pending quotations</p>
                    <p className="text-xs text-gray-500 mt-1">3 quotations need attention</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Update product prices</p>
                    <p className="text-xs text-gray-500 mt-1">Price list needs review</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Contact new leads</p>
                    <p className="text-xs text-gray-500 mt-1">5 new leads waiting</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}