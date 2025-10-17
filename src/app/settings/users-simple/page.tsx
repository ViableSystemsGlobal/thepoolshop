"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Settings
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import AddUserModal from "@/components/modals/add-user-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  emailVerified?: string;
  phoneVerified?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  roleAbilities: Array<{
    ability: {
      id: string;
      name: string;
      resource: string;
      action: string;
      description?: string;
    };
  }>;
  _count: {
    userRoles: number;
  };
}

export default function SimpleUserManagementPage() {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles')
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('User deleted successfully');
        loadData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      showError('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !user.isActive
        }),
      });

      if (response.ok) {
        success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
        loadData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update user status');
      }
    } catch (error) {
      showError('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleBulkActivate = async () => {
    try {
      const response = await fetch('/api/users/bulk-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedUsers }),
      });

      if (response.ok) {
        success(`Activated ${selectedUsers.length} users`);
        setSelectedUsers([]);
        loadData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to activate users');
      }
    } catch (error) {
      showError('Failed to activate users');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const response = await fetch('/api/users/bulk-deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedUsers }),
      });

      if (response.ok) {
        success(`Deactivated ${selectedUsers.length} users`);
        setSelectedUsers([]);
        loadData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to deactivate users');
      }
    } catch (error) {
      showError('Failed to deactivate users');
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrator',
      'SALES_MANAGER': 'Sales Manager',
      'SALES_REP': 'Sales Representative',
      'INVENTORY_MANAGER': 'Inventory Manager',
      'FINANCE_OFFICER': 'Finance Officer',
      'EXECUTIVE_VIEWER': 'Executive Viewer'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'ADMIN': 'bg-red-100 text-red-800',
      'SALES_MANAGER': 'bg-blue-100 text-blue-800',
      'SALES_REP': 'bg-green-100 text-green-800',
      'INVENTORY_MANAGER': 'bg-purple-100 text-purple-800',
      'FINANCE_OFFICER': 'bg-yellow-100 text-yellow-800',
      'EXECUTIVE_VIEWER': 'bg-gray-100 text-gray-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage team members and their access</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleAddUser}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                Available roles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={handleBulkActivate}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkDeactivate}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Deactivate
                  </Button>
                </div>
              )}
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {user.name || 'No name'}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                                {getRoleDisplayName(user.role)}
                              </span>
                              {!user.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              {user.lastLoginAt && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "Edit User",
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => handleEditUser(user)
                        },
                        {
                          label: user.isActive ? "Deactivate" : "Activate",
                          icon: user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
                          onClick: () => handleToggleUserStatus(user)
                        },
                        {
                          label: "Delete User",
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handleDeleteUser(user.id),
                          className: "text-red-600 hover:text-red-700"
                        }
                      ]}
                    />
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first user'}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={handleAddUser}
                        className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadData}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadData}
          user={selectedUser}
        />
      </div>
    </>
  );
}
