"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { useSession } from "next-auth/react";
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
  FileText
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  uomBase: string;
  images?: string[];
  stockItems?: Array<{
    id: string;
    quantity: number;
    available: number;
    warehouseId: string;
  }>;
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: () => void;
}

interface MovementType {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function StockAdjustmentModal({ isOpen, onClose, product, onSuccess }: StockAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    type: "RECEIPT",
    quantity: 0,
    unitCost: 0,
    reference: "",
    reason: "",
    notes: "",
    warehouseId: "",
    grnFile: null as File | null,
    purchaseOrderFile: null as File | null,
    transferDirection: "OUT" as "IN" | "OUT",
    transferFromWarehouse: "",
    transferToWarehouse: "",
  });
  const [warehouses, setWarehouses] = useState<Array<{id: string, name: string, code: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();
  const { data: session } = useSession();

  // Helper function to get current warehouse's stock
  const getCurrentWarehouseStock = () => {
    if (!product.stockItems || !formData.warehouseId) {
      console.log('No stockItems or warehouseId:', { stockItems: product.stockItems, warehouseId: formData.warehouseId });
      return { id: '', quantity: 0, available: 0 };
    }
    const stockItem = product.stockItems.find(item => item.warehouseId === formData.warehouseId);
    console.log('Looking for stock item:', { 
      warehouseId: formData.warehouseId, 
      availableStockItems: product.stockItems.map(si => ({ warehouseId: si.warehouseId, quantity: si.quantity })),
      found: stockItem 
    });
    if (!stockItem) {
      // No stock item exists for this warehouse yet - this is normal for transfers
      return { id: '', quantity: 0, available: 0 };
    }
    return stockItem;
  };

  // Fetch warehouses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
    }
  }, [isOpen]);

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
      value: "TRANSFER",
      label: "Transfer",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      color: "text-purple-600",
      description: "Stock transferred between warehouses"
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
      icon: <TrendingDown className="h-4 w-4" />,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantity === 0) {
      showError("Validation Error", "Quantity cannot be zero");
      return;
    }

    if (!formData.warehouseId) {
      showError("Validation Error", "Please select a warehouse");
      return;
    }

    // Validate GRN file for RECEIPT type
    if (formData.type === "RECEIPT" && !formData.grnFile) {
      showError("Validation Error", "GRN (Goods Receipt Note) is required for stock receipts");
      return;
    }

    // Validate transfer fields for TRANSFER type
    if (formData.type === "TRANSFER") {
      if (formData.transferDirection === "OUT" && !formData.transferToWarehouse) {
        showError("Validation Error", "Please select a destination warehouse for transfer out");
        return;
      }
      if (formData.transferDirection === "IN" && !formData.transferFromWarehouse) {
        showError("Validation Error", "Please select a source warehouse for transfer in");
        return;
      }
    }

    // Check if trying to remove more stock than available
    const isStockOutMovement = ["SALE", "DAMAGE", "THEFT", "EXPIRY"].includes(formData.type) || 
                              (formData.type === "TRANSFER" && formData.transferDirection === "OUT");
    const isAdjustmentOut = formData.type === "ADJUSTMENT" && formData.quantity < 0;
    
    const currentStock = getCurrentWarehouseStock();
    if ((isStockOutMovement || isAdjustmentOut) && Math.abs(formData.quantity) > currentStock.quantity) {
      showError("Insufficient Stock", `Cannot remove ${Math.abs(formData.quantity)} units. Only ${currentStock.quantity} units available.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('productId', product.id);
      formDataToSend.append('type', formData.type);
      const isStockOutMovement = ["SALE", "DAMAGE", "THEFT", "EXPIRY"].includes(formData.type) || 
                                (formData.type === "TRANSFER" && formData.transferDirection === "OUT");
      formDataToSend.append('quantity', String(isStockOutMovement 
        ? -Math.abs(formData.quantity) 
        : formData.quantity));
      if (formData.unitCost > 0) {
        formDataToSend.append('unitCost', String(formData.unitCost));
      }
      formDataToSend.append('reference', formData.reference);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('warehouseId', formData.warehouseId);
      if (session?.user?.id) {
        formDataToSend.append('userId', session.user.id);
      }
      
      // Add transfer-specific fields
      if (formData.type === "TRANSFER") {
        formDataToSend.append('transferDirection', formData.transferDirection);
        formDataToSend.append('transferFromWarehouse', formData.transferFromWarehouse);
        formDataToSend.append('transferToWarehouse', formData.transferToWarehouse);
      }
      
      // Add files if they exist
      if (formData.grnFile) {
        formDataToSend.append('grnFile', formData.grnFile);
      }
      if (formData.purchaseOrderFile) {
        formDataToSend.append('purchaseOrderFile', formData.purchaseOrderFile);
      }

      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        success("Stock Updated", `Stock movement recorded successfully. New quantity: ${data.stockItem?.quantity || 0} ${product.uomBase}`);
        onSuccess();
        // Reset form
        setFormData({
          type: "RECEIPT",
          quantity: 0,
          unitCost: 0,
          reference: "",
          reason: "",
          notes: "",
          warehouseId: warehouses.length > 0 ? warehouses[0].id : "",
          grnFile: null,
          purchaseOrderFile: null,
          transferDirection: "OUT",
          transferFromWarehouse: "",
          transferToWarehouse: "",
        });
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showError("Network Error", 'Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedType = () => {
    return movementTypes.find(t => t.value === formData.type) || movementTypes[0];
  };

  const getQuantityLabel = () => {
    const type = getSelectedType();
    if (formData.type === "ADJUSTMENT") {
      return "Adjustment Amount (positive to add, negative to subtract)";
    } else if (formData.type === "TRANSFER") {
      return formData.transferDirection === "IN" ? "Quantity to Add" : "Quantity to Remove";
    } else if (["RECEIPT", "RETURN"].includes(formData.type)) {
      return "Quantity to Add";
    } else {
      return "Quantity to Remove";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            {/* Product Image */}
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Stock Adjustment</h2>
              <p className="text-sm text-gray-600">Update stock for {product.name}</p>
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${theme.primaryBg}`}>
              <Package className={`h-5 w-5 text-${theme.primary}`} />
            </div>
            <div>
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-600">SKU: {product.sku}</div>
              <div className="text-sm text-gray-600">
                Current Stock: {getCurrentWarehouseStock().quantity} {product.uomBase}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Movement Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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

          {/* Transfer Direction and Warehouse Selection - Only for TRANSFER type */}
          {formData.type === "TRANSFER" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Direction *
                </label>
                <select
                  value={formData.transferDirection}
                  onChange={(e) => setFormData({ ...formData, transferDirection: e.target.value as "IN" | "OUT" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="OUT">Transfer Out (Remove from this warehouse)</option>
                  <option value="IN">Transfer In (Add to this warehouse)</option>
                </select>
              </div>

              {formData.transferDirection === "OUT" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer To Warehouse *
                  </label>
                  <select
                    value={formData.transferToWarehouse}
                    onChange={(e) => setFormData({ ...formData, transferToWarehouse: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select destination warehouse</option>
                    {warehouses.filter(w => w.id !== formData.warehouseId).map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.transferDirection === "IN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer From Warehouse *
                  </label>
                  <select
                    value={formData.transferFromWarehouse}
                    onChange={(e) => setFormData({ ...formData, transferFromWarehouse: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select source warehouse</option>
                    {warehouses.filter(w => w.id !== formData.warehouseId).map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getQuantityLabel()} *
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                placeholder="Enter quantity"
                required
                className="flex-1"
                min={["SALE", "DAMAGE", "THEFT", "EXPIRY"].includes(formData.type) || (formData.type === "TRANSFER" && formData.transferDirection === "OUT") ? 1 : (formData.type === "ADJUSTMENT" ? undefined : 1)}
                max={["SALE", "DAMAGE", "THEFT", "EXPIRY"].includes(formData.type) || (formData.type === "TRANSFER" && formData.transferDirection === "OUT") ? getCurrentWarehouseStock().quantity : undefined}
              />
              <span className="text-sm text-gray-500">{product.uomBase}</span>
            </div>
            {formData.type === "ADJUSTMENT" && (
              <p className="text-xs text-gray-500 mt-1">
                Use positive numbers to add stock, negative to subtract
              </p>
            )}
            {(["SALE", "DAMAGE", "THEFT", "EXPIRY"].includes(formData.type) || (formData.type === "TRANSFER" && formData.transferDirection === "OUT")) && (
              <p className="text-xs text-blue-600 mt-1">
                Available stock: {getCurrentWarehouseStock().quantity} {product.uomBase}
                {getCurrentWarehouseStock().quantity === 0 && formData.type === "TRANSFER" && formData.transferDirection === "OUT" && (
                  <span className="text-orange-600 ml-2">(No stock in this warehouse)</span>
                )}
              </p>
            )}
          </div>

          {/* Unit Cost Field - Only show for stock IN movements */}
          {(["RECEIPT", "RETURN"].includes(formData.type) || (formData.type === "TRANSFER" && formData.transferDirection === "IN")) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                  placeholder="Enter cost per unit"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the cost per unit to update weighted average cost
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference
            </label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="e.g., PO-12345, SO-67890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <Input
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for this movement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* GRN Upload - Only for RECEIPT type */}
          {formData.type === "RECEIPT" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                GRN (Goods Receipt Note) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, grnFile: file });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.grnFile && (
                <p className="text-sm text-green-600">
                  Selected: {formData.grnFile.name}
                </p>
              )}
            </div>
          )}

          {/* Purchase Order Upload - Only for RECEIPT type */}
          {formData.type === "RECEIPT" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Purchase Order
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, purchaseOrderFile: file });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.purchaseOrderFile && (
                <p className="text-sm text-green-600">
                  Selected: {formData.purchaseOrderFile.name}
                </p>
              )}
            </div>
          )}

          {/* Preview */}
          {formData.quantity !== 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Preview:</span>
              </div>
              <div className="text-sm text-blue-800 mt-1">
                Current: {getCurrentWarehouseStock().quantity} {product.uomBase}
                <br />
                {formData.type === "ADJUSTMENT" ? (
                  <>
                    Adjustment: {formData.quantity > 0 ? '+' : ''}{formData.quantity} {product.uomBase}
                    <br />
                    New Total: {getCurrentWarehouseStock().quantity + formData.quantity} {product.uomBase}
                  </>
                ) : (
                  <>
                    {getSelectedType().label}: {Math.abs(formData.quantity)} {product.uomBase}
                    <br />
                    New Total: {(() => {
                      const currentStock = getCurrentWarehouseStock().quantity;
                      const isStockIn = ["RECEIPT", "RETURN"].includes(formData.type) || 
                                       (formData.type === "TRANSFER" && formData.transferDirection === "IN");
                      return isStockIn 
                        ? currentStock + Math.abs(formData.quantity)
                        : currentStock - Math.abs(formData.quantity);
                    })()} {product.uomBase}
                    {formData.unitCost > 0 && (
                      <>
                        <br />
                        Unit Cost: ${formData.unitCost.toFixed(2)}
                        <br />
                        Total Cost: ${(formData.quantity * formData.unitCost).toFixed(2)}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || formData.quantity === 0 || !formData.warehouseId}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
