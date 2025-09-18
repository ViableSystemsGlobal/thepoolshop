"use client";

import { useState, useEffect } from "react";
// Removed Dialog import - using custom modal
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Building, X, Upload, Image as ImageIcon } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  image?: string;
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
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "",
    image: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Update form data when warehouse changes
  useEffect(() => {
    if (warehouse) {
      console.log('EditWarehouseModal: Setting form data for warehouse:', warehouse);
      setFormData({
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address || "",
        city: warehouse.city || "",
        country: warehouse.country || "",
        image: warehouse.image || "",
        isActive: warehouse.isActive,
      });
      setImagePreview(warehouse.image ? `/${warehouse.image}` : "");
    } else {
      console.log('EditWarehouseModal: No warehouse data provided');
    }
  }, [warehouse]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
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
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('code', formData.code);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('country', formData.country);
      submitData.append('isActive', formData.isActive.toString());
      
      // Add image file if uploaded
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await fetch(`/api/warehouses/${warehouse.id}`, {
        method: "PUT",
        body: submitData, // Use FormData instead of JSON
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
    // Don't reset form data here - let it be repopulated when modal reopens
    onClose();
  };

  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
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
              className={theme.focusRing}
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
              className={theme.focusRing}
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
              className={theme.focusRing}
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
                className={theme.focusRing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="e.g., Ghana"
                className={theme.focusRing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Warehouse Image</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Warehouse preview" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No image uploaded</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Upload a warehouse image (JPG, PNG, max 5MB)
              </p>
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
              className="text-white border-0"
              style={{ 
                backgroundColor: theme.primary === 'purple-600' ? '#9333ea' : 
                                theme.primary === 'blue-600' ? '#2563eb' :
                                theme.primary === 'green-600' ? '#16a34a' :
                                theme.primary === 'red-600' ? '#dc2626' :
                                theme.primary === 'orange-600' ? '#ea580c' :
                                theme.primary === 'pink-600' ? '#db2777' :
                                theme.primary === 'indigo-600' ? '#4f46e5' :
                                theme.primary === 'teal-600' ? '#0d9488' :
                                '#2563eb' // default blue
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {isLoading ? "Updating..." : "Update Warehouse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
