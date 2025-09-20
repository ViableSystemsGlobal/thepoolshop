'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { X, Plus, Users, User, CheckCircle, FileText } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedDuration?: number;
  items: TaskTemplateItem[];
}

interface TaskTemplateItem {
  id: string;
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
}

interface SimpleCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export default function SimpleCreateTaskModal({ isOpen, onClose, onTaskCreated }: SimpleCreateTaskModalProps) {
  const { success: showSuccess, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignmentType: 'INDIVIDUAL',
    assignedTo: '', // Legacy single assignee
    assignees: [] as string[], // New multiple assignees
    templateId: '', // Template selection
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/task-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        templateId,
        title: selectedTemplate.name,
        description: selectedTemplate.description || '',
        priority: selectedTemplate.priority,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Task title is required');
      return;
    }

    if (formData.assignmentType === 'INDIVIDUAL' && formData.assignees.length === 0) {
      showError('Please select at least one assignee for individual tasks');
      return;
    }

    if (formData.assignmentType === 'COLLABORATIVE' && formData.assignees.length === 0) {
      showError('Please select at least one assignee for collaborative tasks');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          assignmentType: formData.assignmentType,
          assignees: formData.assignees,
          templateId: formData.templateId || null,
          // Keep legacy field for backward compatibility
          assignedTo: formData.assignees.length > 0 ? formData.assignees[0] : null,
        }),
      });

      if (response.ok) {
        showSuccess('Task created successfully!');
        onTaskCreated();
        handleClose();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showError('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: '',
          assignmentType: 'INDIVIDUAL',
          assignedTo: '',
          assignees: [],
          templateId: '',
        });
    onClose();
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-4 h-4 inline mr-1" />
                Use Template (Optional)
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.items.length} items)
                  </option>
                ))}
              </select>
              {formData.templateId && (
                <p className="text-xs text-gray-500 mt-1">
                  Template will auto-fill title, description, and priority
                </p>
              )}
            </div>
          )}

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, assignmentType: 'INDIVIDUAL' })}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  formData.assignmentType === 'INDIVIDUAL'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, assignmentType: 'COLLABORATIVE' })}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  formData.assignmentType === 'COLLABORATIVE'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Collaborative
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.assignmentType === 'INDIVIDUAL' 
                ? 'Each person gets their own task to complete'
                : 'Multiple people work together on one task'
              }
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`flex items-center justify-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                    formData.priority === priority
                      ? getPriorityColor(priority)
                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            {formData.dueDate && new Date(formData.dueDate) < new Date() && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Due date is in the past. Task will be marked as overdue immediately.
              </p>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignees * ({formData.assignees.length} selected)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleAssignee(user.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    formData.assignees.includes(user.id)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.assignees.includes(user.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.assignees.includes(user.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
              disabled={isLoading || !formData.title.trim() || formData.assignees.length === 0}
              className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
