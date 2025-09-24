'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { Download, FileText, Table } from 'lucide-react';

interface ExportDistributorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributors: any[];
}

export function ExportDistributorsModal({ isOpen, onClose, distributors }: ExportDistributorsModalProps) {
  const { success, error } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'firstName', 'lastName', 'businessName', 'email', 'phone', 'status', 'approvedAt'
  ]);

  const availableFields = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'businessName', label: 'Business Name' },
    { id: 'businessType', label: 'Business Type' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'address', label: 'Address' },
    { id: 'city', label: 'City' },
    { id: 'region', label: 'Region' },
    { id: 'country', label: 'Country' },
    { id: 'territory', label: 'Territory' },
    { id: 'status', label: 'Status' },
    { id: 'approvedAt', label: 'Approved Date' },
    { id: 'expectedVolume', label: 'Expected Volume' },
    { id: 'experience', label: 'Experience' },
    { id: 'investmentCapacity', label: 'Investment Capacity' }
  ];

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      error('Please select at least one field to export');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/drm/distributors/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          fields: selectedFields,
          distributorIds: distributors.map(d => d.id)
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `distributors_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        success(`Distributors exported successfully as ${format.toUpperCase()}`);
        onClose();
      } else {
        const errorText = await response.text();
        error(`Failed to export: ${errorText}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      error('Error exporting distributors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Distributors"
      size="lg"
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <Label className="text-sm font-medium">Export Format</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value as 'csv')}
                className="text-blue-600"
              />
              <FileText className="w-4 h-4" />
              <span>CSV</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={format === 'excel'}
                onChange={(e) => setFormat(e.target.value as 'excel')}
                className="text-blue-600"
              />
              <Table className="w-4 h-4" />
              <span>Excel</span>
            </label>
          </div>
        </div>

        {/* Field Selection */}
        <div>
          <Label className="text-sm font-medium">Select Fields to Export</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {availableFields.map((field) => (
              <label key={field.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={() => handleFieldToggle(field.id)}
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>{distributors.length}</strong> distributors will be exported with{' '}
            <strong>{selectedFields.length}</strong> selected fields.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading || selectedFields.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            style={{
              backgroundColor: theme?.primary || '#2563eb',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
