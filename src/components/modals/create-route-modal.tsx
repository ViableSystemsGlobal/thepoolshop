'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/contexts/toast-context';
import { Route, X, Plus, MapPin, User, Calendar, Clock } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
}

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRouteModal({ isOpen, onClose, onSuccess }: CreateRouteModalProps) {
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zoneId: '',
    driverId: '',
    scheduledDate: '',
    scheduledTime: '',
    waypoints: [] as string[],
    notes: ''
  });
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      const [zonesResponse, driversResponse] = await Promise.all([
        fetch('/api/drm/zones', { credentials: 'include' }),
        fetch('/api/drm/drivers', { credentials: 'include' })
      ]);

      if (zonesResponse.ok) {
        const zonesData = await zonesResponse.json();
        setZones(zonesData.data || []);
      }

      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        setDrivers(driversData.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      error('Failed to load zones and drivers');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addWaypoint = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, '']
    }));
  };

  const updateWaypoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) => i === index ? value : wp)
    }));
  };

  const removeWaypoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Route name is required';
    }

    if (!formData.zoneId) {
      newErrors.zoneId = 'Zone selection is required';
    }

    if (!formData.driverId) {
      newErrors.driverId = 'Driver selection is required';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        waypoints: formData.waypoints.filter(wp => wp.trim() !== ''),
        scheduledDateTime: `${formData.scheduledDate}T${formData.scheduledTime}:00.000Z`
      };

      const response = await fetch('/api/drm/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });

      if (response.ok) {
        success('Route created successfully!');
        onSuccess();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to create route');
      }
    } catch (err) {
      console.error('Error creating route:', err);
      error('Error creating route');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      zoneId: '',
      driverId: '',
      scheduledDate: '',
      scheduledTime: '',
      waypoints: [],
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Route className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create New Route</h2>
              <p className="text-sm text-gray-600">Plan a new delivery route</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            ) : (
              <>
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Route Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., North Zone Morning Route"
                      className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the route purpose and any special instructions..."
                      rows={3}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Zone and Driver Selection */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">Assignment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zoneId" className="text-sm font-medium text-gray-700">
                        Zone *
                      </Label>
                      <Select
                        id="zoneId"
                        value={formData.zoneId}
                        onValueChange={(value) => handleInputChange('zoneId', value)}
                        className={errors.zoneId ? 'border-red-500' : ''}
                      >
                        <option value="">Select a zone</option>
                        {zones.filter(zone => zone.isActive).map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </Select>
                      {errors.zoneId && <p className="text-red-500 text-sm mt-1">{errors.zoneId}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driverId" className="text-sm font-medium text-gray-700">
                        Driver *
                      </Label>
                      <Select
                        id="driverId"
                        value={formData.driverId}
                        onValueChange={(value) => handleInputChange('driverId', value)}
                        className={errors.driverId ? 'border-red-500' : ''}
                      >
                        <option value="">Select a driver</option>
                        {drivers.filter(driver => driver.isActive).map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.firstName} {driver.lastName}
                          </option>
                        ))}
                      </Select>
                      {errors.driverId && <p className="text-red-500 text-sm mt-1">{errors.driverId}</p>}
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">Schedule</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700">
                        Date *
                      </Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.scheduledDate ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime" className="text-sm font-medium text-gray-700">
                        Time *
                      </Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.scheduledTime ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.scheduledTime && <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>}
                    </div>
                  </div>
                </div>

                {/* Waypoints */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900">Waypoints</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWaypoint}
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Waypoint
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={waypoint}
                            onChange={(e) => updateWaypoint(index, e.target.value)}
                            placeholder={`Waypoint ${index + 1} (address or landmark)`}
                            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWaypoint(index)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {formData.waypoints.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        No waypoints added yet. Click "Add Waypoint" to add delivery stops.
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions, delivery requirements, or notes..."
                    rows={3}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Route className="h-4 w-4 mr-2" />
                  Create Route
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
