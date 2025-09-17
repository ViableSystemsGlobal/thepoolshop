"use client";

import { Button } from "@/components/ui/button";
import { Building, MapPin, Calendar, Hash, CheckCircle, XCircle, X } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
}

export function WarehouseDetailsModal({ isOpen, onClose, warehouse }: WarehouseDetailsModalProps) {
  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Warehouse Details</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                <p className="text-sm text-gray-600">Warehouse Information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code</label>
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{warehouse.code}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {warehouse.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${
                    warehouse.isActive ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              Location
            </h4>
            
            <div className="space-y-3">
              {warehouse.address && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm text-gray-900 mt-1">{warehouse.address}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {warehouse.city && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <p className="text-sm text-gray-900 mt-1">{warehouse.city}</p>
                  </div>
                )}
                
                {warehouse.country && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <p className="text-sm text-gray-900 mt-1">{warehouse.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              Timeline
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(warehouse.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(warehouse.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t p-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
