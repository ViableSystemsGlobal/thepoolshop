"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Package,
  Save,
  Loader2,
  AlertCircle,
  Search
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price?: number;
  cost?: number;
  originalPrice?: number;
  originalPriceCurrency?: string;
}

interface AddProductToPriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  priceListId: string;
}

export function AddProductToPriceListModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  priceListId 
}: AddProductToPriceListModalProps) {
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [priceListCurrency, setPriceListCurrency] = useState<string>("GHS");
  const [priceListChannel, setPriceListChannel] = useState<string>("retail");
  const [convertedPrices, setConvertedPrices] = useState<{[productId: string]: number}>({});
  const [productPricing, setProductPricing] = useState<{[productId: string]: {
    unitPrice: string;
    basePrice: string;
  }}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get proper focus ring classes
  const getFocusRingClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'focus-visible:ring-purple-500',
      'blue-600': 'focus-visible:ring-blue-500',
      'green-600': 'focus-visible:ring-green-500',
      'orange-600': 'focus-visible:ring-orange-500',
      'red-600': 'focus-visible:ring-red-500',
      'indigo-600': 'focus-visible:ring-indigo-500',
      'pink-600': 'focus-visible:ring-pink-500',
      'teal-600': 'focus-visible:ring-teal-500',
      'cyan-600': 'focus-visible:ring-cyan-500',
      'lime-600': 'focus-visible:ring-lime-500',
      'amber-600': 'focus-visible:ring-amber-500',
      'emerald-600': 'focus-visible:ring-emerald-500',
      'violet-600': 'focus-visible:ring-violet-500',
      'fuchsia-600': 'focus-visible:ring-fuchsia-500',
      'rose-600': 'focus-visible:ring-rose-500',
      'sky-600': 'focus-visible:ring-sky-500',
      'slate-600': 'focus-visible:ring-slate-500',
      'gray-600': 'focus-visible:ring-gray-500',
      'zinc-600': 'focus-visible:ring-zinc-500',
      'neutral-600': 'focus-visible:ring-neutral-500',
      'stone-600': 'focus-visible:ring-stone-500',
    };
    return colorMap[theme.primary] || 'focus-visible:ring-blue-500';
  };


  // Fetch products and price list details when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPriceListDetails();
      fetchProducts();
    }
  }, [isOpen]);

  // Convert prices when price list currency changes
  useEffect(() => {
    if (products.length > 0 && priceListCurrency) {
      convertProductPrices(products, priceListCurrency);
    }
  }, [priceListCurrency, products]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Handle the API response structure: { products: [...], pagination: {...} }
        const productsArray = Array.isArray(data.products) ? data.products : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        
        // Convert prices to the price list currency
        await convertProductPrices(productsArray, priceListCurrency);
      } else {
        console.error('Failed to fetch products');
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchPriceListDetails = async () => {
    try {
      const response = await fetch(`/api/price-lists/${priceListId}`);
      if (response.ok) {
        const data = await response.json();
        setPriceListCurrency(data.currency || "GHS");
        setPriceListChannel(data.channel || "retail");
      } else {
        console.error('Failed to fetch price list details');
        setPriceListCurrency("GHS"); // Default to GHS
        setPriceListChannel("retail"); // Default to retail
      }
    } catch (error) {
      console.error('Error fetching price list details:', error);
      setPriceListCurrency("GHS"); // Default to GHS
      setPriceListChannel("retail"); // Default to retail
    }
  };

  const convertProductPrices = async (products: Product[], targetCurrency: string) => {
    const convertedPricesMap: {[productId: string]: number} = {};
    
    for (const product of products) {
      // Use originalPrice if available, otherwise fall back to price
      const sourcePrice = product.originalPrice || product.price;
      const sourceCurrency = product.originalPriceCurrency || 'USD';
      
      if (sourcePrice) {
        try {
          // Convert from original currency to target currency
          const response = await fetch('/api/currency/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromCurrency: sourceCurrency,
              toCurrency: targetCurrency,
              amount: sourcePrice
            }),
          });

          if (response.ok) {
            const data = await response.json();
            convertedPricesMap[product.id] = data.convertedAmount;
          } else {
            // Fallback: use source price if conversion fails
            convertedPricesMap[product.id] = sourcePrice;
          }
        } catch (error) {
          console.error(`Error converting price for product ${product.id}:`, error);
          // Fallback: use source price if conversion fails
          convertedPricesMap[product.id] = sourcePrice;
        }
      }
    }
    
    setConvertedPrices(convertedPricesMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      return;
    }

    // Validate that all selected products have unit prices
    const missingPrices = selectedProducts.filter(product => 
      !productPricing[product.id]?.unitPrice
    );
    
    if (missingPrices.length > 0) {
      setError(`Please provide unit prices for: ${missingPrices.map(p => p.name).join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add all products to the price list
      const promises = selectedProducts.map(product => {
        const pricing = productPricing[product.id];
        return fetch(`/api/price-lists/${priceListId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            unitPrice: pricing.unitPrice,
            basePrice: pricing.basePrice || null,
          }),
        });
      });

      const responses = await Promise.all(promises);
      const failedResponses = responses.filter(response => !response.ok);
      
      if (failedResponses.length === 0) {
        success("Products Added", `${selectedProducts.length} product(s) have been added to the price list.`);
        onSuccess();
        onClose();
        // Reset form
        setSelectedProducts([]);
        setProductPricing({});
        setSearchTerm("");
      } else {
        const errorMessage = `Failed to add ${failedResponses.length} product(s). Please try again.`;
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

  const handleInputChange = (productId: string, field: string, value: string) => {
    setProductPricing(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleProductSelect = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      // Remove product from selection
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      // Remove pricing data for this product
      setProductPricing(prev => {
        const newPricing = { ...prev };
        delete newPricing[product.id];
        return newPricing;
      });
    } else {
      // Add product to selection
      setSelectedProducts(prev => [...prev, product]);
      // Initialize pricing data for this product
      setProductPricing(prev => ({
        ...prev,
        [product.id]: {
          unitPrice: (convertedPrices[product.id] || product.originalPrice || product.price) ? (convertedPrices[product.id] || product.originalPrice || product.price)!.toString() : "",
          basePrice: "",
        }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Add Products to Price List</span>
            </CardTitle>
            <CardDescription>
              Select one or more products and set their pricing for this price list
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Product Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Product</h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${getFocusRingClasses()}`}
                />
              </div>

              {/* Products List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {isLoadingProducts ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading products...
                  </div>
                ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No products found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {Array.isArray(filteredProducts) && filteredProducts.map((product) => {
                      const isSelected = selectedProducts.some(p => p.id === product.id);
                      return (
                        <div
                          key={product.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleProductSelect(product)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              </div>
                            </div>
                            {(product.originalPrice || product.price) && (
                              <div className="text-sm text-gray-600">
                                Current Price: {formatCurrency((convertedPrices[product.id] || product.originalPrice || product.price)!, priceListCurrency)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Selected Products ({selectedProducts.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="text-sm text-green-700">
                        • {product.name} ({product.sku})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Information */}
            {selectedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pricing Information</h3>
                
                <div className="space-y-6">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productPricing[product.id]?.unitPrice || ""}
                            onChange={(e) => handleInputChange(product.id, 'unitPrice', e.target.value)}
                            placeholder="0.00"
                            className={getFocusRingClasses()}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {priceListChannel.charAt(0).toUpperCase() + priceListChannel.slice(1)} Price
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productPricing[product.id]?.basePrice || ""}
                            onChange={(e) => handleInputChange(product.id, 'basePrice', e.target.value)}
                            placeholder="0.00"
                            className={getFocusRingClasses()}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || selectedProducts.length === 0} 
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Products...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add {selectedProducts.length > 0 ? `${selectedProducts.length} Product${selectedProducts.length > 1 ? 's' : ''}` : 'Products'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
