'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/contexts/toast-context';
import { Search, MapPin, Users, Check, X } from 'lucide-react';

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

interface AssignDistributorsToZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zone: Zone | null;
}

export function AssignDistributorsToZoneModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  zone 
}: AssignDistributorsToZoneModalProps) {
  const { success, error } = useToast();
  
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDistributors();
      setSearchTerm('');
      setSelectedDistributors([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = distributors.filter(distributor =>
        distributor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distributor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distributor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distributor.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDistributors(filtered);
    } else {
      setFilteredDistributors(distributors);
    }
  }, [searchTerm, distributors]);

  const loadDistributors = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/drm/distributors', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDistributors(data.data || []);
      } else {
        error('Failed to load distributors');
      }
    } catch (err) {
      console.error('Error loading distributors:', err);
      error('Error loading distributors');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDistributorSelect = (distributorId: string) => {
    setSelectedDistributors(prev => 
      prev.includes(distributorId) 
        ? prev.filter(id => id !== distributorId)
        : [...prev, distributorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDistributors.length === filteredDistributors.length) {
      setSelectedDistributors([]);
    } else {
      setSelectedDistributors(filteredDistributors.map(d => d.id));
    }
  };

  const handleSubmit = async () => {
    if (!zone || selectedDistributors.length === 0) {
      error('Please select at least one distributor');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/drm/distributors/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distributorIds: selectedDistributors,
          updates: {
            zoneId: zone.id
          }
        }),
        credentials: 'include',
      });

      if (response.ok) {
        success(`Successfully assigned ${selectedDistributors.length} distributor(s) to ${zone.name}`);
        onSuccess();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to assign distributors to zone');
      }
    } catch (err) {
      console.error('Error assigning distributors to zone:', err);
      error('An error occurred while assigning distributors');
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
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Assign Distributors to {zone.name}</h2>
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
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Distributors</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by business name, name, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selection Summary */}
          {selectedDistributors.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedDistributors.length} distributor(s) selected
              </p>
            </div>
          )}

          {/* Distributors List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Available Distributors</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={loadingData}
              >
                {selectedDistributors.length === filteredDistributors.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading distributors...</span>
              </div>
            ) : filteredDistributors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No distributors found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDistributors.map((distributor) => (
                  <div
                    key={distributor.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDistributors.includes(distributor.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDistributorSelect(distributor.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {distributor.businessName}
                          </h4>
                          {distributor.zoneId && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Already Assigned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {distributor.firstName} {distributor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {distributor.address && `${distributor.address}, `}
                          {distributor.city}
                        </p>
                        {distributor.latitude && distributor.longitude && (
                          <p className="text-xs text-gray-400">
                            📍 {distributor.latitude.toFixed(4)}, {distributor.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {selectedDistributors.includes(distributor.id) ? (
                          <Check className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || selectedDistributors.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Assign {selectedDistributors.length} Distributor(s)
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
