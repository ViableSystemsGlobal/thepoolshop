import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddLeadMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meetingData: any) => void;
  leadId: string;
  leadName: string;
}

export default function AddLeadMeetingModal({
  isOpen,
  onClose,
  onSave,
  leadId,
  leadName
}: AddLeadMeetingModalProps) {
  const [formData, setFormData] = useState({
    type: 'CALL',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 30,
    status: 'SCHEDULED'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set default scheduled time to 1 hour from now
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const defaultTime = now.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, scheduledAt: defaultTime }));
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meetingData = {
        leadId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: formData.duration,
        status: formData.status
      };

      await onSave(meetingData);
      onClose();
      
      // Reset form
      setFormData({
        type: 'CALL',
        title: '',
        description: '',
        scheduledAt: '',
        duration: 30,
        status: 'SCHEDULED'
      });
    } catch (error) {
      console.error('Error adding meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Schedule Meeting/Call</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="leadName">Lead</Label>
            <Input
              id="leadName"
              value={leadName}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CALL">Phone Call</option>
              <option value="MEETING">In-Person Meeting</option>
              <option value="VIDEO">Video Call</option>
              <option value="DEMO">Product Demo</option>
            </select>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Follow-up call, Product demo, etc."
            />
          </div>

          <div>
            <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleChange('scheduledAt', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <select
              id="duration"
              value={formData.duration.toString()}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Meeting agenda, objectives, or additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.scheduledAt}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
