"use client";

import { useState, useEffect } from "react";
// Removed Dialog import - using custom modal
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/toast-context";
import { Building, X } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouse: Warehouse | null;
}

export function EditWarehouseModal({ isOpen, onClose, onSuccess, warehouse }: EditWarehouseModalProps) {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when warehouse changes
  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address || "",
        city: warehouse.city || "",
        country: warehouse.country || "",
        isActive: warehouse.isActive,
      });
    }
  }, [warehouse]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      showError("Name and code are required");
      return;
    }

    if (!warehouse) {
      showError("No warehouse selected");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/warehouses/${warehouse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update warehouse");
      }

      success("Warehouse updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating warehouse:", error);
      showError(error instanceof Error ? error.message : "Failed to update warehouse");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      city: "",
      country: "",
      isActive: true,
    });
    onClose();
  };

  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Warehouse</h2>
              <p className="text-sm text-gray-600">Update warehouse information</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Warehouse Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Main Warehouse"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Warehouse Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              placeholder="e.g., MAIN"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Street address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Accra"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="e.g., Ghana"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isActive" className="text-sm text-gray-700">
                Active warehouse
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Updating..." : "Update Warehouse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
