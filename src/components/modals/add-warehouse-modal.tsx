"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/toast-context";
import { X, MapPin, Building } from "lucide-react";

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WarehouseFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
}

export function AddWarehouseModal({ isOpen, onClose, onSuccess }: AddWarehouseModalProps) {
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "Ghana", // Default to Ghana
  });

  const handleInputChange = (field: keyof WarehouseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateWarehouseCode = () => {
    const nameWords = formData.name.trim().split(' ').filter(word => word.length > 0);
    if (nameWords.length === 0) {
      showError("Please enter a warehouse name first");
      return;
    }
    
    // Generate code from first letters of words, max 3 characters
    let code = nameWords.map(word => word.charAt(0).toUpperCase()).join('');
    if (code.length > 3) {
      code = code.substring(0, 3);
    }
    
    // Add a number if code is too short
    if (code.length < 2) {
      code += "01";
    }
    
    // Ensure code is unique by adding a timestamp suffix if needed
    const timestamp = Date.now().toString().slice(-2);
    if (code.length < 4) {
      code += timestamp;
    }
    
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      showError("Name and code are required");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending warehouse data:', formData);
      
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to create warehouse');
      }

      const result = await response.json();
      console.log('Warehouse created successfully:', result);
      
      success("Warehouse created successfully!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      let errorMessage = 'Failed to create warehouse';
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = error.message;
        } else if (error.message.includes('Name and code are required')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Failed to create warehouse: ${error.message}`;
        }
      }
      
      showError(errorMessage);
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
      country: "Ghana",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Warehouse</h2>
          </div>
          <Button
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
            <div className="flex space-x-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., MAIN"
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  generateWarehouseCode();
                }}
                className="px-3"
                disabled={!formData.name.trim()}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Street address"
              rows={2}
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !formData.name.trim() || !formData.code.trim()}
            >
              {isLoading ? "Creating..." : "Create Warehouse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
