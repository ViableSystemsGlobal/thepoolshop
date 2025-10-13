"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { AddPriceListModal } from "@/components/modals/add-price-list-modal";
import { EditPriceListModal } from "@/components/modals/edit-price-list-modal";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Calendar
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
    };
  }>;
  _count?: {
    items: number;
  };
}

// Mock data for price lists (fallback)
const mockPriceLists = [
  {
    id: 1,
    name: "Standard Retail",
    description: "Standard pricing for retail customers",
    channel: "retail",
    currency: "USD",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2024-12-31",
    productCount: 25,
    status: "active",
    createdAt: "2024-01-01"
  },
  {
    id: 2,
    name: "Wholesale Pricing",
    description: "Discounted pricing for wholesale customers",
    channel: "wholesale",
    currency: "USD",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2024-12-31",
    productCount: 20,
    status: "active",
    createdAt: "2024-01-02"
  },
  {
    id: 3,
    name: "Distributor Pricing",
    description: "Special pricing for authorized distributors",
    channel: "distributor",
    currency: "USD",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2024-12-31",
    productCount: 18,
    status: "active",
    createdAt: "2024-01-03"
  },
  {
    id: 4,
    name: "Holiday Sale 2024",
    description: "Limited time holiday pricing",
    channel: "retail",
    currency: "USD",
    effectiveFrom: "2024-11-01",
    effectiveTo: "2024-12-31",
    productCount: 15,
    status: "scheduled",
    createdAt: "2024-10-15"
  }
];

