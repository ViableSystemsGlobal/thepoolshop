'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/contexts/toast-context';
import { Route, MapPin, Navigation, Clock, Users, Building, MapPinIcon } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Distributor {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  zoneId?: string;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
}

interface GenerateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zone: Zone | null;
}

export function GenerateRouteModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  zone 
}: GenerateRouteModalProps) {
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    driverId: '',
    scheduledDate: '',
    scheduledTime: '',
    startingPoint: '',
    notes: ''
  });
  
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [companyAddress, setCompanyAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (isOpen && zone) {
      loadData();
      setFormData({
        name: `${zone.name} Route - ${new Date().toLocaleDateString()}`,
        description: `Auto-generated route for ${zone.name}`,
        driverId: '',
        scheduledDate: '',
        scheduledTime: '',
        startingPoint: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, zone]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [distributorsResponse, driversResponse, settingsResponse] = await Promise.all([
        fetch(`/api/drm/distributors?zoneId=${zone?.id}`, { credentials: 'include' }),
        fetch('/api/drm/drivers', { credentials: 'include' }),
        fetch('/api/settings/company', { credentials: 'include' })
      ]);

      if (distributorsResponse.ok) {
        const data = await distributorsResponse.json();
        setDistributors(data.data || []);
      }

      if (driversResponse.ok) {
        const data = await driversResponse.json();
        setDrivers(data.data || []);
      }

      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        setCompanyAddress(data.companyAddress || '');
        setFormData(prev => ({ ...prev, startingPoint: data.companyAddress || '' }));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      error('Error loading necessary data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address
          const response = await fetch(`/api/google-maps/reverse-geocode?lat=${latitude}&lng=${longitude}`, {
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, startingPoint: data.address || `${latitude}, ${longitude}` }));
          } else {
            // Fallback to coordinates
            setFormData(prev => ({ ...prev, startingPoint: `${latitude}, ${longitude}` }));
          }
        } catch (err) {
          console.error('Error getting address:', err);
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, startingPoint: `${latitude}, ${longitude}` }));
        } finally {
          setLocationLoading(false);
        }
      },
      (geolocationError) => {
        console.error('Error getting location:', geolocationError);
        error('Unable to get your current location');
        setLocationLoading(false);
      }
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Route name is required';
    if (!formData.driverId) newErrors.driverId = 'Driver is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Scheduled time is required';
    if (!formData.startingPoint.trim()) newErrors.startingPoint = 'Starting point is required';
    
    if (distributors.length === 0) {
      newErrors.distributors = 'No distributors found in this zone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Get coordinates for all distributors in the zone
      const distributorCoordinates = distributors
        .filter(d => d.latitude && d.longitude)
        .map(d => ({
          id: d.id,
          name: d.businessName,
          address: d.address || `${d.city}`,
          latitude: d.latitude!,
          longitude: d.longitude!
        }));

      if (distributorCoordinates.length === 0) {
        error('No distributors with valid coordinates found in this zone');
        setLoading(false);
        return;
      }

      // Generate optimized route using Google Maps API
      const response = await fetch('/api/drm/routes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          zoneId: zone?.id,
          scheduledDateTime: `${formData.scheduledDate}T${formData.scheduledTime}:00Z`,
          startingPoint: formData.startingPoint,
          distributorCoordinates,
          optimizeRoute: true
        }),
        credentials: 'include',
      });

      if (response.ok) {
        success('Route generated successfully!');
        onSuccess();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to generate route');
      }
    } catch (err) {
      console.error('Error generating route:', err);
      error('An error occurred while generating the route');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!zone) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Generate Route for {zone.name}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Zone Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">{zone.name}</h3>
            </div>
            {zone.description && (
              <p className="text-sm text-gray-600">{zone.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {distributors.length} distributors
              </div>
              <div className="flex items-center gap-1">
                <Navigation className="h-4 w-4" />
                {distributors.filter(d => d.latitude && d.longitude).length} with coordinates
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Route Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., North Zone Daily Delivery"
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the route"
                rows={1}
              />
            </div>
          </div>

          {/* Assignment & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverId">Assign Driver *</Label>
              <select
                id="driverId"
                value={formData.driverId}
                onChange={(e) => handleInputChange('driverId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.driverId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="" className="text-gray-900">Select a Driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id} className="text-gray-900">
                    {driver.name}
                  </option>
                ))}
              </select>
              {errors.driverId && <p className="text-red-500 text-sm">{errors.driverId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className={errors.scheduledDate ? 'border-red-500' : ''}
                required
              />
              {errors.scheduledDate && <p className="text-red-500 text-sm">{errors.scheduledDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Time *</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className={errors.scheduledTime ? 'border-red-500' : ''}
                required
              />
              {errors.scheduledTime && <p className="text-red-500 text-sm">{errors.scheduledTime}</p>}
            </div>
          </div>

          {/* Starting Point */}
          <div className="space-y-2">
            <Label htmlFor="startingPoint">Starting Point *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startingPoint"
                  value={formData.startingPoint}
                  onChange={(e) => handleInputChange('startingPoint', e.target.value)}
                  placeholder="Enter starting address or use company address"
                  className={`pl-10 ${errors.startingPoint ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="px-3"
                title="Get current location"
              >
                {locationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <MapPinIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.startingPoint && <p className="text-red-500 text-sm">{errors.startingPoint}</p>}
            {companyAddress && (
              <p className="text-xs text-gray-500">
                Company address: {companyAddress}
              </p>
            )}
          </div>

          {/* Distributors Preview */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Distributors in Route</h3>
            {loadingData ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading distributors...</span>
              </div>
            ) : distributors.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No distributors found in this zone</p>
                {errors.distributors && <p className="text-red-500 text-sm">{errors.distributors}</p>}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {distributors.map((distributor) => (
                    <div key={distributor.id} className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {distributor.businessName}
                        {distributor.latitude && distributor.longitude ? (
                          <span className="text-green-600 ml-1">✓</span>
                        ) : (
                          <span className="text-red-500 ml-1">⚠</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ = Has coordinates, ⚠ = Missing coordinates
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes for the route..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
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
                Generating...
              </>
            ) : (
              <>
                <Route className="h-4 w-4 mr-2" />
                Generate Route
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
