'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Route, Calendar, Building } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  distributors?: Array<{
    id: string;
    businessName: string;
    city: string;
    region: string;
  }>;
  routes?: Array<{
    id: string;
    name: string;
    status: string;
    scheduledDate: string;
  }>;
}

interface ViewZoneDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: Zone | null;
}

export function ViewZoneDetailsModal({ isOpen, onClose, zone }: ViewZoneDetailsModalProps) {
  if (!zone) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zone Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Zone Header */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: zone.color }}
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{zone.name}</h3>
            <p className="text-sm text-gray-600">
              Created on {formatDate(zone.createdAt)}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              zone.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {zone.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Description */}
        {zone.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Description</h4>
            <p className="text-gray-600">{zone.description}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Distributors</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {zone.distributors?.length || 0}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Route className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Routes</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {zone.routes?.length || 0}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Zone ID</span>
            </div>
            <p className="text-sm font-mono text-purple-900 mt-1">
              {zone.id.slice(-8)}
            </p>
          </div>
        </div>

        {/* Distributors List */}
        {zone.distributors && zone.distributors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Assigned Distributors</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {zone.distributors.map((distributor) => (
                <div key={distributor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{distributor.businessName}</p>
                      <p className="text-sm text-gray-600">
                        {distributor.city}, {distributor.region}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routes List */}
        {zone.routes && zone.routes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Routes</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {zone.routes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Route className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{route.name}</p>
                      <p className="text-sm text-gray-600">
                        Scheduled: {formatDate(route.scheduledDate)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Messages */}
        {(!zone.distributors || zone.distributors.length === 0) && 
         (!zone.routes || zone.routes.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No distributors or routes assigned to this zone yet.</p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