export default function PriceListsPage() {
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [priceListToEdit, setPriceListToEdit] = useState<PriceList | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [priceListToDelete, setPriceListToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    channel: "retail",
    currency: "GHS",
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: "",
  });
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get theme classes
  const theme = getThemeClasses();

  // Fetch price lists from API
  const fetchPriceLists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/price-lists');
      if (response.ok) {
        const data = await response.json();
        setPriceLists(data);
      } else {
        console.error('Failed to fetch price lists');
        // Fallback to mock data
        setPriceLists(mockPriceLists.map(pl => ({
          id: pl.id.toString(),
          name: pl.name,
          channel: pl.channel,
          currency: pl.currency,
          effectiveFrom: pl.effectiveFrom,
          effectiveTo: pl.effectiveTo,
          createdAt: pl.createdAt,
          updatedAt: pl.createdAt,
          _count: { items: pl.productCount }
        })));
      }
    } catch (error) {
      console.error('Error fetching price lists:', error);
      // Fallback to mock data
      setPriceLists(mockPriceLists.map(pl => ({
        id: pl.id.toString(),
        name: pl.name,
        channel: pl.channel,
        currency: pl.currency,
        effectiveFrom: pl.effectiveFrom,
        effectiveTo: pl.effectiveTo,
        createdAt: pl.createdAt,
        updatedAt: pl.createdAt,
        _count: { items: pl.productCount }
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const filteredPriceLists = priceLists.filter(priceList => {
    const matchesSearch = priceList.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = selectedChannel === "all" || priceList.channel === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  const channels = ["all", ...Array.from(new Set(priceLists.map(pl => pl.channel)))];

  // Action handlers
  const handleViewPriceList = (id: string) => {
    console.log('View price list:', id);
    router.push(`/price-lists/${id}`);
  };

  const handleEditPriceList = (id: string) => {
    console.log('Edit price list:', id);
    // Find the price list to edit
    const priceListToEdit = priceLists.find(pl => pl.id === id);
    if (priceListToEdit) {
      setPriceListToEdit(priceListToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleCopyPriceList = (id: string) => {
    console.log('Copy price list:', id);
    // Find the price list to copy
    const priceListToCopy = priceLists.find(pl => pl.id === id);
    if (priceListToCopy) {
      // Pre-fill the add modal with the copied data
      setFormData({
        name: `${priceListToCopy.name} (Copy)`,
        channel: priceListToCopy.channel,
        currency: priceListToCopy.currency,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: "",
      });
      setIsAddModalOpen(true);
    }
  };

  const handleDeletePriceList = (id: string) => {
    setPriceListToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (priceListToDelete) {
      const priceList = priceLists.find(pl => pl.id === priceListToDelete);
      
      try {
        const response = await fetch(`/api/price-lists/${priceListToDelete}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove the deleted price list from the local state
          setPriceLists(prev => prev.filter(pl => pl.id !== priceListToDelete));
          success("Price List Deleted", `"${priceList?.name || 'Price list'}" has been deleted successfully.`);
        } else {
          const errorData = await response.json();
          showError("Delete Failed", errorData.error || 'Failed to delete price list');
        }
      } catch (error) {
        showError("Network Error", 'Network error. Please try again.');
      } finally {
        setDeleteModalOpen(false);
        setPriceListToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPriceListToDelete(null);
  };

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

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Lists</h1>
          <p className="text-gray-600">Manage pricing for different channels and customer segments</p>
        </div>
        <Button 
          className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Price List
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Price Lists</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceLists.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all channels
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lists</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {priceLists.filter(pl => {
                const now = new Date();
                const effectiveFrom = new Date(pl.effectiveFrom);
                const effectiveTo = pl.effectiveTo ? new Date(pl.effectiveTo) : null;
                return now >= effectiveFrom && (!effectiveTo || now <= effectiveTo);
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {priceLists.filter(pl => {
                const now = new Date();
                const effectiveFrom = new Date(pl.effectiveFrom);
                return now < effectiveFrom;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Future activation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {channels.length - 1}
            </div>
            <p className="text-xs text-muted-foreground">
              Different channels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Lists Table with Search */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Price Lists ({filteredPriceLists.length})</h2>
          <p className="text-sm text-gray-600">Search and filter your price lists</p>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search price lists by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${theme.primary.replace('-600', '-200')}`}
              />
            </div>
          </div>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary.replace('-600', '-200')} bg-white text-gray-900`}
          >
            {channels.map(channel => (
              <option key={channel} value={channel}>
                {channel === "all" ? "All Channels" : channel.charAt(0).toUpperCase() + channel.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price List
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Loading price lists...
                    </td>
                  </tr>
                ) : filteredPriceLists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No price lists found
                    </td>
                  </tr>
                ) : (
                  filteredPriceLists.map((priceList) => (
                  <tr 
                    key={priceList.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewPriceList(priceList.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {priceList.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {priceList.channel} • {priceList.currency}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChannelColor(priceList.channel)}`}>
                        {priceList.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {priceList.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-xs text-gray-500">From</div>
                        <div>{new Date(priceList.effectiveFrom).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">To</div>
                        <div>{priceList.effectiveTo ? new Date(priceList.effectiveTo).toLocaleDateString() : 'No expiration'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {priceList._count?.items || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const now = new Date();
                        const effectiveFrom = new Date(priceList.effectiveFrom);
                        const effectiveTo = priceList.effectiveTo ? new Date(priceList.effectiveTo) : null;
                        
                        if (now < effectiveFrom) {
                          return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
                        } else if (!effectiveTo || now <= effectiveTo) {
                          return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
                        } else {
                          return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Expired</span>;
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewPriceList(priceList.id)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPriceList(priceList.id)}
                          title="Edit Price List"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyPriceList(priceList.id)}
                          title="Copy Price List"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePriceList(priceList.id)}
                          title="Delete Price List"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </Card>

      {/* Add Price List Modal */}
      <AddPriceListModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          // Reset form data when closing
          setFormData({
            name: "",
            channel: "retail",
            currency: "GHS",
            effectiveFrom: new Date().toISOString().split('T')[0],
            effectiveTo: "",
          });
        }}
        onSuccess={() => {
          // Refresh the price lists or show success message
          console.log('Price list created successfully!');
          fetchPriceLists(); // Refresh the data
        }}
        initialData={formData}
      />

      {/* Edit Price List Modal */}
      <EditPriceListModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPriceListToEdit(null);
        }}
        onSuccess={() => {
          // Refresh the price lists or show success message
          console.log('Price list updated successfully!');
          fetchPriceLists(); // Refresh the data
        }}
        priceList={priceListToEdit}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Price List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the price list "{priceLists.find(pl => pl.id === priceListToDelete)?.name || 'Unknown'}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDelete}>
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
      </div>
    </MainLayout>
  );
}
