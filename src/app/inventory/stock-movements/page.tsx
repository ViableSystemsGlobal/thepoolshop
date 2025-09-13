"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  TrendingUp, 
  TrendingDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Eye
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reference?: string;
  reason?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    uomBase: string;
  };
  stockItem: {
    id: string;
    quantity: number;
    available: number;
  };
}

interface StockMovementType {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({
    productId: "",
    type: "RECEIPT",
    quantity: 0,
    reference: "",
    reason: "",
    notes: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  const movementTypes: StockMovementType[] = [
    {
      value: "RECEIPT",
      label: "Receipt",
      icon: <ArrowDown className="h-4 w-4" />,
      color: "text-green-600",
      description: "Stock received from supplier"
    },
    {
      value: "ADJUSTMENT",
      label: "Adjustment",
      icon: <RotateCcw className="h-4 w-4" />,
      color: "text-blue-600",
      description: "Manual stock adjustment"
    },
    {
      value: "TRANSFER_IN",
      label: "Transfer In",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      color: "text-purple-600",
      description: "Stock transferred in"
    },
    {
      value: "TRANSFER_OUT",
      label: "Transfer Out",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      color: "text-orange-600",
      description: "Stock transferred out"
    },
    {
      value: "SALE",
      label: "Sale",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-emerald-600",
      description: "Stock sold to customer"
    },
    {
      value: "RETURN",
      label: "Return",
      icon: <ArrowUp className="h-4 w-4" />,
      color: "text-cyan-600",
      description: "Stock returned from customer"
    },
    {
      value: "DAMAGE",
      label: "Damage",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      description: "Stock damaged/lost"
    },
    {
      value: "THEFT",
      label: "Theft",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-700",
      description: "Stock stolen"
    },
    {
      value: "EXPIRY",
      label: "Expiry",
      icon: <Calendar className="h-4 w-4" />,
      color: "text-yellow-600",
      description: "Stock expired"
    },
    {
      value: "OTHER",
      label: "Other",
      icon: <FileText className="h-4 w-4" />,
      color: "text-gray-600",
      description: "Other reasons"
    }
  ];

  useEffect(() => {
    fetchMovements();
  }, []);

  // Handle product filter from URL
  useEffect(() => {
    const productParam = searchParams.get('product');
    if (productParam) {
      // You could set a product filter here if needed
      console.log('Filtering by product:', productParam);
    }
  }, [searchParams]);

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      
      const response = await fetch(`/api/stock-movements?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      } else {
        console.error('Failed to fetch stock movements');
      }
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovement.productId || newMovement.quantity === 0) {
      showError("Validation Error", "Product and quantity are required");
      return;
    }

    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMovement),
      });

      if (response.ok) {
        const data = await response.json();
        setMovements([data, ...movements]);
        setNewMovement({
          productId: "",
          type: "RECEIPT",
          quantity: 0,
          reference: "",
          reason: "",
          notes: "",
        });
        setIsAddModalOpen(false);
        success("Stock Movement Added", "Stock movement has been recorded successfully.");
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || 'Failed to add stock movement');
      }
    } catch (error) {
      console.error('Error adding stock movement:', error);
      showError("Network Error", 'Unable to connect to server. Please try again.');
    }
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find(t => t.value === type) || movementTypes[movementTypes.length - 1];
  };

  const filteredMovements = movements.filter(movement => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      movement.product.name.toLowerCase().includes(searchLower) ||
      movement.product.sku.toLowerCase().includes(searchLower) ||
      (movement.reference && movement.reference.toLowerCase().includes(searchLower)) ||
      (movement.reason && movement.reason.toLowerCase().includes(searchLower));
    
    const matchesType = selectedType === "all" || movement.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getQuantityColor = (quantity: number) => {
    return quantity > 0 ? "text-green-600" : "text-red-600";
  };

  const getQuantityIcon = (quantity: number) => {
    return quantity > 0 ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
            <p className="text-gray-600">Track and manage all stock movements</p>
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock Movement
          </Button>
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
                  <p className="text-sm font-medium text-gray-600">Total Movements</p>
                  <p className={`text-2xl font-bold text-${theme.primary}`}>{movements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Stock Ins</p>
                  <p className="text-2xl font-bold text-green-600">
                    {movements.filter(m => m.quantity > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-100">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Stock Outs</p>
                  <p className="text-2xl font-bold text-red-600">
                    {movements.filter(m => m.quantity < 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Adjustments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {movements.filter(m => m.type === 'ADJUSTMENT').length}
                  </p>
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
                    placeholder="Search by product name, SKU, reference, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {movementTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Movements ({filteredMovements.length})</CardTitle>
            <CardDescription>
              Complete history of all stock movements and adjustments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stock After</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type);
                    return (
                      <tr key={movement.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{movement.product.name}</div>
                            <div className="text-sm text-gray-500">{movement.product.sku}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className={`p-1 rounded ${typeInfo.color}`}>
                              {typeInfo.icon}
                            </div>
                            <span className="ml-2 font-medium">{typeInfo.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center font-medium ${getQuantityColor(movement.quantity)}`}>
                            {getQuantityIcon(movement.quantity)}
                            <span className="ml-1">
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.uomBase}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {movement.reference || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {movement.reason || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(movement.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(movement.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {movement.stockItem.quantity} {movement.product.uomBase}
                          </div>
                          <div className="text-xs text-gray-500">
                            Available: {movement.stockItem.available}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/products/${movement.product.id}`)}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Product
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

        {/* Add Movement Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Add Stock Movement</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  ×
                </Button>
              </div>

              <form onSubmit={handleAddMovement} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID *
                  </label>
                  <Input
                    value={newMovement.productId}
                    onChange={(e) => setNewMovement({ ...newMovement, productId: e.target.value })}
                    placeholder="Enter product ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Movement Type *
                  </label>
                  <select
                    value={newMovement.type}
                    onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {movementTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    value={newMovement.quantity}
                    onChange={(e) => setNewMovement({ ...newMovement, quantity: Number(e.target.value) })}
                    placeholder="Enter quantity (positive for in, negative for out)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <Input
                    value={newMovement.reference}
                    onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                    placeholder="e.g., PO-12345, SO-67890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <Input
                    value={newMovement.reason}
                    onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                    placeholder="Reason for this movement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newMovement.notes}
                    onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                    placeholder="Additional notes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
                  >
                    Add Movement
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
