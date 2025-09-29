'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/toast-context';

interface Zone {
  id: string;
  name: string;
  distributors?: any[];
  routes?: any[];
}

interface DeleteZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zone: Zone | null;
}

export function DeleteZoneModal({ isOpen, onClose, onSuccess, zone }: DeleteZoneModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!zone) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/drm/zones/${zone.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        success('Zone deleted successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to delete zone');
      }
    } catch (err) {
      console.error('Error deleting zone:', err);
      error('Failed to delete zone');
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

  const hasDistributors = zone.distributors && zone.distributors.length > 0;
  const hasRoutes = zone.routes && zone.routes.length > 0;
  const canDelete = !hasDistributors && !hasRoutes;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Zone"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Delete Zone: {zone.name}</h3>
            <p className="text-sm text-red-700 mt-1">
              This action cannot be undone. Are you sure you want to delete this zone?
            </p>
          </div>
        </div>

        {/* Zone Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Zone Information</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Zone Name:</span>
              <span className="text-sm font-medium">{zone.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Assigned Distributors:</span>
              <span className="text-sm font-medium">
                {zone.distributors?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Routes:</span>
              <span className="text-sm font-medium">
                {zone.routes?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Deletion Restrictions */}
        {!canDelete && (
          <div className="space-y-3">
            <h4 className="font-medium text-red-900">Cannot Delete Zone</h4>
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              {hasDistributors && (
                <p className="text-sm text-red-700">
                  • This zone has {zone.distributors?.length} assigned distributor(s). 
                  Please reassign or remove them first.
                </p>
              )}
              {hasRoutes && (
                <p className="text-sm text-red-700">
                  • This zone has {zone.routes?.length} active route(s). 
                  Please complete or cancel them first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading || !canDelete}
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Zone
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
