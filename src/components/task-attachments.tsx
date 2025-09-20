'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/toast-context';
import { Button } from '@/components/ui/button';
import { 
  Paperclip, 
  Upload, 
  Download, 
  Trash2, 
  File,
  FileText,
  FileImage,
  FileVideo,
  Music,
  Archive,
  MoreVertical,
  X
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface TaskAttachment {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskAttachmentsProps {
  taskId: string;
  className?: string;
}

export function TaskAttachments({ taskId, className = '' }: TaskAttachmentsProps) {
  const { data: session } = useSession();
  const { success: showSuccess, error: showError } = useToast();
  
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/attachments`);
      
      if (response.ok) {
        const data = await response.json();
        setAttachments(data.attachments || []);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Attachments API error:', errorData);
        showError(errorData.error || errorData.details || `Failed to load attachments (${response.status})`);
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
      showError('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load attachments if session is available
    if (session?.user?.id) {
      loadAttachments();
    } else if (session !== undefined) {
      // Session is loaded but user is not authenticated
      setIsLoading(false);
    }
  }, [taskId, session]);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    const file = files[0];
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('File size exceeds 10MB limit');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAttachments(prev => [data.attachment, ...prev]);
        showSuccess('File uploaded successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments/${attachment.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      showError('Failed to download file');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
        showSuccess('Attachment deleted successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete attachment');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      showError('Failed to delete attachment');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('text/')) return <FileText className="w-4 h-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <Archive className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileUpload(files);
    }
  };

  if (isLoading || !session?.user?.id) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <Paperclip className="w-4 h-4" />
          <span className="font-medium">Attachments</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Paperclip className="w-4 h-4" />
          <span className="font-medium">Attachments ({attachments.length})</span>
        </div>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          size="sm"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
        multiple={false}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          Drag and drop a file here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            click to browse
          </button>
        </p>
        <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Paperclip className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No attachments yet</p>
            <p className="text-xs text-gray-400">Upload files to share with your team</p>
          </div>
        ) : (
          attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {/* File Icon */}
              <div className="flex-shrink-0 text-gray-500">
                {getFileIcon(attachment.mimeType)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>Uploaded by {attachment.uploader.name}</span>
                      <span>•</span>
                      <span>{formatDate(attachment.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    }
                    items={[
                      {
                        label: 'Download',
                        icon: <Download className="w-3 h-3 mr-2" />,
                        onClick: () => handleDownload(attachment)
                      },
                      ...(
                        (session?.user?.id === attachment.uploader.id || 
                         session?.user?.role === 'SUPER_ADMIN' || 
                         session?.user?.role === 'ADMIN') ? [{
                          label: 'Delete',
                          icon: <Trash2 className="w-3 h-3 mr-2" />,
                          onClick: () => handleDelete(attachment.id),
                          className: 'text-red-600'
                        }] : []
                      )
                    ]}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
