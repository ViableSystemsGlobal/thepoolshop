'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, FileText, Image, File } from 'lucide-react';

interface UploadDistributorDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId: string;
  distributorName: string;
  onUploaded: () => void;
}

const DOCUMENT_TYPES = [
  // Agreement Documents
  { value: 'DISTRIBUTOR_AGREEMENT', label: 'Distributor Agreement', category: 'Agreements' },
  { value: 'SERVICE_CONTRACT', label: 'Service Contract', category: 'Agreements' },
  { value: 'TERMS_CONDITIONS', label: 'Terms & Conditions', category: 'Agreements' },
  
  // Business Documents
  { value: 'BUSINESS_LICENSE', label: 'Business License', category: 'Business' },
  { value: 'TAX_CERTIFICATE', label: 'Tax Certificate', category: 'Business' },
  { value: 'BUSINESS_PREMISES', label: 'Business Premises', category: 'Business' },
  
  // ID Documents
  { value: 'ID_DOCUMENT', label: 'ID Document', category: 'ID' },
  
  // Other Documents
  { value: 'PROFILE_PICTURE', label: 'Profile Picture', category: 'Other' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement', category: 'Other' },
  { value: 'REFERENCE_LETTER', label: 'Reference Letter', category: 'Other' },
  { value: 'OTHER', label: 'Other', category: 'Other' }
];

export default function UploadDistributorDocumentModal({
  isOpen,
  onClose,
  distributorId,
  distributorName,
  onUploaded
}: UploadDistributorDocumentModalProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !imageType) {
      error('Please select a file and document type');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('imageType', imageType);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await fetch(`/api/drm/distributors/${distributorId}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Document uploaded successfully!');
        setSelectedFile(null);
        setImageType('');
        setDescription('');
        onUploaded();
        onClose();
      } else {
        error(data.error || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      error('An error occurred while uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImageType('');
    setDescription('');
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Upload Document</h2>
              <p className="text-sm text-gray-600">{distributorName}</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <div className="mt-1">
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  {getFileIcon(selectedFile)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="imageType">Document Type</Label>
            <select
              id="imageType"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select document type...</option>
              {['Agreements', 'Business', 'ID', 'Other'].map(category => (
                <optgroup key={category} label={category}>
                  {DOCUMENT_TYPES.filter(type => type.category === category).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this document..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !imageType}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
