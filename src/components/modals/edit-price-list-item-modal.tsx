"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { 
  Loader2,
  AlertCircle
} from "lucide-react";

interface EditPriceListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  priceListId: string;
  itemId: string;
  productName: string;
  currentUnitPrice: number;
  currentBasePrice: number | null;
  currency: string;
  channel: string;
}

export function EditPriceListItemModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  priceListId,
  itemId,
  productName,
  currentUnitPrice,
  currentBasePrice,
  currency,
  channel
}: EditPriceListItemModalProps) {
  const { getThemeClasses } = useTheme();
  const { success, error: showError } = useToast();
  const theme = getThemeClasses();

  const [unitPrice, setUnitPrice] = useState(currentUnitPrice.toString());
  const [basePrice, setBasePrice] = useState(currentBasePrice?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFocusRingClasses = () => {
    return `focus-visible:ring-${theme.primary.replace('-600', '-200')} focus-visible:ring-2`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unitPrice) {
      setError("Unit price is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/price-lists/${priceListId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitPrice: unitPrice,
          basePrice: basePrice || null,
        }),
      });

      if (response.ok) {
        success("Price Updated", `Pricing for ${productName} has been updated successfully.`);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update pricing';
        setError(errorMessage);
        showError("Update Failed", errorMessage);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pricing</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{productName}</h3>
            <p className="text-sm text-gray-500">Currency: {currency}</p>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
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
                {channel.charAt(0).toUpperCase() + channel.slice(1)} Price
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
              disabled={isLoading}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Pricing'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
