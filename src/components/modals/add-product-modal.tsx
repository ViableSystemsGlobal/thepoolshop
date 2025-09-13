"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  X, 
  Package, 
  Save, 
  Loader2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    price: 0,
    cost: 0,
    importCurrency: "USD",
    uomBase: "pcs",
    uomSell: "pcs",
    active: true,
    images: [] as string[],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUnits();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || data || []);
      } else {
        console.warn('Categories API not available, using mock categories');
        // Use mock categories as fallback
        setCategories([
          { id: '1', name: 'Electronics' },
          { id: '2', name: 'Furniture' },
          { id: '3', name: 'Clothing' },
          { id: '4', name: 'Books' }
        ]);
      }
    } catch (error) {
      console.warn('Categories API not available, using mock categories:', error);
      // Use mock categories as fallback
      setCategories([
        { id: '1', name: 'Electronics' },
        { id: '2', name: 'Furniture' },
        { id: '3', name: 'Clothing' },
        { id: '4', name: 'Books' }
      ]);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data || []);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Convert images array to JSON string for database storage
      const dataToSend = {
        ...formData,
        images: JSON.stringify(formData.images)
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        success("Product Created", `"${formData.name}" has been successfully added to your inventory.`);
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          sku: "",
          name: "",
          description: "",
          categoryId: "",
          price: 0,
          cost: 0,
          importCurrency: "USD",
          uomBase: "pcs",
          uomSell: "pcs",
          active: true,
          images: [] as string[],
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create product');
        showError("Error", errorData.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Network error creating product:', error);
      setError('Network error. Please try again.');
      showError("Network Error", 'Unable to connect to server. Please try again.');
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

  const generateSKU = () => {
    // Generate a unique SKU based on category and timestamp
    const categoryPrefix = formData.categoryId ? 
      categories.find(c => c.id === formData.categoryId)?.name.substring(0, 3).toUpperCase() || 'PROD' : 
      'PROD';
    
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
    
    const generatedSKU = `${categoryPrefix}-${timestamp}-${randomSuffix}`;
    
    setFormData(prev => ({
      ...prev,
      sku: generatedSKU
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // For now, we'll create a mock URL. In production, upload to cloud storage
        const mockUrl = URL.createObjectURL(file);
        return mockUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      setError('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Add New Product</span>
            </CardTitle>
            <CardDescription>
              Create a new product in your catalog
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="e.g., PROD-001"
                      required
                      className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSKU}
                      className={`border-${theme.primary} text-${theme.primary} hover:bg-${theme.primaryHover}`}
                    >
                      Generate SKU
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Premium Wireless Headphones"
                    required
                    className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Product description..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        )}
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB each)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      // Open Add Category modal
                      const event = new CustomEvent('openAddCategoryModal');
                      window.dispatchEvent(event);
                    }}
                    className={`text-xs text-${theme.primary} hover:text-${theme.primaryDark} hover:underline`}
                  >
                    + Add Category
                  </button>
                </div>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing & Currency</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Import Currency
                </label>
                <select
                  value={formData.importCurrency}
                  onChange={(e) => handleInputChange('importCurrency', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="GHS">GHS - Ghana Cedi</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                  <option value="EGP">EGP - Egyptian Pound</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Import Price
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price
                  </label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                  />
                </div>
              </div>
            </div>

            {/* Units of Measure */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Units of Measure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Unit
                  </label>
                  <select
                    value={formData.uomBase}
                    onChange={(e) => handleInputChange('uomBase', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                  >
                    <option value="">Select base unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.symbol}>
                        {unit.symbol} - {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Unit
                  </label>
                  <select
                    value={formData.uomSell}
                    onChange={(e) => handleInputChange('uomSell', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                  >
                    <option value="">Select selling unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.symbol}>
                        {unit.symbol} - {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  className={`rounded border-gray-300 text-${theme.primary} focus:ring-${theme.primary}`}
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active (product is available for sale)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className={`bg-${theme.primary} hover:bg-${theme.primaryDark}`}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Product
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

export default AddProductModal;
