"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { AddWarehouseModal } from "@/components/modals/add-warehouse-modal";
import { EditWarehouseModal } from "@/components/modals/edit-warehouse-modal";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { DataTable } from "@/components/ui/data-table";
import { useTheme } from "@/contexts/theme-context";
import { 
  Search, 
  Filter, 
  Building, 
  Plus,
  MapPin,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WarehousesPage() {
  const { success, error: showError } = useToast();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: '1',
      title: 'Optimize warehouse capacity',
      description: 'Review warehouse utilization and optimize space allocation for better efficiency.',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Update warehouse locations',
      description: 'Verify and update warehouse address information for accurate logistics.',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Review inactive warehouses',
      description: 'Evaluate inactive warehouse status and consider reactivation or removal.',
      priority: 'low' as const,
      completed: false,
    },
  ]);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      if (!response.ok) {
        throw new Error('Failed to fetch warehouses');
      }
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      showError('Failed to fetch warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleWarehouseSuccess = () => {
    fetchWarehouses();
  };

  const handleViewWarehouse = (warehouse: Warehouse) => {
    router.push(`/warehouses/${warehouse.id}`);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditModalOpen(true);
  };

  const handleRecommendationComplete = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
    success("Recommendation completed! Great job!");
  };

  const handleDeleteWarehouse = async (warehouseId: string, warehouseName: string) => {
    if (!confirm(`Are you sure you want to delete "${warehouseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/warehouses/${warehouseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete warehouse');
      }

      success('Warehouse deleted successfully');
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete warehouse');
    }
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.city && warehouse.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const totalWarehouses = filteredWarehouses.length;
  const activeWarehouses = filteredWarehouses.filter(w => w.isActive).length;
  const inactiveWarehouses = filteredWarehouses.filter(w => !w.isActive).length;

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-600">Manage your warehouse locations and inventory storage</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* AI Recommendation and Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendation Card - Left Side */}
        <div className="lg:col-span-2">
          <AIRecommendationCard
            title="Warehouse Management AI"
            subtitle="Your intelligent assistant for warehouse optimization"
            recommendations={aiRecommendations}
            onRecommendationComplete={handleRecommendationComplete}
          />
        </div>

        {/* Metrics Cards - Right Side */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                <p className="text-xl font-bold text-gray-900">{totalWarehouses}</p>
              </div>
              <div className={`p-2 rounded-full bg-${theme.primaryBg}`}>
                <Building className={`w-5 h-5 text-${theme.primary}`} />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl font-bold text-green-600">{activeWarehouses}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-xl font-bold text-gray-600">{inactiveWarehouses}</p>
              </div>
              <div className="p-2 rounded-full bg-gray-100">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search warehouses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Warehouses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading warehouses...</p>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first warehouse.</p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            </div>
          ) : (
            <DataTable
              data={filteredWarehouses}
              enableSelection={true}
              selectedItems={selectedWarehouses}
              onSelectionChange={setSelectedWarehouses}
              bulkActions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { downloadCSV } = await import('@/lib/export-utils');
                        const exportData = warehouses
                          .filter(w => selectedWarehouses.includes(w.id))
                          .map(warehouse => ({
                            'Name': warehouse.name,
                            'Code': warehouse.code,
                            'Address': warehouse.address || '',
                            'City': warehouse.city || '',
                            'Country': warehouse.country || '',
                            'Status': warehouse.isActive ? 'Active' : 'Inactive',
                            'Created Date': new Date(warehouse.createdAt).toLocaleDateString()
                          }));
                        downloadCSV(exportData, `warehouses_export_${new Date().toISOString().split('T')[0]}.csv`);
                        success(`Successfully exported ${selectedWarehouses.length} warehouse(s)`);
                      } catch (error) {
                        success('Export functionality coming soon!');
                      }
                    }}
                    disabled={selectedWarehouses.length === 0}
                  >
                    Export
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => success('Delete functionality coming soon!')}
                    disabled={selectedWarehouses.length === 0}
                  >
                    Delete
                  </Button>
                </div>
              }
              columns={[
                {
                  key: 'warehouse',
                  label: 'Warehouse',
                  render: (warehouse) => (
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 mr-3">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{warehouse.name}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'code',
                  label: 'Code',
                  render: (warehouse) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {warehouse.code}
                    </span>
                  )
                },
                {
                  key: 'location',
                  label: 'Location',
                  render: (warehouse) => (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {warehouse.city && warehouse.country ? (
                        `${warehouse.city}, ${warehouse.country}`
                      ) : (
                        <span className="text-gray-400">No location set</span>
                      )}
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (warehouse) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      warehouse.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {warehouse.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )
                },
                {
                  key: 'created',
                  label: 'Created',
                  render: (warehouse) => (
                    <div className="text-sm text-gray-600">
                      {new Date(warehouse.createdAt).toLocaleDateString()}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (warehouse) => (
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "View Details",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => handleViewWarehouse(warehouse)
                        },
                        {
                          label: "Edit Warehouse",
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => handleEditWarehouse(warehouse)
                        },
                        {
                          label: "Delete Warehouse",
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handleDeleteWarehouse(warehouse.id, warehouse.name),
                          className: "text-red-600"
                        }
                      ]}
                    />
                  )
                }
              ]}
              itemsPerPage={10}
            />
          )}
        </CardContent>
      </Card>
      </div>
      
      <AddWarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleWarehouseSuccess}
      />
      
      <EditWarehouseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedWarehouse(null);
        }}
        onSuccess={handleWarehouseSuccess}
        warehouse={selectedWarehouse}
      />
    </MainLayout>
  );
}
