"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Mail, Phone, Shield, Calendar, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'ADMIN': 'bg-red-100 text-red-800',
      'SALES_MANAGER': 'bg-blue-100 text-blue-800',
      'SALES_REP': 'bg-green-100 text-green-800',
      'INVENTORY_MANAGER': 'bg-purple-100 text-purple-800',
      'FINANCE_OFFICER': 'bg-yellow-100 text-yellow-800',
      'EXECUTIVE_VIEWER': 'bg-gray-100 text-gray-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role: string) => {
    const roleMapping: { [key: string]: string } = {
      'ADMIN': 'Super Admin',
      'SALES_MANAGER': 'Sales Manager',
      'SALES_REP': 'Sales Rep',
      'INVENTORY_MANAGER': 'Inventory Manager',
      'FINANCE_OFFICER': 'Finance Officer',
      'EXECUTIVE_VIEWER': 'Executive Viewer'
    };
    return roleMapping[role] || role;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            User Details
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{user.phone || 'No phone number'}</span>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Role Information</h4>
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{getRoleDisplayName(user.role)}</span>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Account Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
              {user.lastLogin && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Last Login:</span> {formatDate(user.lastLogin)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
