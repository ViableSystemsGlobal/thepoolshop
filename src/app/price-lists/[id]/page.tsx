"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/utils";
import { AddProductToPriceListModal } from "@/components/modals/add-product-to-price-list-modal";
import { EditPriceListModal } from "@/components/modals/edit-price-list-modal";
import { EditPriceListItemModal } from "@/components/modals/edit-price-list-item-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  DollarSign, 
  Edit, 
  Copy,
  Trash2,
  Plus,
  Search,
  Package,
  Calendar,
  Users,
  TrendingUp
} from "lucide-react";

interface PriceList {
  id: string;
  name: string;
  channel: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    productId: string;
    unitPrice: number;
    basePrice: number | null;
    exchangeRate: number | null;
    product: {
      id: string;
      name: string;
      sku: string;
      uomSell: string;
    };
  }>;
  _count?: {
    items: number;
  };
}


export default function PriceListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/price-lists/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPriceList(data);
        } else {
          console.error('Failed to fetch price list');
          setPriceList(null);
        }
      } catch (error) {
        console.error('Error fetching price list:', error);
        setPriceList(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPriceList();
    }
  }, [params.id]);

  const filteredItems = priceList?.items?.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriceListStatus = (priceList: PriceList) => {
    const now = new Date();
    const effectiveFrom = new Date(priceList.effectiveFrom);
    const effectiveTo = priceList.effectiveTo ? new Date(priceList.effectiveTo) : null;
    
    if (now < effectiveFrom) {
      return "scheduled";
    } else if (!effectiveTo || now <= effectiveTo) {
      return "active";
    } else {
      return "expired";
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "retail":
        return "bg-purple-100 text-purple-800";
      case "wholesale":
        return "bg-orange-100 text-orange-800";
      case "distributor":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCopy = async () => {
    if (!priceList) return;
    
    try {
      const response = await fetch('/api/price-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${priceList.name} (Copy)`,
          channel: priceList.channel,
          currency: priceList.currency,
          effectiveFrom: new Date().toISOString().split('T')[0],
          effectiveTo: priceList.effectiveTo,
        }),
      });

      if (response.ok) {
        const newPriceList = await response.json();
        success("Price List Copied", `"${newPriceList.name}" has been created successfully.`);
        router.push(`/price-lists/${newPriceList.id}`);
      } else {
        const errorData = await response.json();
        showError("Copy Failed", errorData.error || 'Failed to copy price list');
      }
    } catch (error) {
      showError("Network Error", 'Network error. Please try again.');
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!priceList) return;
    
    try {
      const response = await fetch(`/api/price-lists/${priceList.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success("Price List Deleted", `"${priceList.name}" has been deleted successfully.`);
        router.push('/price-lists');
      } else {
        const errorData = await response.json();
        showError("Delete Failed", errorData.error || 'Failed to delete price list');
      }
    } catch (error) {
      showError("Network Error", 'Network error. Please try again.');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddProduct = () => {
    setIsAddProductModalOpen(true);
  };

  const handleRefreshData = () => {
    // Refresh the price list data
    if (params.id) {
      const fetchPriceList = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/price-lists/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            setPriceList(data);
          } else {
            console.error('Failed to fetch price list');
            setPriceList(null);
          }
        } catch (error) {
          console.error('Error fetching price list:', error);
          setPriceList(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPriceList();
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsEditItemModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from this price list?`)) {
      try {
        const response = await fetch(`/api/price-lists/${priceList?.id}/items/${itemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          success("Product Removed", `"${productName}" has been removed from the price list.`);
          handleRefreshData(); // Refresh the price list data
        } else {
          const errorData = await response.json();
          showError("Delete Failed", errorData.error || 'Failed to remove product from price list');
        }
      } catch (error) {
        console.error('Error deleting price list item:', error);
        showError("Network Error", 'Network error. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading price list details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!priceList) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-gray-600">Price list not found</p>
          <Button 
            onClick={() => router.push('/price-lists')}
            className="mt-4"
          >
            Back to Price Lists
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/price-lists')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Price Lists
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{priceList.name}</h1>
              <p className="text-gray-600">{priceList.channel} • {priceList.currency}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Price List Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-50">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Channel</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChannelColor(priceList.channel)}`}>
                    {priceList.channel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-blue-600">{priceList._count?.items || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-50">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getPriceListStatus(priceList))}`}>
                    {getPriceListStatus(priceList)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-50">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Currency</p>
                  <p className="text-2xl font-bold text-orange-600">{priceList.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price List Details */}
        <Card>
          <CardHeader>
            <CardTitle>Price List Details</CardTitle>
            <CardDescription>
              Effective from {new Date(priceList.effectiveFrom).toLocaleDateString()} to {priceList.effectiveTo ? new Date(priceList.effectiveTo).toLocaleDateString() : 'No expiration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{priceList.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Channel:</span>
                    <span className="font-medium">{priceList.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">{priceList.currency}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(priceList.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effective From:</span>
                    <span className="font-medium">{new Date(priceList.effectiveFrom).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effective To:</span>
                    <span className="font-medium">{priceList.effectiveTo ? new Date(priceList.effectiveTo).toLocaleDateString() : 'No expiration'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{getPriceListStatus(priceList)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products in Price List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products in Price List ({filteredItems.length})</CardTitle>
                <CardDescription>
                  Manage products and their pricing in this price list
                </CardDescription>
              </div>
              <Button onClick={handleAddProduct} className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Selling Unit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Unit Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{priceList.channel.charAt(0).toUpperCase() + priceList.channel.slice(1)} Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.product.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{item.product.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{item.product.uomSell || 'pcs'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{formatCurrency(item.unitPrice, priceList.currency)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{item.basePrice ? formatCurrency(item.basePrice, priceList.currency) : 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            title="Edit pricing"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(item.id, item.product.name)}
                            title="Remove from price list"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Product Modal */}
        <AddProductToPriceListModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onSuccess={handleRefreshData}
          priceListId={params.id as string}
        />

        {/* Edit Price List Modal */}
        <EditPriceListModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleRefreshData}
          priceList={priceList}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Price List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete the price list "{priceList?.name}"? This action cannot be undone and will remove all associated pricing data.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Price List Item Modal */}
        {editingItem && (
          <EditPriceListItemModal
            isOpen={isEditItemModalOpen}
            onClose={() => {
              setIsEditItemModalOpen(false);
              setEditingItem(null);
            }}
            onSuccess={handleRefreshData}
            priceListId={priceList?.id || ''}
            itemId={editingItem.id}
            productName={editingItem.product.name}
            currentUnitPrice={editingItem.unitPrice}
            currentBasePrice={editingItem.basePrice}
            currency={priceList?.currency || 'GHS'}
            channel={priceList?.channel || 'retail'}
          />
        )}
      </div>
    </MainLayout>
  );
}
