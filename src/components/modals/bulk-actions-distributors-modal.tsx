'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { Users, Edit, Trash2, Download } from 'lucide-react';

interface BulkActionsDistributorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistributors: any[];
  onSuccess: () => void;
}

export function BulkActionsDistributorsModal({ 
  isOpen, 
  onClose, 
  selectedDistributors, 
  onSuccess 
}: BulkActionsDistributorsModalProps) {
  const { success, error } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');

  const handleBulkAction = async () => {
    if (!action) {
      error('Please select an action');
      return;
    }

    if (action === 'changeStatus' && !newStatus) {
      error('Please select a new status');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      switch (action) {
        case 'changeStatus':
          response = await fetch('/api/drm/distributors/bulk-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              distributorIds: selectedDistributors.map(d => d.id),
              updates: { status: newStatus }
            }),
            credentials: 'include',
          });
          break;
          
        case 'export':
          // Trigger export for selected distributors
          const exportResponse = await fetch('/api/drm/distributors/export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              format: 'csv',
              fields: ['firstName', 'lastName', 'businessName', 'email', 'phone', 'status', 'approvedAt'],
              distributorIds: selectedDistributors.map(d => d.id)
            }),
            credentials: 'include',
          });
          
          if (exportResponse.ok) {
            const blob = await exportResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `selected_distributors_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            success(`Exported ${selectedDistributors.length} distributors successfully`);
            onClose();
            return;
          } else {
            throw new Error('Export failed');
          }
          
        case 'delete':
          response = await fetch('/api/drm/distributors/bulk-delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              distributorIds: selectedDistributors.map(d => d.id)
            }),
            credentials: 'include',
          });
          break;
          
        default:
          throw new Error('Invalid action');
      }

      if (response && response.ok) {
        const data = await response.json();
        success(data.message || `Bulk action completed successfully`);
        onSuccess();
        onClose();
      } else if (response) {
        const errorText = await response.text();
        error(`Failed to perform bulk action: ${errorText}`);
      }
    } catch (err) {
      console.error('Bulk action error:', err);
      error('Error performing bulk action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Actions"
      size="md"
    >
      <div className="space-y-6">
        {/* Selected Count */}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>{selectedDistributors.length}</strong> distributors selected
          </p>
        </div>

        {/* Action Selection */}
        <div>
          <Label className="text-sm font-medium">Select Action</Label>
          <Select
            value={action}
            onValueChange={setAction}
            className="mt-2"
          >
            <option value="">Choose an action...</option>
            <option value="changeStatus">Change Status</option>
            <option value="export">Export Selected</option>
            <option value="delete">Delete Selected</option>
          </Select>
        </div>

        {/* Status Selection (if changing status) */}
        {action === 'changeStatus' && (
          <div>
            <Label className="text-sm font-medium">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
              className="mt-2"
            >
              <option value="">Select new status...</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>
        )}

        {/* Warning for delete action */}
        {action === 'delete' && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All selected distributors will be permanently deleted.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkAction}
            disabled={loading || !action || (action === 'changeStatus' && !newStatus)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            style={{
              backgroundColor: theme?.primary || '#2563eb',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {action === 'changeStatus' && <Edit className="w-4 h-4 mr-2" />}
                {action === 'export' && <Download className="w-4 h-4 mr-2" />}
                {action === 'delete' && <Trash2 className="w-4 h-4 mr-2" />}
                {action === 'changeStatus' && 'Update Status'}
                {action === 'export' && 'Export'}
                {action === 'delete' && 'Delete'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
