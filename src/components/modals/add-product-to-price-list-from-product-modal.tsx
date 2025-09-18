"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/utils";
import { 
  Loader2,
  AlertCircle,
  Search
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
}

interface AddProductToPriceListFromProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  productName: string;
  productPrice?: number;
  productCurrency?: string;
}

export function AddProductToPriceListFromProductModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  productId,
  productName,
  productPrice,
  productCurrency = "GHS"
}: AddProductToPriceListFromProductModalProps) {
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();

  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [filteredPriceLists, setFilteredPriceLists] = useState<PriceList[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [unitPrice, setUnitPrice] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPriceLists, setIsLoadingPriceLists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFocusRingClasses = () => {
    return `focus-visible:ring-${theme.primary.replace('-600', '-200')} focus-visible:ring-2`;
  };

  // Fetch price lists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPriceLists();
    }
  }, [isOpen]);

  // Filter price lists based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPriceLists(priceLists);
    } else {
      const filtered = priceLists.filter(priceList =>
        priceList.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        priceList.channel.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPriceLists(filtered);
    }
  }, [searchTerm, priceLists]);

  const fetchPriceLists = async () => {
    setIsLoadingPriceLists(true);
    try {
      const response = await fetch('/api/price-lists');
      if (response.ok) {
        const data = await response.json();
        setPriceLists(data);
        setFilteredPriceLists(data);
      } else {
        setError('Failed to fetch price lists');
      }
    } catch (error) {
      console.error('Error fetching price lists:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoadingPriceLists(false);
    }
  };

  const handlePriceListSelect = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    // Pre-fill unit price with product price if available
    if (productPrice && !unitPrice) {
      setUnitPrice(productPrice.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPriceList) {
      setError("Please select a price list");
      return;
    }

    if (!unitPrice) {
      setError("Unit price is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/price-lists/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceListId: selectedPriceList.id,
          unitPrice: unitPrice,
          basePrice: basePrice || null,
        }),
      });

      if (response.ok) {
        success("Product Added", `${productName} has been added to ${selectedPriceList.name}.`);
        onSuccess();
        onClose();
        // Reset form
        setSelectedPriceList(null);
        setUnitPrice("");
        setBasePrice("");
        setSearchTerm("");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to add product to price list';
        setError(errorMessage);
        showError("Add Failed", errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      showError("Network Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product to Price List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{productName}</h3>
            <p className="text-sm text-gray-500">Product ID: {productId}</p>
            {productPrice && (
              <p className="text-sm text-gray-600">
                Current Price: {formatCurrency(productPrice, productCurrency)}
              </p>
            )}
          </div>

          {/* Search Price Lists */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Price Lists
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search price lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Price List Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Price List *
            </label>
            {isLoadingPriceLists ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading price lists...</span>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredPriceLists.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No price lists found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredPriceLists.map((priceList) => (
                      <div
                        key={priceList.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedPriceList?.id === priceList.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handlePriceListSelect(priceList)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{priceList.name}</div>
                            <div className="text-sm text-gray-500">
                              {priceList.channel} • {priceList.currency}
                            </div>
                          </div>
                          <input
                            type="radio"
                            checked={selectedPriceList?.id === priceList.id}
                            onChange={() => handlePriceListSelect(priceList)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Information */}
          {selectedPriceList && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className={getFocusRingClasses()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedPriceList.channel.charAt(0).toUpperCase() + selectedPriceList.channel.slice(1)} Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    className={getFocusRingClasses()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedPriceList}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Price List'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
