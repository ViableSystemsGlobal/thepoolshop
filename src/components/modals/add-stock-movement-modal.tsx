"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { 
  X, 
  Package, 
  TrendingUp, 
  TrendingDown,
  RotateCcw,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Search
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  uomBase: string;
  stockItem?: {
    id: string;
    quantity: number;
    available: number;
  };
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface AddStockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MovementType {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function AddStockMovementModal({ isOpen, onClose, onSuccess }: AddStockMovementModalProps) {
  const [formData, setFormData] = useState({
    productId: "",
    type: "RECEIPT",
    quantity: 0,
    unitCost: 0,
    reference: "",
    reason: "",
    notes: "",
    warehouseId: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [grnFile, setGrnFile] = useState<File | null>(null);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  const handleGrnFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGrnFile(file);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchWarehouses();
    }
  }, [isOpen]);

  // Filter products based on search
  useEffect(() => {
    if (productSearch.length > 0) {
      setShowProductDropdown(true);
    } else {
      setShowProductDropdown(false);
    }
  }, [productSearch]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.warehouses || []);
        // Set default warehouse if available
        if (data.warehouses && data.warehouses.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({ ...prev, warehouseId: data.warehouses[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const movementTypes: MovementType[] = [
    {
      value: "RECEIPT",
      label: "Receipt",
      icon: <TrendingUp className="h-4 w-4" />,
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
      description: "Stock transferred in from another warehouse"
    },
    {
      value: "TRANSFER_OUT",
      label: "Transfer Out",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      color: "text-orange-600",
      description: "Stock transferred out to another warehouse"
    },
    {
      value: "SALE",
      label: "Sale",
      icon: <TrendingDown className="h-4 w-4" />,
      color: "text-emerald-600",
      description: "Stock sold to customer"
    },
    {
      value: "RETURN",
      label: "Return",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-cyan-600",
      description: "Stock returned from customer"
    },
    {
      value: "DAMAGE",
      label: "Damage",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      description: "Stock damaged or lost"
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, productId: product.id }));
    setProductSearch(`${product.name} (${product.sku})`);
    setShowProductDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.productId) {
      showError("Validation Error", "Please select a product");
      setIsSubmitting(false);
      return;
    }

    if (formData.quantity === 0) {
      showError("Validation Error", "Quantity cannot be zero");
      setIsSubmitting(false);
      return;
    }

    if (!formData.warehouseId) {
      showError("Validation Error", "Please select a warehouse");
      setIsSubmitting(false);
      return;
    }

    // GRN is required for RECEIPT type movements
    if (formData.type === 'RECEIPT' && !grnFile) {
      showError("Validation Error", "GRN Document is required for stock receipts");
      setIsSubmitting(false);
      return;
    }

    // Check if trying to remove more stock than available
    if (formData.quantity < 0 && selectedProduct?.stockItem) {
      const availableStock = selectedProduct.stockItem.available;
      if (Math.abs(formData.quantity) > availableStock) {
        showError("Validation Error", `Cannot remove more stock than available. Available: ${availableStock}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: formData.productId,
          type: formData.type,
          quantity: formData.quantity,
          unitCost: formData.unitCost > 0 ? formData.unitCost : null,
          reference: formData.reference,
          reason: formData.reason,
          notes: formData.notes,
          warehouseId: formData.warehouseId,
        }),
      });

      if (response.ok) {
        success("Stock Movement Added", `Stock movement has been recorded successfully.`);
        onSuccess();
        onClose();
        
        // Reset form
        setFormData({
          productId: "",
          type: "RECEIPT",
          quantity: 0,
          unitCost: 0,
          reference: "",
          reason: "",
          notes: "",
          warehouseId: warehouses.length > 0 ? warehouses[0].id : "",
        });
        setSelectedProduct(null);
        setProductSearch("");
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || 'Failed to add stock movement');
      }
    } catch (error) {
      console.error('Error adding stock movement:', error);
      showError("Network Error", 'Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find(t => t.value === type) || movementTypes[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Stock Movement</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product *
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    if (!e.target.value) {
                      setSelectedProduct(null);
                      setFormData(prev => ({ ...prev, productId: "" }));
                    }
                  }}
                  placeholder="Search for a product by name or SKU..."
                  className="pl-10"
                  required
                />
              </div>
              
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku}</div>
                      {product.stockItem && (
                        <div className="text-xs text-gray-400">
                          Current Stock: {product.stockItem.quantity} {product.uomBase} 
                          (Available: {product.stockItem.available})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movement Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {movementTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Unit Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                placeholder="Enter quantity"
                required
                className="flex-1"
                min={["SALE", "DAMAGE", "THEFT", "TRANSFER_OUT", "EXPIRY"].includes(formData.type) ? 1 : (formData.type === "ADJUSTMENT" ? undefined : 1)}
                max={["SALE", "DAMAGE", "THEFT", "TRANSFER_OUT", "EXPIRY"].includes(formData.type) ? (selectedProduct?.stockItem?.quantity || 0) : undefined}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.quantity > 0 ? "Positive for stock in" : "Negative for stock out"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                placeholder="Enter unit cost (optional)"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for stock in movements
              </p>
            </div>
          </div>

          {/* Warehouse Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse *
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </option>
              ))}
            </select>
          </div>

          {/* Reference and Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference
              </label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="e.g., PO-12345, SO-67890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for this movement"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* GRN Upload - Required for RECEIPT type */}
          {formData.type === 'RECEIPT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GRN Document <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleGrnFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {grnFile && (
                <p className="text-sm text-green-600 mt-1">✓ {grnFile.name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Upload the Goods Receipt Note for this stock receipt
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || formData.quantity === 0 || !formData.productId || !formData.warehouseId}
              className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
            >
              {isSubmitting ? "Adding..." : "Add Movement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
