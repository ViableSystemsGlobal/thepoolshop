"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Shield, X, Edit, Check, Trash2 } from "lucide-react";

interface Ability {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  roleAbilities?: Array<{
    ability: Ability;
  }>;
  _count?: {
    userRoles: number;
  };
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: Role | null;
}

export function EditRoleModal({ isOpen, onClose, onSuccess, role }: EditRoleModalProps) {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    abilities: [] as string[]
  });
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAbilities, setIsLoadingAbilities] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        abilities: role.roleAbilities?.map(ra => ra.ability.id) || []
      });
      fetchAbilities();
    }
  }, [isOpen, role]);

  const fetchAbilities = async () => {
    try {
      setIsLoadingAbilities(true);
      const response = await fetch('/api/abilities/public');
      if (response.ok) {
        const data = await response.json();
        setAbilities(data.abilities || []);
        console.log('Loaded abilities:', data.abilities?.length);
        console.log('Abilities by resource:', Object.entries(
          (data.abilities || []).reduce((acc: any, ability: any) => {
            if (!acc[ability.resource]) acc[ability.resource] = 0;
            acc[ability.resource]++;
            return acc;
          }, {})
        ));
      } else {
        showError('Failed to load abilities');
      }
    } catch (error) {
      console.error('Error fetching abilities:', error);
      showError('Failed to load abilities');
    } finally {
      setIsLoadingAbilities(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        success('Role updated successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showError('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    
    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Role deleted successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showError('Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAbilityToggle = (abilityId: string) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.includes(abilityId)
        ? prev.abilities.filter(id => id !== abilityId)
        : [...prev.abilities, abilityId]
    }));
  };

  const groupedAbilities = abilities.reduce((acc, ability) => {
    if (!acc[ability.resource]) {
      acc[ability.resource] = [];
    }
    acc[ability.resource].push(ability);
    return acc;
  }, {} as Record<string, Ability[]>);

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Role</h2>
              <p className="text-sm text-gray-600">{role.name}</p>
              {role.isSystem && (
                <p className="text-xs text-amber-600 font-medium">System Role</p>
              )}
            </div>
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Role Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Customer Service Manager"
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={role.isSystem}
                />
                {role.isSystem && (
                  <p className="text-xs text-gray-500">System roles cannot be renamed</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and scope of this role..."
                  rows={3}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Role Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Users with this role</div>
                    <div className="text-2xl font-bold text-gray-900">{role._count?.userRoles || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Abilities assigned</div>
                    <div className="text-2xl font-bold text-gray-900">{formData.abilities.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Abilities Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-900">Permissions</h3>
                <div className="text-sm text-gray-600">
                  {formData.abilities.length} of {abilities.length} abilities selected
                </div>
              </div>

              {isLoadingAbilities ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading abilities...</span>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <div className="space-y-4 p-4">
                    {Object.entries(groupedAbilities).map(([resource, resourceAbilities]) => (
                      <div key={resource} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize flex items-center">
                          {resource.replace(/([A-Z])/g, ' $1').trim()}
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {resourceAbilities.length} abilities
                          </span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {resourceAbilities.map((ability) => (
                            <button
                              key={ability.id}
                              type="button"
                              onClick={() => handleAbilityToggle(ability.id)}
                              className={`flex items-center p-3 rounded-md border text-left transition-colors ${
                                formData.abilities.includes(ability.id)
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                                formData.abilities.includes(ability.id)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300'
                              }`}>
                                {formData.abilities.includes(ability.id) && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">
                                  {ability.action.charAt(0).toUpperCase() + ability.action.slice(1)}
                                </div>
                                {ability.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {ability.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50 flex-shrink-0">
            <div>
              {!role.isSystem && (role._count?.userRoles || 0) === 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Role
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isDeleting || !formData.name.trim()}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Role
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
