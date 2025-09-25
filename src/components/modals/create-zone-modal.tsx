'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { MapPin, Palette } from 'lucide-react';

interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ZONE_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' }
];

export function CreateZoneModal({ isOpen, onClose, onSuccess }: CreateZoneModalProps) {
  const { success, error } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    boundaries: null as any
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      error('Please enter a zone name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/drm/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        success('Zone created successfully!');
        onSuccess();
        onClose();
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          boundaries: null
        });
      } else {
        const errorText = await response.text();
        error(`Failed to create zone: ${errorText}`);
      }
    } catch (err) {
      console.error('Error creating zone:', err);
      error('Error creating zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Zone"
      size="md"
    >
      <div className="space-y-6">
        {/* Zone Name */}
        <div>
          <Label htmlFor="name">Zone Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter zone name (e.g., Central Accra)"
            className="mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter zone description (optional)"
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Color Selection */}
        <div>
          <Label>Zone Color</Label>
          <div className="grid grid-cols-4 gap-3 mt-2">
            {ZONE_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleInputChange('color', color.value)}
                className={`w-12 h-12 rounded-lg border-2 ${
                  formData.color === color.value 
                    ? 'border-gray-900' 
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Map Drawing Notice */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Zone Boundaries</h4>
              <p className="text-sm text-blue-700 mt-1">
                After creating the zone, you'll be able to draw the boundaries on the map and assign distributors to this zone.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            style={{
              backgroundColor: theme?.primary || '#2563eb',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Create Zone
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
