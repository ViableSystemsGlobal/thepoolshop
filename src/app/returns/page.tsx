"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PackageX,
  Calendar,
  Search,
  Plus,
  Loader2,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  RefreshCw,
  Ban
} from "lucide-react";
import Link from "next/link";
import { AddReturnModal } from "@/components/modals/add-return-modal";
import { EditReturnModal } from "@/components/modals/edit-return-modal";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ReturnStatus, ReturnReason } from "@prisma/client";

interface Return {
  id: string;
  number: string;
  reason: ReturnReason;
  status: ReturnStatus;
  subtotal: number;
  tax: number;
  total: number;
  refundAmount: number;
  refundMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  account: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  salesOrder: {
    id: string;
    number: string;
  };
  creator: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
  lines: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    reason?: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
}

export default function ReturnsPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();

  const [returns, setReturns] = useState<Return[]>([]);
  const [totalReturns, setTotalReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [pendingReturns, setPendingReturns] = useState(0);
  const [thisMonthReturns, setThisMonthReturns] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | ''>('');
  const [filterReason, setFilterReason] = useState<ReturnReason | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterReason) params.append('reason', filterReason);

      const response = await fetch(`/api/returns?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch returns');
      }
      const data = await response.json();
      setReturns(data.returns);
      setTotalReturns(data.total);

      // Calculate metrics (fetch all for accurate metrics)
      const allReturnsResponse = await fetch(`/api/returns?limit=9999`, { credentials: 'include' });
      const allReturnsData = await allReturnsResponse.json();
      const allReturns: Return[] = allReturnsData.returns;

      let totalValue = 0;
      let pendingCount = 0;
      let monthValue = 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      allReturns.forEach(ret => {
        totalValue += ret.total;
        if (ret.status === 'PENDING') pendingCount++;
        
        const returnDate = new Date(ret.createdAt);
        if (returnDate.getMonth() === currentMonth && returnDate.getFullYear() === currentYear) {
          monthValue += ret.total;
        }
      });

      setTotalValue(totalValue);
      setPendingReturns(pendingCount);
      setThisMonthReturns(monthValue);

    } catch (err) {
      console.error('Error fetching returns:', err);
      error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, filterReason, error]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleDeleteReturn = async () => {
    if (!selectedReturn) return;

    try {
      const response = await fetch(`/api/returns/${selectedReturn.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete return');
      }

      success('Return deleted successfully!');
      fetchReturns();
      setShowDeleteConfirmation(false);
      setSelectedReturn(null);
    } catch (err) {
      console.error('Error deleting return:', err);
      error(err instanceof Error ? err.message : 'Failed to delete return');
    }
  };

  const getStatusIcon = (status: ReturnStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'REFUNDED': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <Ban className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason: ReturnReason) => {
    switch (reason) {
      case 'DAMAGED': return 'bg-red-50 text-red-700';
      case 'DEFECTIVE': return 'bg-orange-50 text-orange-700';
      case 'WRONG_ITEM': return 'bg-purple-50 text-purple-700';
      case 'CUSTOMER_REQUEST': return 'bg-blue-50 text-blue-700';
      case 'QUALITY_ISSUE': return 'bg-yellow-50 text-yellow-700';
      case 'OTHER': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const totalPages = Math.ceil(totalReturns / itemsPerPage);
  const availableStatuses = Object.values(ReturnStatus);
  const availableReasons = Object.values(ReturnReason);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Returns</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: getThemeColor() }}
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          Create Return
        </button>
      </div>

      {/* AI Card + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* AI Recommendation Card - Left Side (2/3) */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="Returns Management AI"
            subtitle="Your intelligent assistant for return processing"
            recommendations={[
              {
                id: '1',
                title: "Process pending returns",
                description: `${pendingReturns} return${pendingReturns !== 1 ? 's' : ''} awaiting approval`,
                priority: pendingReturns > 0 ? 'high' : 'low',
                completed: false
              },
              {
                id: '2',
                title: "Return analysis",
                description: "Analyze return patterns to identify quality issues",
                priority: 'medium',
                completed: false
              },
              {
                id: '3',
                title: "Monthly returns",
                description: `${formatCurrency(thisMonthReturns)} in returns this month`,
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
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{totalReturns}</p>
              </div>
              <PackageX className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold" style={{ color: getThemeColor() }}>{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8" style={{ color: getThemeColor() }} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReturns}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(thisMonthReturns)}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-400" />
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
                placeholder="Search returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReturnStatus | '')}
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
            <div>
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value as ReturnReason | '')}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Reasons</option>
                {availableReasons.map(reason => (
                  <option key={reason} value={reason}>
                    {reason.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Returns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading returns...</span>
            </div>
          ) : returns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PackageX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium">No returns found.</p>
              <p className="text-sm mt-2">Click "Create Return" to process a product return.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="text-white" style={{ backgroundColor: getThemeColor() }}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Return #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Sales Order
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Reason
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        Created
                      </th>
                      <th scope="col" className="relative px-6 py-3" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {returns.map((returnItem) => (
                      <tr key={returnItem.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {returnItem.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href={`/crm/accounts/${returnItem.account.id}`} className="hover:underline" style={{ color: getThemeColor() }}>
                            {returnItem.account.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href={`#`} className="hover:underline" style={{ color: getThemeColor() }}>
                            {returnItem.salesOrder.number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(returnItem.reason)}`}>
                            {returnItem.reason.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                            {getStatusIcon(returnItem.status)}
                            <span className="ml-1">{returnItem.status.replace(/_/g, ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(returnItem.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {returnItem.lines.length} item{returnItem.lines.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(returnItem.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReturn(returnItem);
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
                                setSelectedReturn(returnItem);
                                setShowDeleteConfirmation(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              disabled={returnItem.status !== 'PENDING' && returnItem.status !== 'REJECTED'}
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
      <AddReturnModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchReturns();
          setShowAddModal(false);
        }}
      />

      {selectedReturn && (
        <EditReturnModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchReturns();
            setShowEditModal(false);
            setSelectedReturn(null);
          }}
          returnData={selectedReturn}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteReturn}
        title="Delete Return"
        message={`Are you sure you want to delete return ${selectedReturn?.number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}

