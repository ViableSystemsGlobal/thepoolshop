"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { DataTable } from "@/components/ui/data-table";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  Filter, 
  Download, 
  Plus,
  ShoppingCart,
  Target,
  RefreshCw,
  Eye,
  Edit,
  MoreHorizontal,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Hash,
  Building,
  ArrowUp,
  ArrowDown,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface Backorder {
  id: string;
  orderNumber: string;
  orderType: 'QUOTATION' | 'PROFORMA';
  orderId: string;
  productId: string;
  quantity: number;
  quantityFulfilled: number;
  quantityPending: number;
  unitPrice: number;
  lineTotal: number;
  status: 'PENDING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  expectedDate?: string;
  notes?: string;
  accountId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  fulfilledAt?: string;
  product: {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category: {
      id: string;
      name: string;
    };
    stockItems: Array<{
      id: string;
      warehouse?: {
        id: string;
        name: string;
        code: string;
      };
      quantity: number;
      available: number;
      reserved: number;
    }>;
  };
  account: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface BackorderSummary {
  total: number;
  pending: number;
  partiallyFulfilled: number;
  urgent: number;
  high: number;
  totalValue: number;
  totalQuantity: number;
}

export default function BackordersPage() {
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();

  const [backorders, setBackorders] = useState<Backorder[]>([]);
  const [summary, setSummary] = useState<BackorderSummary>({
    total: 0,
    pending: 0,
    partiallyFulfilled: 0,
    urgent: 0,
    high: 0,
    totalValue: 0,
    totalQuantity: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [accounts, setAccounts] = useState<Array<{id: string, name: string}>>([]);

  // AI Recommendations for backorders
  const aiRecommendations = [
    {
      id: 'urgent-backorders',
      title: 'Urgent Backorders',
      description: `${summary.urgent} urgent backorders need immediate fulfillment`,
      priority: 'high' as const,
      completed: false
    },
    {
      id: 'high-priority-orders',
      title: 'High Priority Orders',
      description: `${summary.high} high priority backorders require attention`,
      priority: 'medium' as const,
      completed: false
    },
    {
      id: 'stock-replenishment',
      title: 'Stock Replenishment',
      description: 'Review stock levels to prevent future backorders',
      priority: 'medium' as const,
      completed: false
    }
  ];

  const handleViewProduct = (backorder: Backorder) => {
    router.push(`/products/${backorder.productId}`);
  };

  const handleRecommendationComplete = (id: string) => {
    success(`Recommendation "${id}" marked as completed!`);
  };

  const fetchBackorders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append('status', selectedStatus);
      if (selectedPriority !== "all") params.append('priority', selectedPriority);
      if (selectedAccount) params.append('account', selectedAccount);

      const response = await fetch(`/api/backorders?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch backorders');
      }
      const data = await response.json();
      setBackorders(data.backorders || []);
      setSummary(data.summary || summary);
    } catch (error) {
      console.error('Error fetching backorders:', error);
      showError('Failed to load backorders data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchBackorders();
    fetchAccounts();
  }, [selectedStatus, selectedPriority, selectedAccount]);

  const filteredBackorders = backorders.filter(backorder => {
    const matchesSearch = backorder.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backorder.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backorder.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backorder.account.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', color: 'bg-red-100 text-red-800', icon: <Clock className="h-4 w-4" /> };
      case 'PARTIALLY_FULFILLED':
        return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-4 w-4" /> };
      case 'FULFILLED':
        return { label: 'Fulfilled', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-4 w-4" /> };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-4 w-4" /> };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: <ArrowUp className="h-4 w-4" /> };
      case 'HIGH':
        return { label: 'High', color: 'bg-orange-100 text-orange-800', icon: <ArrowUp className="h-4 w-4" /> };
      case 'NORMAL':
        return { label: 'Normal', color: 'bg-blue-100 text-blue-800', icon: <ArrowDown className="h-4 w-4" /> };
      case 'LOW':
        return { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: <ArrowDown className="h-4 w-4" /> };
      default:
        return { label: 'Normal', color: 'bg-blue-100 text-blue-800', icon: <ArrowDown className="h-4 w-4" /> };
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      const response = await fetch('/api/backorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: bulkAction,
          backorderIds: selectedItems,
          priority: bulkAction === 'update_priority' ? 'HIGH' : undefined,
          notes: `Bulk ${bulkAction} for ${selectedItems.length} backorders`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process bulk action');
      }

      const result = await response.json();
      success(result.message);
      setIsBulkActionOpen(false);
      setSelectedItems([]);
      setBulkAction("");
      fetchBackorders();
    } catch (error) {
      console.error('Error processing bulk action:', error);
      showError('Failed to process bulk action');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Order Number', 'Product', 'SKU', 'Customer', 'Quantity', 'Pending', 'Status', 'Priority', 'Value', 'Created Date'].join(','),
      ...filteredBackorders.map(backorder => [
        `"${backorder.orderNumber}"`,
        `"${backorder.product.name}"`,
        `"${backorder.product.sku}"`,
        `"${backorder.account.name}"`,
        backorder.quantity,
        backorder.quantityPending,
        `"${getStatusInfo(backorder.status).label}"`,
        `"${getPriorityInfo(backorder.priority).label}"`,
        backorder.lineTotal,
        new Date(backorder.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backorders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Loading backorders...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backorders</h1>
            <p className="text-gray-600">Customer orders that cannot be fulfilled due to insufficient stock</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button 
              onClick={() => setIsFiltersOpen(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button 
              onClick={fetchBackorders}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* AI Recommendation and Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendation Card - Left Side */}
          <div className="lg:col-span-2">
            <AIRecommendationCard
              title="Backorder Management AI"
              subtitle="Your intelligent assistant for order fulfillment optimization"
              recommendations={aiRecommendations}
              onRecommendationComplete={handleRecommendationComplete}
            />
          </div>

          {/* Metrics Cards - Right Side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent Orders</p>
                  <p className="text-xl font-bold text-red-600">{summary.urgent}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-red-600">{summary.pending}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partial</p>
                  <p className="text-xl font-bold text-yellow-600">{summary.partiallyFulfilled}</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-100">
                  <TrendingDown className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-orange-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(summary.totalValue)}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-orange-100">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Backorders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Backorder Orders ({filteredBackorders.length})</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Customer orders that cannot be fulfilled due to insufficient stock
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders, products, customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                {selectedItems.length > 0 && (
                  <Button 
                    onClick={() => setIsBulkActionOpen(true)}
                    className={`${theme.primaryBg} text-white`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Bulk Actions ({selectedItems.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredBackorders}
              onRowClick={handleViewProduct}
              columns={[
                {
                  key: 'order',
                  label: 'Order',
                  render: (backorder) => (
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-purple-100 mr-3">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{backorder.orderNumber}</div>
                        <div className="text-sm text-gray-500">{backorder.orderType}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'product',
                  label: 'Product',
                  render: (backorder) => (
                    <div>
                      <div className="font-medium text-gray-900">{backorder.product.name}</div>
                      <div className="text-sm text-gray-500">{backorder.product.sku}</div>
                    </div>
                  )
                },
                {
                  key: 'customer',
                  label: 'Customer',
                  render: (backorder) => (
                    <div className="flex items-center">
                      <div className="p-1 rounded bg-blue-100 mr-2">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{backorder.account.name}</div>
                        <div className="text-sm text-gray-500">{backorder.owner.name}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'quantity',
                  label: 'Quantity',
                  render: (backorder) => (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {backorder.quantity} {backorder.product.stockItems[0]?.warehouse?.code || 'pcs'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pending: {backorder.quantityPending}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (backorder) => {
                    const statusInfo = getStatusInfo(backorder.status);
                    return (
                      <div className="flex items-center">
                        <div className={`p-1 rounded ${statusInfo.color}`}>
                          {statusInfo.icon}
                        </div>
                        <span className="ml-2 font-medium">{statusInfo.label}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (backorder) => {
                    const priorityInfo = getPriorityInfo(backorder.priority);
                    return (
                      <div className="flex items-center">
                        <div className={`p-1 rounded ${priorityInfo.color}`}>
                          {priorityInfo.icon}
                        </div>
                        <span className="ml-2 font-medium">{priorityInfo.label}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'value',
                  label: 'Value',
                  render: (backorder) => (
                    <div className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(backorder.lineTotal)}
                    </div>
                  )
                },
                {
                  key: 'created',
                  label: 'Created',
                  render: (backorder) => (
                    <div className="text-sm text-gray-600">
                      {new Date(backorder.createdAt).toLocaleDateString()}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (backorder) => (
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "View Order",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => window.open(`/${backorder.orderType.toLowerCase()}s/${backorder.orderId}`, '_blank')
                        },
                        {
                          label: "Fulfill Order",
                          icon: <CheckCircle className="h-4 w-4" />,
                          onClick: () => {
                            // TODO: Implement order fulfillment
                            console.log('Fulfill order', backorder.id);
                          }
                        },
                        {
                          label: "Update Priority",
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => {
                            // TODO: Implement priority update
                            console.log('Update priority for', backorder.id);
                          }
                        }
                      ]}
                    />
                  )
                }
              ]}
              itemsPerPage={10}
              enableSelection={true}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              getRowClassName={(backorder) => {
                if (backorder.priority === 'URGENT') {
                  return 'bg-red-50 hover:bg-red-100';
                } else if (backorder.priority === 'HIGH') {
                  return 'bg-orange-50 hover:bg-orange-100';
                }
                return '';
              }}
            />
          </CardContent>
        </Card>

        {/* Filters Modal */}
        {isFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <p className="text-sm text-gray-600">Filter backorder orders</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFiltersOpen(false)}
                  className="h-8 w-8"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Customers</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedPriority("all");
                      setSelectedAccount("");
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsFiltersOpen(false)}
                    className={theme.primaryBg}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Modal */}
        {isBulkActionOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bulk Actions</h2>
                    <p className="text-sm text-gray-600">{selectedItems.length} orders selected</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsBulkActionOpen(false)}
                  className="h-8 w-8"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Action</option>
                    <option value="update_priority">Update Priority to High</option>
                    <option value="cancel">Cancel Orders</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkActionOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className={theme.primaryBg}
                  >
                    Execute Action
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}