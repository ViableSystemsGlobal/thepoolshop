"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { X, MapPin, Building, Upload, Image as ImageIcon } from "lucide-react";

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
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const themeColor = getThemeColor();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "Ghana", // Default to Ghana
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      
      // Use FormData if image is uploaded, otherwise use JSON
      let response: Response;
      if (imageFile) {
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('code', formData.code);
        submitData.append('address', formData.address);
        submitData.append('city', formData.city);
        submitData.append('country', formData.country);
        submitData.append('image', imageFile);

        response = await fetch('/api/warehouses', {
          method: 'POST',
          body: submitData, // Use FormData instead of JSON
        });
      } else {
        response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      }

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
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: theme.primaryBg || 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <Building 
                className="h-5 w-5"
                style={{ 
                  color: themeColor || '#2563eb'
                }}
              />
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
              className={theme.focusRing}
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
                className={`flex-1 ${theme.focusRing}`}
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
              disabled={isLoading || !formData.name.trim() || !formData.code.trim()}
              className="text-white border-0"
              style={{ 
                backgroundColor: themeColor || '#2563eb'
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
              {isLoading ? "Creating..." : "Create Warehouse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
