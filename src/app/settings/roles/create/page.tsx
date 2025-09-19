"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Plus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Save,
  X
} from "lucide-react";

interface Ability {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface Module {
  name: string;
  icon: string;
  abilities: Ability[];
  expanded: boolean;
}

const COMPREHENSIVE_MODULES: Module[] = [
  {
    name: "General",
    icon: "⚙️",
    abilities: [
      { id: "1", name: "users.manage", resource: "users", action: "manage", description: "Full user management" },
      { id: "2", name: "users.create", resource: "users", action: "create", description: "Create new users" },
      { id: "3", name: "users.edit", resource: "users", action: "edit", description: "Edit user information" },
      { id: "4", name: "users.delete", resource: "users", action: "delete", description: "Delete users" },
      { id: "5", name: "users.profile.manage", resource: "users", action: "profile-manage", description: "Profile management" },
      { id: "6", name: "users.reset.password", resource: "users", action: "reset-password", description: "Reset user passwords" },
      { id: "7", name: "users.login.manage", resource: "users", action: "login-manage", description: "Login management" },
      { id: "8", name: "users.import", resource: "users", action: "import", description: "Import users" },
      { id: "9", name: "users.logs.history", resource: "users", action: "logs-history", description: "View user logs" },
      { id: "10", name: "users.chat.manage", resource: "users", action: "chat-manage", description: "Chat management" },
      { id: "11", name: "settings.manage", resource: "settings", action: "manage", description: "System settings" },
      { id: "12", name: "roles.manage", resource: "roles", action: "manage", description: "Role management" }
    ],
    expanded: true
  },
  {
    name: "Sales & CRM",
    icon: "📊",
    abilities: [
      { id: "13", name: "leads.manage", resource: "leads", action: "manage", description: "Lead management" },
      { id: "14", name: "leads.show", resource: "leads", action: "show", description: "View leads" },
      { id: "15", name: "opportunities.manage", resource: "opportunities", action: "manage", description: "Opportunity management" },
      { id: "16", name: "opportunities.show", resource: "opportunities", action: "show", description: "View opportunities" },
      { id: "17", name: "quotations.manage", resource: "quotations", action: "manage", description: "Quotation management" },
      { id: "18", name: "quotations.show", resource: "quotations", action: "show", description: "View quotations" },
      { id: "19", name: "accounts.manage", resource: "accounts", action: "manage", description: "Account management" }
    ],
    expanded: false
  },
  {
    name: "Inventory",
    icon: "📦",
    abilities: [
      { id: "20", name: "products.manage", resource: "products", action: "manage", description: "Product management" },
      { id: "21", name: "products.create", resource: "products", action: "create", description: "Create products" },
      { id: "22", name: "products.edit", resource: "products", action: "edit", description: "Edit products" },
      { id: "23", name: "products.delete", resource: "products", action: "delete", description: "Delete products" },
      { id: "24", name: "products.show", resource: "products", action: "show", description: "View products" },
      { id: "25", name: "inventory.manage", resource: "inventory", action: "manage", description: "Inventory management" },
      { id: "26", name: "warehouses.manage", resource: "warehouses", action: "manage", description: "Warehouse management" },
      { id: "27", name: "stock-movements.manage", resource: "stock-movements", action: "manage", description: "Stock movement management" }
    ],
    expanded: false
  },
  {
    name: "Finance",
    icon: "💰",
    abilities: [
      { id: "28", name: "quotations.manage", resource: "quotations", action: "manage", description: "Quotation management" },
      { id: "29", name: "quotations.show", resource: "quotations", action: "show", description: "View quotations" },
      { id: "30", name: "invoices.manage", resource: "invoices", action: "manage", description: "Invoice management" },
      { id: "31", name: "invoices.show", resource: "invoices", action: "show", description: "View invoices" },
      { id: "32", name: "payments.manage", resource: "payments", action: "manage", description: "Payment management" },
      { id: "33", name: "payments.create", resource: "payments", action: "create", description: "Create payments" },
      { id: "34", name: "payments.delete", resource: "payments", action: "delete", description: "Delete payments" }
    ],
    expanded: false
  },
  {
    name: "Reports",
    icon: "📈",
    abilities: [
      { id: "35", name: "reports.read", resource: "reports", action: "read", description: "View reports" },
      { id: "36", name: "reports.sales", resource: "reports", action: "sales", description: "Sales reports" },
      { id: "37", name: "reports.inventory", resource: "reports", action: "inventory", description: "Inventory reports" },
      { id: "38", name: "reports.financial", resource: "reports", action: "financial", description: "Financial reports" },
      { id: "39", name: "dashboard.read", resource: "dashboard", action: "read", description: "Dashboard access" }
    ],
    expanded: false
  }
];

export default function CreateRolePage() {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const router = useRouter();
  
  const [modules, setModules] = useState<Module[]>(COMPREHENSIVE_MODULES);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      showError('Role name is required');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          abilities: selectedAbilities,
        }),
      });

      if (response.ok) {
        success('Role created successfully');
        router.push('/settings/roles');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showError('Failed to create role');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleModule = (moduleName: string) => {
    setModules(prev => prev.map(m => 
      m.name === moduleName ? { ...m, expanded: !m.expanded } : m
    ));
  };

  const toggleAbility = (abilityId: string) => {
    setSelectedAbilities(prev => 
      prev.includes(abilityId) 
        ? prev.filter(id => id !== abilityId)
        : [...prev, abilityId]
    );
  };

  const getActionColor = (action: string) => {
    if (action === 'manage') return 'bg-purple-100 text-purple-800';
    if (action === 'create') return 'bg-green-100 text-green-800';
    if (action === 'read' || action === 'show') return 'bg-blue-100 text-blue-800';
    if (action === 'edit') return 'bg-yellow-100 text-yellow-800';
    if (action === 'delete') return 'bg-red-100 text-red-800';
    if (action.includes('profile')) return 'bg-indigo-100 text-indigo-800';
    if (action.includes('password')) return 'bg-orange-100 text-orange-800';
    if (action.includes('login')) return 'bg-teal-100 text-teal-800';
    if (action.includes('import')) return 'bg-pink-100 text-pink-800';
    if (action.includes('logs')) return 'bg-gray-100 text-gray-800';
    if (action.includes('chat')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
              <p className="text-gray-600">Define a new role and assign permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/settings/roles')}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={isCreating || !newRoleName.trim()}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Role Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Role Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    placeholder="Enter Role Name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Role description"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Module Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <button
                      key={module.name}
                      onClick={() => toggleModule(module.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        module.expanded ? `bg-${theme.primaryBg} border border-${theme.primaryBorder}` : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{module.icon}</span>
                        <span className="font-medium text-gray-900">{module.name}</span>
                      </div>
                      {module.expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Permissions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {modules.map((module) => (
                    <div key={module.name}>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-lg">{module.icon}</span>
                        <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                      </div>
                      
                      {module.expanded && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`module-${module.name}`}
                              checked={module.abilities.every(a => selectedAbilities.includes(a.id))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAbilities(prev => [
                                    ...prev,
                                    ...module.abilities.map(a => a.id).filter(id => !prev.includes(id))
                                  ]);
                                } else {
                                  setSelectedAbilities(prev => 
                                    prev.filter(id => !module.abilities.map(a => a.id).includes(id))
                                  );
                                }
                              }}
                              className={`h-4 w-4 text-${theme.primary} focus:ring-${theme.primary} border-gray-300 rounded`}
                            />
                            <label htmlFor={`module-${module.name}`} className="text-sm font-medium text-gray-700">
                              Assign {module.name} Permission to Roles
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {module.abilities.map((ability) => (
                              <div
                                key={ability.id}
                                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  id={`ability-${ability.id}`}
                                  checked={selectedAbilities.includes(ability.id)}
                                  onChange={() => toggleAbility(ability.id)}
                                  className={`h-4 w-4 text-${theme.primary} focus:ring-${theme.primary} border-gray-300 rounded`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <label htmlFor={`ability-${ability.id}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                                      {ability.name}
                                    </label>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(ability.action)}`}>
                                      {ability.action}
                                    </span>
                                  </div>
                                  {ability.description && (
                                    <p className="text-xs text-gray-600 mt-1">{ability.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Role Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Role Name</p>
                <p className="text-lg text-gray-900">{newRoleName || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-lg text-gray-900">{newRoleDescription || "No description"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Selected Permissions</p>
                <p className="text-lg text-gray-900">{selectedAbilities.length} permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
