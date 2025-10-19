"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Calendar,
  Search,
  Plus,
  Loader2,
  Trash2,
  Eye,
  Edit,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Building,
  User,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  ReceiptText
} from "lucide-react";
import Link from "next/link";
import { AddOrderModal } from "@/components/modals/add-order-modal";
import { EditOrderModal } from "@/components/modals/edit-order-modal";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  customerType?: string;
  notes?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  distributor?: {
    id: string;
    businessName: string;
    email?: string;
    phone?: string;
  };
  account?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
  createdByUser: {
    id: string;
    name: string;
  };
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [thisMonthOrders, setThisMonthOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/orders?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setTotalOrders(data.data.pagination.total);

        // Calculate metrics (fetch all for accurate metrics)
        const allOrdersResponse = await fetch(`/api/orders?limit=9999`, { credentials: 'include' });
        const allOrdersData = await allOrdersResponse.json();
        const allOrders: Order[] = allOrdersData.success ? allOrdersData.data.orders : [];

        let totalValue = 0;
        let pendingCount = 0;
        let monthValue = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        allOrders.forEach(order => {
          totalValue += order.totalAmount;
          if (order.status === 'PENDING') pendingCount++;
          
          const orderDate = new Date(order.createdAt);
          if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            monthValue += order.totalAmount;
          }
        });

        setTotalValue(totalValue);
        setPendingOrders(pendingCount);
        setThisMonthOrders(monthValue);

      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }

    } catch (err) {
      console.error('Error fetching orders:', err);
      error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, error]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }

      success('Order deleted successfully!');
      fetchOrders();
      setShowDeleteConfirmation(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      error(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'PROCESSING': return <Package className="h-4 w-4 text-orange-500" />;
      case 'SHIPPED': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RETURNED': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-orange-100 text-orange-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'RETURNED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (order: Order) => {
    if (order.customerType === 'account' && order.account) {
      return order.account.name;
    } else if (order.customerType === 'contact' && order.contact) {
      return `${order.contact.firstName} ${order.contact.lastName}`;
    } else if (order.distributor) {
      return order.distributor.businessName;
    }
    return 'Unknown Customer';
  };

  const getCustomerLink = (order: Order) => {
    if (order.customerType === 'account' && order.account) {
      return `/crm/accounts/${order.account.id}`;
    } else if (order.customerType === 'contact' && order.contact) {
      return `/crm/contacts/${order.contact.id}`;
    } else if (order.distributor) {
      return `/drm/distributors/${order.distributor.id}`;
    }
    return '#';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'credit': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      case 'mobile_money': return <Smartphone className="h-4 w-4" />;
      default: return <ReceiptText className="h-4 w-4" />;
    }
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const availableStatuses = Object.values(OrderStatus);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: getThemeColor() }}
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          Create Order
        </button>
      </div>

      {/* AI Card + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* AI Recommendation Card - Left Side (2/3) */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="Order Management AI"
            subtitle="Your intelligent assistant for order fulfillment"
            recommendations={[
              {
                id: '1',
                title: "Process pending orders",
                description: `${pendingOrders} order${pendingOrders !== 1 ? 's' : ''} awaiting confirmation`,
                priority: pendingOrders > 0 ? 'high' : 'low',
                completed: false
              },
              {
                id: '2',
                title: "Monitor order fulfillment",
                description: "Track orders in processing and shipping status",
                priority: 'medium',
                completed: false
              },
              {
                id: '3',
                title: "Monthly performance",
                description: `${formatCurrency(thisMonthOrders)} in orders this month`,
                priority: 'low',
                completed: false
              }
            ]}
            onRecommendationComplete={(id) => {
              console.log('Recommendation completed:', id);
            }}
          />
        </div>

        {/* Metrics Cards - Right Side (1/3, 2x2 Grid) */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className={`text-2xl font-bold text-${theme.primary}`}>{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className={`h-8 w-8 text-${theme.primary}`} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(thisMonthOrders)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium">No orders found.</p>
              <p className="text-sm mt-2">Click "Create Order" to add your first order.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`bg-${theme.primary} text-white`}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Order #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        Created
                      </th>
                      <th scope="col" className="relative px-6 py-3" style={{ backgroundColor: theme.primary, color: 'white' }}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href={getCustomerLink(order)} className={`text-${theme.primary} hover:underline`}>
                            {getCustomerName(order)}
                          </Link>
                          <p className="text-xs text-gray-400 capitalize">{order.customerType || 'distributor'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status.replace(/_/g, ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <span className="ml-2">{order.paymentMethod.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowDeleteConfirmation(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddOrderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchOrders();
          setShowAddModal(false);
        }}
      />

      {selectedOrder && (
        <EditOrderModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchOrders();
            setShowEditModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        message={`Are you sure you want to delete order ${selectedOrder?.orderNumber}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
