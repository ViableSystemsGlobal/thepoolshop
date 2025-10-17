"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  FileText
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channels: string[];
  subject?: string;
  body: string;
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const notificationTypes = [
  { value: 'SYSTEM_ALERT', label: 'System Alert' },
  { value: 'STOCK_LOW', label: 'Stock Low' },
  { value: 'ORDER_STATUS', label: 'Order Status' },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
  { value: 'USER_INVITED', label: 'User Invited' },
  { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'SECURITY_ALERT', label: 'Security Alert' },
  { value: 'CUSTOM', label: 'Custom' },
];

const notificationChannels = [
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'SMS', label: 'SMS', icon: MessageSquare },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: Smartphone },
  { value: 'IN_APP', label: 'In-App', icon: Bell },
];

export default function NotificationTemplatesPage() {
  const { theme } = useTheme();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notification-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        console.error('Failed to fetch templates');
        toast.error('Failed to load notification templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load notification templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (template: NotificationTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/notification-templates/${template.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== template.id));
        toast.success('Template deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getChannelIcon = (channel: string) => {
    const channelConfig = notificationChannels.find(c => c.value === channel);
    return channelConfig ? channelConfig.icon : FileText;
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : type;
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading notification templates...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Templates</h1>
            <p className="text-gray-600 mt-1">
              Manage notification templates for different types of messages
            </p>
          </div>
          <Button
            onClick={handleCreateTemplate}
            className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-500">Type</Label>
                  <p className="text-sm text-gray-900">{getTypeLabel(template.type)}</p>
                </div>

                {template.subject && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Subject</Label>
                    <p className="text-sm text-gray-900 truncate">{template.subject}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs font-medium text-gray-500">Body Preview</Label>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.body}</p>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-500">Channels</Label>
                  <div className="flex gap-2 mt-1">
                    {template.channels.map((channel) => {
                      const Icon = getChannelIcon(channel);
                      return (
                        <div key={channel} className="flex items-center gap-1">
                          <Icon className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{channel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Variables</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </p>
                {template.updatedAt !== template.createdAt && (
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType 
                ? 'Try adjusting your search criteria' 
                : 'Get started by creating your first notification template'
              }
            </p>
            {!searchTerm && !selectedType && (
              <Button
                onClick={handleCreateTemplate}
                className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </Card>
        )}

        {/* Create/Edit Template Modal */}
        {showCreateModal && (
          <NotificationTemplateModal
            template={editingTemplate}
            onClose={() => {
              setShowCreateModal(false);
              setEditingTemplate(null);
            }}
            onSave={() => {
              setShowCreateModal(false);
              setEditingTemplate(null);
              loadTemplates();
            }}
          />
        )}
      </div>
    </>
  );
}

// Template Modal Component
function NotificationTemplateModal({ 
  template, 
  onClose, 
  onSave 
}: { 
  template: NotificationTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    channels: [] as string[],
    subject: '',
    body: '',
    variables: [] as string[],
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [variablesInput, setVariablesInput] = useState('');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        channels: template.channels,
        subject: template.subject || '',
        body: template.body,
        variables: template.variables || [],
        isActive: template.isActive
      });
      setVariablesInput((template.variables || []).join(', '));
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.channels.length || !formData.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        variables: variablesInput ? variablesInput.split(',').map(v => v.trim()).filter(Boolean) : []
      };

      const url = template ? `/api/notification-templates/${template.id}` : '/api/notification-templates';
      const method = template ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(template ? 'Template updated successfully' : 'Template created successfully');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Notification Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Channels *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {notificationChannels.map(channel => {
                  const Icon = channel.icon;
                  return (
                    <label key={channel.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              channels: [...prev.channels, channel.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              channels: prev.channels.filter(c => c !== channel.value)
                            }));
                          }
                        }}
                      />
                      <Icon className="h-4 w-4" />
                      <span>{channel.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject line"
              />
            </div>

            <div>
              <Label htmlFor="body">Body *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                rows={6}
                placeholder="Notification message body. Use {{variable}} for dynamic content."
                required
              />
            </div>

            <div>
              <Label htmlFor="variables">Variables (comma-separated)</Label>
              <Input
                id="variables"
                value={variablesInput}
                onChange={(e) => setVariablesInput(e.target.value)}
                placeholder="userName, orderNumber, amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                List variables that can be used in the body as {{variable}}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {template ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
