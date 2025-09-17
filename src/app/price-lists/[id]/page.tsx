"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { formatCurrency } from "@/lib/utils";
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
  id: number;
  name: string;
  description: string;
  channel: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
  productCount: number;
  status: string;
  createdAt: string;
}

interface PriceListItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  basePrice: number;
  exchangeRate: number;
  createdAt: string;
}

// Mock data for all price lists
const mockPriceLists: PriceList[] = [
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

// Mock data for price list items (different for each price list)
const mockPriceListItems: { [key: number]: PriceListItem[] } = {
  1: [ // Standard Retail
    {
      id: 1,
      productId: 1,
      productName: "Dell Laptop",
      productSku: "LAPTOP-001",
      unitPrice: 1200.00,
      basePrice: 1200.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-01"
    },
    {
      id: 2,
      productId: 2,
      productName: "Office Chair",
      productSku: "CHAIR-001",
      unitPrice: 150.00,
      basePrice: 150.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-01"
    },
    {
      id: 3,
      productId: 3,
      productName: "24\" Monitor",
      productSku: "MONITOR-001",
      unitPrice: 200.00,
      basePrice: 200.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-01"
    }
  ],
  2: [ // Wholesale Pricing
    {
      id: 4,
      productId: 1,
      productName: "Dell Laptop",
      productSku: "LAPTOP-001",
      unitPrice: 1000.00,
      basePrice: 1200.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-02"
    },
    {
      id: 5,
      productId: 2,
      productName: "Office Chair",
      productSku: "CHAIR-001",
      unitPrice: 120.00,
      basePrice: 150.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-02"
    }
  ],
  3: [ // Distributor Pricing
    {
      id: 6,
      productId: 1,
      productName: "Dell Laptop",
      productSku: "LAPTOP-001",
      unitPrice: 900.00,
      basePrice: 1200.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-03"
    },
    {
      id: 7,
      productId: 3,
      productName: "24\" Monitor",
      productSku: "MONITOR-001",
      unitPrice: 160.00,
      basePrice: 200.00,
      exchangeRate: 1.0,
      createdAt: "2024-01-03"
    }
  ],
  4: [ // Holiday Sale 2024
    {
      id: 8,
      productId: 1,
      productName: "Dell Laptop",
      productSku: "LAPTOP-001",
      unitPrice: 999.00,
      basePrice: 1200.00,
      exchangeRate: 1.0,
      createdAt: "2024-10-15"
    },
    {
      id: 9,
      productId: 2,
      productName: "Office Chair",
      productSku: "CHAIR-001",
      unitPrice: 99.00,
      basePrice: 150.00,
      exchangeRate: 1.0,
      createdAt: "2024-10-15"
    },
    {
      id: 10,
      productId: 3,
      productName: "24\" Monitor",
      productSku: "MONITOR-001",
      unitPrice: 149.00,
      basePrice: 200.00,
      exchangeRate: 1.0,
      createdAt: "2024-10-15"
    }
  ]
};

export default function PriceListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [priceListItems, setPriceListItems] = useState<PriceListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const priceListId = parseInt(params.id as string);
      const foundPriceList = mockPriceLists.find(pl => pl.id === priceListId);
      const foundItems = mockPriceListItems[priceListId] || [];
      
      setPriceList(foundPriceList || null);
      setPriceListItems(foundItems);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const filteredItems = priceListItems.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productSku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleEdit = () => {
    console.log('Edit price list:', params.id);
    alert('Edit functionality coming soon!');
  };

  const handleCopy = () => {
    console.log('Copy price list:', params.id);
    alert('Copy functionality coming soon!');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this price list?')) {
      console.log('Delete price list:', params.id);
      alert('Delete functionality coming soon!');
    }
  };

  const handleAddProduct = () => {
    console.log('Add product to price list:', params.id);
    alert('Add product functionality coming soon!');
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
              <p className="text-gray-600">{priceList.description}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{priceList.productCount}</p>
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
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(priceList.status)}`}>
                    {priceList.status}
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
              Effective from {new Date(priceList.effectiveFrom).toLocaleDateString()} to {new Date(priceList.effectiveTo).toLocaleDateString()}
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
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{priceList.description}</span>
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
                    <span className="font-medium">{new Date(priceList.effectiveTo).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{priceList.status}</span>
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
              <Button onClick={handleAddProduct} className="bg-orange-600 hover:bg-orange-700">
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Unit Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Base Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Exchange Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{item.productSku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{formatCurrency(item.unitPrice)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{formatCurrency(item.basePrice)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{item.exchangeRate.toFixed(4)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
      </div>
    </MainLayout>
  );
}
