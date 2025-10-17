'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAbilities } from '@/hooks/use-abilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy,
  FileText,
  Clock,
  Tag,
  User,
  Calendar,
  MoreVertical,
  Eye
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import CreateTaskTemplateModal from '@/components/modals/create-task-template-modal';
import EditTaskTemplateModal from '@/components/modals/edit-task-template-modal';
import ViewTaskTemplateModal from '@/components/modals/view-task-template-modal';

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedDuration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: TaskTemplateItem[];
  creator: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface TaskTemplateItem {
  id: string;
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
}

export default function TaskTemplatesPage() {
  const { data: session } = useSession();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();
  const { canAccess, hasAbility, abilities } = useAbilities();
  
  
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/task-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        showError('Failed to load task templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      showError('Failed to load task templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await fetch('/api/task-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setTemplates(prev => [newTemplate, ...prev]);
        setShowCreateModal(false);
        success('Task template created successfully');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showError('Failed to create template');
    }
  };

  const handleUpdateTemplate = async (templateData: any) => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(`/api/task-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const updatedTemplate = await response.json();
        setTemplates(prev => 
          prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
        );
        setShowEditModal(false);
        setSelectedTemplate(null);
        success('Task template updated successfully');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showError('Failed to update template');
    }
  };

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      const response = await fetch(`/api/task-templates/${templateToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== templateToDelete));
        success('Task template deleted successfully');
        setShowDeleteConfirm(false);
        setTemplateToDelete(null);
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showError('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: TaskTemplate) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        priority: template.priority,
        estimatedDuration: template.estimatedDuration,
        categoryId: template.category?.id,
        items: template.items.map(item => ({
          title: item.title,
          description: item.description,
          isRequired: item.isRequired
        }))
      };

      const response = await fetch('/api/task-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setTemplates(prev => [newTemplate, ...prev]);
        success('Task template duplicated successfully');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      showError('Failed to duplicate template');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-blue-600 bg-blue-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Not set';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedTemplates.map(id => 
        fetch(`/api/task-templates/${id}`, { method: 'DELETE' })
      );
      
      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.ok).length;
      
      if (failed === 0) {
        setTemplates(prev => prev.filter(t => !selectedTemplates.includes(t.id)));
        success(`Successfully deleted ${selectedTemplates.length} templates`);
      } else {
        showError(`Failed to delete ${failed} templates`);
      }
      
      setSelectedTemplates([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error deleting templates:', error);
      showError('Failed to delete templates');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Templates</h1>
            <p className="text-gray-600">Manage reusable task templates with checklists</p>
          </div>
          {hasAbility('task-templates', 'create') && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedTemplates.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTemplates.length} template{selectedTemplates.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedTemplates.length === filteredTemplates.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedTemplates([])}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className={`p-6 hover:shadow-lg transition-shadow ${selectedTemplates.includes(template.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasAbility('task-templates', 'delete') && (
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={() => handleSelectTemplate(template.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                    )}
                    <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate min-w-0">{template.name}</h3>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {(hasAbility('task-templates', 'view') || hasAbility('task-templates', 'edit') || hasAbility('task-templates', 'delete')) && (
                    <DropdownMenu
                        trigger={
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                        items={[
                          ...(hasAbility('task-templates', 'view') ? [{
                            label: "View",
                            icon: <Eye className="w-4 h-4 mr-2" />,
                            onClick: () => {
                              setSelectedTemplate(template);
                              setShowViewModal(true);
                            }
                          }] : []),
                          ...(hasAbility('task-templates', 'edit') ? [{
                            label: "Edit",
                            icon: <Edit className="w-4 h-4 mr-2" />,
                            onClick: () => {
                              setSelectedTemplate(template);
                              setShowEditModal(true);
                            }
                          }] : []),
                          ...(hasAbility('task-templates', 'edit') ? [{
                            label: "Duplicate",
                            icon: <Copy className="w-4 h-4 mr-2" />,
                            onClick: () => handleDuplicateTemplate(template)
                          }] : []),
                          ...(hasAbility('task-templates', 'delete') ? [{
                            label: "Delete",
                            icon: <Trash2 className="w-4 h-4 mr-2" />,
                            onClick: () => handleDeleteClick(template.id),
                            className: "text-red-600"
                          }] : [])
                        ]}
                        align="right"
                      />
                    )}
                  </div>
                </div>

                {template.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                      {template.priority}
                    </span>
                    {template.category && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: template.category.color }}
                      >
                        {template.category.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(template.estimatedDuration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {template.items.length} items
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {template.creator.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredTemplates.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No task templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first task template to get started'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTemplate}
        />
      )}

      {showEditModal && selectedTemplate && (
        <EditTaskTemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
          }}
          onSave={handleUpdateTemplate}
        />
      )}

      {showViewModal && selectedTemplate && (
        <ViewTaskTemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Template</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTemplateToDelete(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTemplate}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
