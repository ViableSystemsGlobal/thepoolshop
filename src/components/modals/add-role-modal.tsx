"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Shield, X, Plus, Check } from "lucide-react";

interface Ability {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRoleModal({ isOpen, onClose, onSuccess }: AddRoleModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      fetchAbilities();
    }
  }, [isOpen]);

  const fetchAbilities = async () => {
    try {
      setIsLoadingAbilities(true);
      const response = await fetch('/api/abilities');
      if (response.ok) {
        const data = await response.json();
        setAbilities(data.abilities || []);
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
    setIsLoading(true);

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        success('Role created successfully');
        onSuccess();
        onClose();
        setFormData({ name: '', description: '', abilities: [] });
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showError('Failed to create role');
    } finally {
      setIsLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create New Role</h2>
              <p className="text-sm text-gray-600">Define permissions and abilities for this role</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
                />
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
                <div className="space-y-4">
                  {Object.entries(groupedAbilities).map(([resource, resourceAbilities]) => (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                        {resource.replace(/([A-Z])/g, ' $1').trim()}
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
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
