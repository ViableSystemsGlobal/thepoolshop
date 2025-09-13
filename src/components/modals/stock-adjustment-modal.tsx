"use client";

import React, { useState } from "react";
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
  FileText
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
    reference: "",
    reason: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

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

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          type: formData.type,
          quantity: formData.quantity,
          reference: formData.reference,
          reason: formData.reason,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        success("Stock Updated", `Stock movement recorded successfully. New quantity: ${data.stockItem?.quantity || 0} ${product.uomBase}`);
        onSuccess();
        // Reset form
        setFormData({
          type: "RECEIPT",
          quantity: 0,
          reference: "",
          reason: "",
          notes: "",
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
    } else if (["RECEIPT", "TRANSFER_IN", "RETURN"].includes(formData.type)) {
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
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stock Adjustment</h2>
            <p className="text-sm text-gray-600">Update stock for {product.name}</p>
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
                Current Stock: {product.stockItem?.quantity || 0} {product.uomBase}
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
              />
              <span className="text-sm text-gray-500">{product.uomBase}</span>
            </div>
            {formData.type === "ADJUSTMENT" && (
              <p className="text-xs text-gray-500 mt-1">
                Use positive numbers to add stock, negative to subtract
              </p>
            )}
          </div>

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

          {/* Preview */}
          {formData.quantity !== 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Preview:</span>
              </div>
              <div className="text-sm text-blue-800 mt-1">
                Current: {product.stockItem?.quantity || 0} {product.uomBase}
                <br />
                {formData.type === "ADJUSTMENT" ? (
                  <>
                    Adjustment: {formData.quantity > 0 ? '+' : ''}{formData.quantity} {product.uomBase}
                    <br />
                    New Total: {(product.stockItem?.quantity || 0) + formData.quantity} {product.uomBase}
                  </>
                ) : (
                  <>
                    {getSelectedType().label}: {Math.abs(formData.quantity)} {product.uomBase}
                    <br />
                    New Total: {(product.stockItem?.quantity || 0) + formData.quantity} {product.uomBase}
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
              disabled={isSubmitting || formData.quantity === 0}
              className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
            >
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
