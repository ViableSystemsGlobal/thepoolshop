'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface LeadSource {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LeadSourcesPage() {
  const { data: session, status } = useSession();
  const { success: showSuccess, error: showError } = useToast();
  const { getThemeColor } = useTheme();
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/lead-sources', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources || []);
      } else {
        showError('Failed to fetch lead sources');
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      showError('Failed to fetch lead sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSources();
    }
  }, [status]);

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showError('Source name is required');
      return;
    }

    try {
      const response = await fetch('/api/lead-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSources(prev => [...prev, data.source]);
        setFormData({ name: '', description: '', isActive: true });
        setIsCreating(false);
        showSuccess('Lead source created successfully');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to create lead source');
      }
    } catch (error) {
      console.error('Error creating source:', error);
      showError('Failed to create lead source');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      showError('Source name is required');
      return;
    }

    try {
      const response = await fetch(`/api/lead-sources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          isActive: formData.isActive
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSources(prev => prev.map(source => 
          source.id === id ? data.source : source
        ));
        setEditingId(null);
        setFormData({ name: '', description: '', isActive: true });
        showSuccess('Lead source updated successfully');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update lead source');
      }
    } catch (error) {
      console.error('Error updating source:', error);
      showError('Failed to update lead source');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead source?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lead-sources/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSources(prev => prev.filter(source => source.id !== id));
        showSuccess('Lead source deleted successfully');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to delete lead source');
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      showError('Failed to delete lead source');
    }
  };

  const startEdit = (source: LeadSource) => {
    setEditingId(source.id);
    setFormData({
      name: source.name,
      description: source.description || '',
      isActive: source.isActive
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', isActive: true });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading lead sources...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Sources</h1>
          <p className="text-gray-600">Manage lead sources for your CRM</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          style={{ backgroundColor: getThemeColor(), color: 'white' }}
          className="flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Lead Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Website, Referral, Cold Call"
              />
            </div>
            <div>
              <Label htmlFor="create-description">Description</Label>
              <Input
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button 
              onClick={handleCreate}
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
              className="flex items-center gap-2 hover:opacity-90"
            >
              <Save className="w-4 h-4" />
              Create Source
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Sources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => (
          <Card key={source.id} className="p-4">
            {editingId === source.id ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Edit Lead Source</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-active">Active</Label>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdate(source.id)}
                    style={{ backgroundColor: getThemeColor(), color: 'white' }}
                    className="flex items-center gap-1 hover:opacity-90"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{source.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(source)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(source.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {source.description && (
                  <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    source.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {sources.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No lead sources found</p>
            <p className="text-sm">Create your first lead source to get started.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
