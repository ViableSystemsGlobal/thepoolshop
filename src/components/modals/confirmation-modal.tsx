"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  requireConfirmationText?: string;
  confirmationText?: string;
  onConfirmationTextChange?: (text: string) => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'danger',
  isLoading = false,
  requireConfirmationText,
  confirmationText = '',
  onConfirmationTextChange
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const isConfirmDisabled = isLoading || 
    (requireConfirmationText && confirmationText !== requireConfirmationText);

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          confirmButtonLoading: 'bg-red-400 cursor-not-allowed'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          confirmButtonLoading: 'bg-yellow-400 cursor-not-allowed'
        };
      case 'info':
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-500',
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          confirmButtonLoading: 'bg-blue-400 cursor-not-allowed'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          confirmButtonLoading: 'bg-red-400 cursor-not-allowed'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">{title}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {message}
              </p>
              
              {requireConfirmationText && (
                <div className="mt-4">
                  <label htmlFor="confirmation-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">{requireConfirmationText}</span> to confirm:
                  </label>
                  <input
                    id="confirmation-text"
                    type="text"
                    value={confirmationText}
                    onChange={(e) => onConfirmationTextChange?.(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={requireConfirmationText}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 ${isConfirmDisabled ? styles.confirmButtonLoading : styles.confirmButton} transition-colors`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
