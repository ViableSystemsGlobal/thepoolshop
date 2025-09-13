"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  X, 
  Folder, 
  Save, 
  Loader2,
  AlertCircle
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentCategory?: Category | null;
}

export function AddCategoryModal({ isOpen, onClose, onSuccess, parentCategory }: AddCategoryModalProps) {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: parentCategory?.id || null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset form when opening
      setFormData({
        name: "",
        description: "",
        parentId: parentCategory?.id || null,
      });
      setError(null);
    }
  }, [isOpen, parentCategory]);

  const fetchCategories = async () => {
    try {
      // Mock API call - replace with actual API
      const mockCategories: Category[] = [
        { id: "1", name: "Electronics", description: "Electronic devices" },
        { id: "2", name: "Furniture", description: "Office furniture" },
        { id: "3", name: "Clothing", description: "Apparel and accessories" },
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      showError("Validation Error", "Category name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to create category via API
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        success("Category Created", `"${formData.name}" has been successfully added to your categories.`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create category');
        showError("Error", errorData.error || 'Failed to create category');
        return;
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        parentId: null,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Network error creating category:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>
                {parentCategory ? `Add Subcategory to ${parentCategory.name}` : 'Add Category'}
              </span>
            </CardTitle>
            <CardDescription>
              {parentCategory 
                ? 'Create a new subcategory under the selected category'
                : 'Create a new product category'
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter category name..."
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter category description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {!parentCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) => handleInputChange('parentId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">No parent (Main category)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {parentCategory && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Folder className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Parent Category: {parentCategory.name}
                  </span>
                </div>
                {parentCategory.description && (
                  <p className="text-xs text-blue-600 mt-1">
                    {parentCategory.description}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Category
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

export default AddCategoryModal;
