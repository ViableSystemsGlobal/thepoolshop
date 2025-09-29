'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { MapPin, User, Calendar, Clock, Route, Truck, Package, Navigation } from 'lucide-react';

interface Route {
  id: string;
  name: string;
  zone: {
    id: string;
    name: string;
    color: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
  };
  waypoints: any[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  deliveries: Array<{
    id: string;
    sequence: number;
    status: string;
    scheduledAt: string;
    distributor: {
      id: string;
      businessName: string;
      city: string;
      region: string;
    };
  }>;
}

interface ViewRouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
}

export function ViewRouteDetailsModal({ isOpen, onClose, route }: ViewRouteDetailsModalProps) {
  if (!route) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Route Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Route Header */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <Route className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: route.zone.color }}
                />
                <span className="text-sm text-gray-600">{route.zone.name}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                {route.status}
              </span>
            </div>
          </div>
        </div>

        {/* Route Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Distance</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {route.totalDistance.toFixed(1)} km
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Duration</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Deliveries</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {route.deliveries.length}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Scheduled</span>
            </div>
            <p className="text-sm font-bold text-orange-900 mt-1">
              {formatDate(route.scheduledDate)}
            </p>
            <p className="text-xs text-orange-700">
              {formatTime(route.scheduledDate)}
            </p>
          </div>
        </div>

        {/* Driver Information */}
        {route.driver && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Driver Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{route.driver.name}</p>
                  <p className="text-sm text-gray-600">{route.driver.phone}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{route.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm text-gray-600">{route.driver.vehiclePlate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Stops */}
        {route.deliveries && route.deliveries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Delivery Stops</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {route.deliveries
                .sort((a, b) => a.sequence - b.sequence)
                .map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-800">{delivery.sequence}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{delivery.distributor.businessName}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.distributor.city}, {delivery.distributor.region}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(delivery.scheduledAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Timeline */}
        {route.startedAt && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Route Timeline</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Route Started</p>
                  <p className="text-xs text-blue-700">
                    {formatDate(route.startedAt)} at {formatTime(route.startedAt)}
                  </p>
                </div>
              </div>
              {route.completedAt && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Route Completed</p>
                    <p className="text-xs text-green-700">
                      {formatDate(route.completedAt)} at {formatTime(route.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
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
