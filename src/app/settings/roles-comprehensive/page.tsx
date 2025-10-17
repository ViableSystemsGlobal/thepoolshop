"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  Shield, 
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Eye,
  EyeOff,
  Settings,
  Package,
  BarChart3,
  DollarSign,
  FileText,
  Building,
  UserCheck,
  UserX
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  memberCount: number;
  abilities: Ability[];
  createdAt: string;
}

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

// Comprehensive mock data based on the examples
const MOCK_ROLES: Role[] = [
  {
    id: "1",
    name: "Administrator",
    description: "Full system access and management capabilities",
    isSystem: true,
    isActive: true,
    memberCount: 1,
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
      { id: "11", name: "roles.manage", resource: "roles", action: "manage", description: "Role management" },
      { id: "12", name: "settings.manage", resource: "settings", action: "manage", description: "System settings" }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Sales Manager",
    description: "Sales team management and oversight",
    isSystem: true,
    isActive: true,
    memberCount: 2,
    abilities: [
      { id: "13", name: "users.edit", resource: "users", action: "edit", description: "Edit user information" },
      { id: "14", name: "users.profile.manage", resource: "users", action: "profile-manage", description: "Profile management" },
      { id: "15", name: "users.login.manage", resource: "users", action: "login-manage", description: "Login management" },
      { id: "16", name: "users.logs.history", resource: "users", action: "logs-history", description: "View user logs" },
      { id: "17", name: "users.chat.manage", resource: "users", action: "chat-manage", description: "Chat management" },
      { id: "18", name: "leads.manage", resource: "leads", action: "manage", description: "Lead management" },
      { id: "19", name: "opportunities.manage", resource: "opportunities", action: "manage", description: "Opportunity management" },
      { id: "20", name: "quotations.manage", resource: "quotations", action: "manage", description: "Quotation management" },
      { id: "21", name: "accounts.manage", resource: "accounts", action: "manage", description: "Account management" }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Sales Representative",
    description: "Customer sales and lead management",
    isSystem: true,
    isActive: true,
    memberCount: 5,
    abilities: [
      { id: "22", name: "users.profile.manage", resource: "users", action: "profile-manage", description: "Profile management" },
      { id: "23", name: "users.logs.history", resource: "users", action: "logs-history", description: "View user logs" },
      { id: "24", name: "users.chat.manage", resource: "users", action: "chat-manage", description: "Chat management" },
      { id: "25", name: "leads.manage", resource: "leads", action: "manage", description: "Lead management" },
      { id: "26", name: "leads.show", resource: "leads", action: "show", description: "View leads" },
      { id: "27", name: "opportunities.manage", resource: "opportunities", action: "manage", description: "Opportunity management" },
      { id: "28", name: "opportunities.show", resource: "opportunities", action: "show", description: "View opportunities" },
      { id: "29", name: "quotations.manage", resource: "quotations", action: "manage", description: "Quotation management" },
      { id: "30", name: "quotations.show", resource: "quotations", action: "show", description: "View quotations" },
      { id: "31", name: "accounts.manage", resource: "accounts", action: "manage", description: "Account management" }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Inventory Manager",
    description: "Stock and warehouse management",
    isSystem: true,
    isActive: true,
    memberCount: 0,
    abilities: [
      { id: "32", name: "users.profile.manage", resource: "users", action: "profile-manage", description: "Profile management" },
      { id: "33", name: "workspace.manage", resource: "workspace", action: "manage", description: "Workspace management" },
      { id: "34", name: "accounts.manage", resource: "accounts", action: "manage", description: "Account management" },
      { id: "35", name: "products.manage", resource: "products", action: "manage", description: "Product management" },
      { id: "36", name: "products.show", resource: "products", action: "show", description: "View products" },
      { id: "37", name: "inventory.manage", resource: "inventory", action: "manage", description: "Inventory management" },
      { id: "38", name: "warehouses.manage", resource: "warehouses", action: "manage", description: "Warehouse management" },
      { id: "39", name: "stock-movements.manage", resource: "stock-movements", action: "manage", description: "Stock movement management" }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Finance Officer",
    description: "Financial operations and reporting",
    isSystem: true,
    isActive: true,
    memberCount: 0,
    abilities: [
      { id: "40", name: "users.manage", resource: "users", action: "manage", description: "User management" },
      { id: "41", name: "users.profile.manage", resource: "users", action: "profile-manage", description: "Profile management" },
      { id: "42", name: "users.logs.history", resource: "users", action: "logs-history", description: "View user logs" },
      { id: "43", name: "users.chat.manage", resource: "users", action: "chat-manage", description: "Chat management" },
      { id: "44", name: "workspace.manage", resource: "workspace", action: "manage", description: "Workspace management" },
      { id: "45", name: "roles.manage", resource: "roles", action: "manage", description: "Role management" },
      { id: "46", name: "quotations.manage", resource: "quotations", action: "manage", description: "Quotation management" },
      { id: "47", name: "invoices.manage", resource: "invoices", action: "manage", description: "Invoice management" },
      { id: "48", name: "payments.manage", resource: "payments", action: "manage", description: "Payment management" }
    ],
    createdAt: new Date().toISOString()
  }
];

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

export default function ComprehensiveRoleManagementPage() {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>(COMPREHENSIVE_MODULES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRoles(MOCK_ROLES);
    setIsLoading(false);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      showError('Role name is required');
      return;
    }

    setIsCreatingRole(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRole: Role = {
      id: Date.now().toString(),
      name: newRoleName,
      description: newRoleDescription,
      isSystem: false,
      isActive: true,
      memberCount: 0,
      abilities: modules.flatMap(m => m.abilities).filter(a => selectedAbilities.includes(a.id)),
      createdAt: new Date().toISOString()
    };

    setRoles(prev => [...prev, newRole]);
    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedAbilities([]);
    success('Role created successfully');
    setIsCreatingRole(false);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setSelectedAbilities(role.abilities.map(a => a.id));
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    success('Role deleted successfully');
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

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Roles</h1>
            <p className="text-gray-600">Define roles and assign permissions to control user access</p>
          </div>
          <Button
            onClick={() => setIsCreatingRole(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter(r => r.isSystem).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter(r => !r.isSystem).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.reduce((sum, r) => sum + r.memberCount, 0)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Role Creation/Editing */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role Creation Form */}
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
                <Button
                  onClick={handleCreateRole}
                  disabled={isCreatingRole || !newRoleName.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isCreatingRole ? (
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
                        module.expanded ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
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
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
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
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
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

        {/* Roles List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Existing Roles</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading roles...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            System
                          </span>
                        )}
                      </div>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: "Edit Role",
                            icon: <Edit className="h-4 w-4" />,
                            onClick: () => handleEditRole(role)
                          },
                          {
                            label: "Delete Role",
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => handleDeleteRole(role.id),
                            className: "text-red-600 hover:text-red-700",
                            disabled: role.isSystem
                          }
                        ]}
                      />
                    </div>

                    {role.description && (
                      <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Members: {role.memberCount}</span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Abilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.abilities.slice(0, 5).map((ability) => (
                            <span
                              key={ability.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                            >
                              {ability.name}
                            </span>
                          ))}
                          {role.abilities.length > 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{role.abilities.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredRoles.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Create your first role to get started'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
