'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { Truck, User, Phone, Mail, CreditCard, Car } from 'lucide-react';

interface CreateDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'pickup', label: 'Pickup Truck' }
];

export function CreateDriverModal({ isOpen, onClose, onSuccess }: CreateDriverModalProps) {
  const { success, error } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    vehicleType: '',
    vehiclePlate: '',
    capacity: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      error('Please enter driver name');
      return;
    }
    if (!formData.phone.trim()) {
      error('Please enter phone number');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      error('Please enter license number');
      return;
    }
    if (!formData.vehicleType) {
      error('Please select vehicle type');
      return;
    }
    if (!formData.vehiclePlate.trim()) {
      error('Please enter vehicle plate number');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      error('Please enter valid capacity');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/drm/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        success('Driver added successfully!');
        onSuccess();
        onClose();
        setFormData({
          name: '',
          phone: '',
          email: '',
          licenseNumber: '',
          vehicleType: '',
          vehiclePlate: '',
          capacity: ''
        });
      } else {
        const errorText = await response.text();
        error(`Failed to add driver: ${errorText}`);
      }
    } catch (err) {
      console.error('Error adding driver:', err);
      error('Error adding driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Driver"
      size="md"
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter driver's full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address (optional)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              placeholder="Enter driving license number"
              className="mt-1"
            />
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => handleInputChange('vehicleType', value)}
                className="mt-1"
              >
                <option value="">Select vehicle type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vehiclePlate">Vehicle Plate *</Label>
              <Input
                id="vehiclePlate"
                value={formData.vehiclePlate}
                onChange={(e) => handleInputChange('vehiclePlate', e.target.value.toUpperCase())}
                placeholder="Enter vehicle plate number"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="capacity">Vehicle Capacity (kg) *</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Enter maximum weight capacity"
              className="mt-1"
              min="1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            style={{
              backgroundColor: theme?.primary || '#2563eb',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 mr-2" />
                Add Driver
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
