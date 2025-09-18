"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import {
  X,
  DollarSign,
  Save,
  Loader2,
  AlertCircle,
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
}

interface EditPriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  priceList: PriceList | null;
}

export function EditPriceListModal({ isOpen, onClose, onSuccess, priceList }: EditPriceListModalProps) {
  const { getThemeClasses } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    channel: "retail",
    currency: "GHS",
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get theme classes
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

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

  // Update form data when priceList changes
  useEffect(() => {
    if (priceList) {
      setFormData({
        name: priceList.name,
        channel: priceList.channel,
        currency: priceList.currency,
        effectiveFrom: new Date(priceList.effectiveFrom).toISOString().split('T')[0],
        effectiveTo: priceList.effectiveTo ? new Date(priceList.effectiveTo).toISOString().split('T')[0] : "",
      });
    }
  }, [priceList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceList) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/price-lists/${priceList.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          effectiveTo: formData.effectiveTo || null,
        }),
      });

      if (response.ok) {
        success("Price List Updated", `"${formData.name}" has been successfully updated.`);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update price list';
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !priceList) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Edit Price List</span>
            </CardTitle>
            <CardDescription>
              Update the price list details
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price List Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Standard Retail (GHS)"
                  className={getFocusRingClasses()}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel *
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => handleInputChange('channel', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary.replace('-600', '-200')} focus:border-transparent bg-white text-gray-900`}
                  required
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="distributor">Distributor</option>
                  <option value="pos">POS</option>
                </select>
              </div>
            </div>

            {/* Currency & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Currency & Pricing</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <CurrencySelector
                  selectedCurrency={formData.currency}
                  onCurrencyChange={(currency) => handleInputChange('currency', currency)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Effective Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Effective Dates</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective From *
                  </label>
                       <Input
                         type="date"
                         value={formData.effectiveFrom}
                         onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
                         className={getFocusRingClasses()}
                         required
                       />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective To
                  </label>
                       <Input
                         type="date"
                         value={formData.effectiveTo}
                         onChange={(e) => handleInputChange('effectiveTo', e.target.value)}
                         min={formData.effectiveFrom}
                         className={getFocusRingClasses()}
                       />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for no expiration
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Price List
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
