'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Search,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';

interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    tasks: number;
    templates: number;
  };
}

export default function TaskCategoriesPage() {
  const { success: showSuccess, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/task-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        showError('Failed to load task categories');
      }
    } catch (error) {
      console.error('Error loading task categories:', error);
      showError('Failed to load task categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/task-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(prev => [...prev, data.category]);
        showSuccess('Task category created successfully');
        setIsCreateModalOpen(false);
        setFormData({ name: '', description: '', color: '#3B82F6' });
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to create task category');
      }
    } catch (error) {
      console.error('Error creating task category:', error);
      showError('Failed to create task category');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    try {
      const response = await fetch(`/api/task-categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? data.category : cat
        ));
        showSuccess('Task category updated successfully');
        setIsEditModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#3B82F6' });
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update task category');
      }
    } catch (error) {
      console.error('Error updating task category:', error);
      showError('Failed to update task category');
    }
  };

  const handleDelete = async (category: TaskCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/task-categories/${category.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== category.id));
        showSuccess('Task category deleted successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete task category');
      }
    } catch (error) {
      console.error('Error deleting task category:', error);
      showError('Failed to delete task category');
    }
  };

  const handleToggleActive = async (category: TaskCategory) => {
    try {
      const response = await fetch(`/api/task-categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(prev => prev.map(cat => 
          cat.id === category.id ? data.category : cat
        ));
        showSuccess(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update category status');
      }
    } catch (error) {
      console.error('Error updating category status:', error);
      showError('Failed to update category status');
    }
  };

  const openEditModal = (category: TaskCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setIsEditModalOpen(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Categories</h1>
            <p className="text-gray-600">Organize your tasks with custom categories</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white flex items-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <Card key={category.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    {!category.isActive && (
                      <span className="text-xs text-gray-500">(Inactive)</span>
                    )}
                  </div>
                </div>
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                  items={[
                    {
                      label: 'Edit',
                      icon: <Edit className="w-4 h-4 mr-2" />,
                      onClick: () => openEditModal(category)
                    },
                    {
                      label: category.isActive ? 'Deactivate' : 'Activate',
                      icon: category.isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />,
                      onClick: () => handleToggleActive(category)
                    },
                    {
                      label: 'Delete',
                      icon: <Trash2 className="w-4 h-4 mr-2" />,
                      onClick: () => handleDelete(category),
                      className: 'text-red-600'
                    }
                  ]}
                />
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>{category._count.tasks} tasks</span>
                  <span>{category._count.templates} templates</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Category</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first task category to get started'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Create Task Category</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sales Tasks"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this category..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormData({ name: '', description: '', color: '#3B82F6' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                >
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Task Category</h2>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sales Tasks"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this category..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', color: '#3B82F6' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                >
                  Update Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
