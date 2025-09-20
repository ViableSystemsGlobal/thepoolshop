'use client';

import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AddLeadCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commentData: any) => void;
  leadId: string;
  leadName: string;
}

export function AddLeadCommentModal({ isOpen, onClose, onSave, leadId, leadName }: AddLeadCommentModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    isInternal: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const commentData = {
        ...formData,
        leadId
      };

      await onSave(commentData);
      onClose();
      setFormData({
        content: '',
        isInternal: false
      });
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Comment for {leadName}</h2>
              <p className="text-sm text-gray-600">Add a note or comment about this lead</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your comment..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isInternal"
                name="isInternal"
                checked={formData.isInternal}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isInternal" className="ml-2 block text-sm text-gray-700">
                Internal comment (not visible to lead)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.content.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
