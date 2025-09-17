"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { AddStockMovementModal } from "@/components/modals/add-stock-movement-modal";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { DataTable } from "@/components/ui/data-table";
import { BulkStockMovementModal } from "@/components/modals/bulk-stock-movement-modal";
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
  Eye,
  FileSpreadsheet
} from "lucide-react";

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

interface StockMovementsClientProps {
  initialMovements: StockMovement[];
}

export function StockMovementsClient({ initialMovements }: StockMovementsClientProps) {
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Review unusual movements',
      description: 'Several large stock adjustments require management review and approval.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Optimize transfer patterns',
      description: 'Analyze frequent transfers between warehouses for efficiency improvements.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Update movement tracking',
      description: 'Enhance tracking documentation for better inventory audit trails.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

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

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      
      // Add product filter if present in URL
      const productParam = searchParams.get('product');
      if (productParam) {
        params.append("productId", productParam);
      }
      
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

  useEffect(() => {
    fetchMovements();
  }, [selectedType, searchParams]);

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success("Recommendation completed! Great job!");
  };

  // Handle product filter from URL
  useEffect(() => {
    const productParam = searchParams.get('product');
    if (productParam) {
      setSearchTerm(productParam);
    }
  }, [searchParams]);

  const handleMovementAdded = () => {
    // Refresh the movements list
    fetchMovements();
  };

  const handleBulkUploadSuccess = () => {
    // Refresh the movements list
    fetchMovements();
    setIsBulkUploadModalOpen(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600">Track and manage all stock movements</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchMovements}
            variant="outline"
          >
            Refresh Data
          </Button>
          <Button 
            onClick={() => setIsBulkUploadModalOpen(true)}
            variant="outline"
            className="mr-2"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock Movement
          </Button>
        </div>
      </div>

      {/* AI Recommendation and Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendation Card - Left Side */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="Stock Movement AI"
            subtitle="Your intelligent assistant for movement tracking"
            recommendations={aiRecommendations}
            onRecommendationComplete={handleRecommendationComplete}
          />
        </div>

        {/* Metrics Cards - Right Side */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Movements</p>
                <p className="text-xl font-bold text-gray-900">{movements.length}</p>
              </div>
              <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                <Package className={`w-5 h-5 text-${theme.primary}`} />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Ins</p>
                <p className="text-xl font-bold text-green-600">{movements.filter(m => m.quantity > 0).length}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Outs</p>
                <p className="text-xl font-bold text-red-600">{movements.filter(m => m.quantity < 0).length}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adjustments</p>
                <p className="text-xl font-bold text-blue-600">{movements.filter(m => m.type === 'ADJUSTMENT').length}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
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
        <CardContent className="p-0">
          <DataTable
            data={filteredMovements}
            enableSelection={true}
            selectedItems={selectedMovements}
            onSelectionChange={setSelectedMovements}
            bulkActions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const { downloadCSV } = await import('@/lib/export-utils');
                      const exportData = movements
                        .filter(m => selectedMovements.includes(m.id))
                        .map(movement => ({
                          'Product': movement.product.name,
                          'SKU': movement.product.sku,
                          'Type': movement.type,
                          'Quantity': movement.quantity,
                          'Reference': movement.reference || '',
                          'Reason': movement.reason || '',
                          'Date': new Date(movement.createdAt).toLocaleDateString(),
                          'Stock After': movement.stockAfter,
                          'Unit Cost': movement.unitCost || 0,
                          'Total Cost': movement.totalCost || 0,
                          'Warehouse': movement.warehouse.name
                        }));
                      downloadCSV(exportData, `stock_movements_export_${new Date().toISOString().split('T')[0]}.csv`);
                      success(`Successfully exported ${selectedMovements.length} movement(s)`);
                    } catch (error) {
                      success('Export functionality coming soon!');
                    }
                  }}
                  disabled={selectedMovements.length === 0}
                >
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => success('Delete functionality coming soon!')}
                  disabled={selectedMovements.length === 0}
                >
                  Delete
                </Button>
              </div>
            }
            columns={[
              {
                key: 'product',
                label: 'Product',
                render: (movement) => (
                  <div>
                    <div className="font-medium text-gray-900">{movement.product.name}</div>
                    <div className="text-sm text-gray-500">{movement.product.sku}</div>
                  </div>
                )
              },
              {
                key: 'type',
                label: 'Type',
                render: (movement) => {
                  const typeInfo = getMovementTypeInfo(movement.type);
                  return (
                    <div className="flex items-center">
                      <div className={`p-1 rounded ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <span className="ml-2 font-medium">{typeInfo.label}</span>
                    </div>
                  );
                }
              },
              {
                key: 'quantity',
                label: 'Quantity',
                render: (movement) => (
                  <div className={`flex items-center font-medium ${getQuantityColor(movement.quantity)}`}>
                    {getQuantityIcon(movement.quantity)}
                    <span className="ml-1">
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.uomBase}
                    </span>
                  </div>
                )
              },
              {
                key: 'reference',
                label: 'Reference',
                render: (movement) => (
                  <span className="text-sm text-gray-600">
                    {movement.reference || '-'}
                  </span>
                )
              },
              {
                key: 'reason',
                label: 'Reason',
                render: (movement) => (
                  <span className="text-sm text-gray-600">
                    {movement.reason || '-'}
                  </span>
                )
              },
              {
                key: 'date',
                label: 'Date',
                render: (movement) => (
                  <div>
                    <div className="text-sm text-gray-600">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(movement.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                )
              },
              {
                key: 'stockAfter',
                label: 'Stock After',
                render: (movement) => (
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {(() => {
                        // Calculate stock level after this movement
                        // We need to work backwards from current stock
                        const currentStock = movement.stockItem.quantity;
                        const movementIndex = filteredMovements.findIndex(m => m.id === movement.id);
                        const movementsAfterThis = filteredMovements.slice(0, movementIndex);
                        
                        // Calculate what stock was after this movement
                        let stockAfterThisMovement = currentStock;
                        movementsAfterThis.forEach(m => {
                          stockAfterThisMovement -= m.quantity;
                        });
                        
                        return stockAfterThisMovement;
                      })()} {movement.product.uomBase}
                    </div>
                    <div className="text-xs text-gray-500">
                      Available: {(() => {
                        // Calculate available stock after this movement
                        const currentAvailable = movement.stockItem.available;
                        const movementIndex = filteredMovements.findIndex(m => m.id === movement.id);
                        const movementsAfterThis = filteredMovements.slice(0, movementIndex);
                        
                        let availableAfterThisMovement = currentAvailable;
                        movementsAfterThis.forEach(m => {
                          availableAfterThisMovement -= m.quantity;
                        });
                        
                        return availableAfterThisMovement;
                      })()}
                    </div>
                  </div>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (movement) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/products/${movement.product.id}`)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Product
                  </Button>
                )
              }
            ]}
            itemsPerPage={10}
          />
        </CardContent>
      </Card>

      {/* Add Movement Modal */}
      <AddStockMovementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMovementAdded}
      />

      {/* Bulk Upload Modal */}
      <BulkStockMovementModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </div>
  );
}
