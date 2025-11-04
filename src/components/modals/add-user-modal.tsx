"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  X,
  Eye,
  EyeOff,
  Plus,
  User,
  Mail,
  Phone,
  Shield,
  Key
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: any) => void;
  roles?: Role[];
}

export default function AddUserModal({ isOpen, onClose, onAddUser, roles = [] }: AddUserModalProps) {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    isActive: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      showError('Email is required');
      return;
    }
    
    if (!formData.role) {
      showError('Role is required');
      return;
    }
    
    if (!formData.password || formData.password.trim().length < 6) {
      showError('Password is required and must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onAddUser(formData);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      role: "",
      phone: "",
      password: "",
      isActive: true
    });
    
    setIsCreating(false);
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isCreating}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <Input
                type="text"
                placeholder="Enter User Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <Input
                type="email"
                placeholder="Enter User Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roles*
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <div className="mt-1">
                <p className="text-xs text-orange-600">
                  Need a new role? <span className="cursor-pointer underline">Create role</span>
                </p>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile No
              </label>
              <Input
                type="tel"
                placeholder="Enter Mobile No"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              <p className="text-xs text-red-600 mt-1">
                Please use with country code. (ex. +91)
              </p>
            </div>

            {/* Login Enable Toggle */}
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Login is enable
              </label>
              <button
                type="button"
                onClick={() => handleInputChange('isActive', !formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? `bg-${theme.primary}` : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter User Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className={`px-6 bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </form>
      </div>
    </Dialog>
  );
}