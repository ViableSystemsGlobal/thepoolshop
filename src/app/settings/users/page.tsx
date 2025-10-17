"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  Key,
  ArrowRight,
  Check,
  User,
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Grid,
  List
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import AddUserModal from "@/components/modals/add-user-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { UserDetailsModal } from "@/components/modals/user-details-modal";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { useAsyncConfirmation } from "@/hooks/use-async-confirmation";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

// Mock data for users - only the admin user
const MOCK_USERS: User[] = [
  {
    id: "cmfi6s8um00008o6nh4kryxph",
    name: "Admin User",
    email: "admin@adpools.com",
    phone: "+233 30 123 4567",
    role: "Super Admin",
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: "2024-01-01T00:00:00Z"
  }
];

export default function UserManagementPage() {
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const deleteConfirmation = useAsyncConfirmation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load users from API
      const usersResponse = await fetch('/api/users/public');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      } else {
        console.error('Failed to fetch users');
        setUsers(MOCK_USERS); // Fallback to mock data
      }
      
      // Load roles from API
      const rolesResponse = await fetch('/api/roles/public');
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles || []);
      } else {
        console.error('Failed to fetch roles');
        setRoles([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setUsers(MOCK_USERS); // Fallback to mock data
      setRoles([]);
    }
    setIsLoading(false);
  };


  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    deleteConfirmation.confirm(
      {
        title: 'Delete User',
        message: `Are you sure you want to delete "${user.name || 'this user'}"? This action cannot be undone and will permanently remove the user and ALL their associated data (tasks, accounts, leads, messages, etc.) from the system.\n\nTo confirm, type "DELETE PERMANENTLY" below:`,
        confirmText: 'Delete User & All Data',
        cancelText: 'Cancel',
        type: 'danger',
        requireConfirmationText: 'DELETE PERMANENTLY'
      },
      async () => {
        // Use the user parameter directly instead of userToDelete state
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(prev => prev.filter(u => u.id !== user.id));
          success('User deleted successfully');
          await loadData(); // Reload to update metrics
          setUserToDelete(null);
        } else {
          console.error('User deletion response status:', response.status);
          console.error('User deletion response headers:', Object.fromEntries(response.headers.entries()));
          
          let error;
          try {
            const responseText = await response.text();
            console.error('Raw response text:', responseText);
            
            if (responseText.trim()) {
              error = JSON.parse(responseText);
            } else {
              error = { error: 'Empty response from server' };
            }
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            error = { error: 'Invalid response from server' };
          }
          
          console.error('Parsed error object:', error);
          
          // Show detailed error message
          let errorMessage = error.error || 'Failed to delete user';
          if (error.details) {
            if (typeof error.details === 'string') {
              errorMessage += `: ${error.details}`;
            } else if (error.details.totalRelations > 0) {
              errorMessage += `. User has ${error.details.totalRelations} associated records.`;
            }
          }
          
          showError(errorMessage);
          // Close the modal even on error
          setUserToDelete(null);
        }
      }
    );
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setShowChangePasswordModal(true);
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(u => u.id === user.id ? data.user : u));
        success(data.message);
        await loadData(); // Reload to update metrics
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showError('Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Map role name back to enum value
      const roleMapping: { [key: string]: string } = {
        'Super Admin': 'ADMIN',
        'Sales Manager': 'SALES_MANAGER',
        'Sales Rep': 'SALES_REP',
        'Inventory Manager': 'INVENTORY_MANAGER',
        'Finance Officer': 'FINANCE_OFFICER',
        'Executive Viewer': 'EXECUTIVE_VIEWER'
      };
      
      const mappedUserData = {
        ...userData,
        role: userData.role ? roleMapping[userData.role] || userData.role : undefined
      };
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedUserData),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data.user } : u));
        success('User updated successfully');
        setShowEditUserModal(false);
        await loadData(); // Reload to update metrics
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeUserPassword = async (userId: string, newPassword: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        success('Password changed successfully');
        setShowChangePasswordModal(false);
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (newUser: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Create user in database
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          role: newUser.role,
          isActive: newUser.isActive ?? true,
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        
        // Ensure created user has all required fields
        const safeUser = {
          ...createdUser,
          name: createdUser.name || '',
          email: createdUser.email || '',
          phone: createdUser.phone || '',
          role: createdUser.role || 'SALES_REP',
          isActive: createdUser.isActive ?? true
        };
        
        // Add to local state
        setUsers(prev => [safeUser, ...prev]);
        success('User created successfully');
        setShowAddUserModal(false);
        
        // Reload data to get updated metrics
        await loadData();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  // Map enum roles to display names
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

  const getRoleColor = (role: string) => {
    if (role === "Super Admin") return `bg-red-100 text-red-800`;
    if (role === "Administrator") return `bg-purple-100 text-purple-800`;
    if (role === "Staff") return `bg-${theme.primary} text-white`;
    return `bg-gray-100 text-gray-800`;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredUsers = users.filter(user => {
    // Safely handle undefined/null values
    const userName = user.name || '';
    const userEmail = user.email || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || getRoleDisplayName(user.role) === roleFilter;
    const matchesName = !nameFilter || userName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesEmail = !emailFilter || userEmail.toLowerCase().includes(emailFilter.toLowerCase());
    
    return matchesSearch && matchesRole && matchesName && matchesEmail;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Dashboard &gt; Users</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAddUserModal(true)}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === "Staff").length}</div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  placeholder="Enter Name"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  placeholder="Enter Email"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="flex items-center space-x-2"
                >
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  <span>{viewMode === "grid" ? "List View" : "Grid View"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Add New User Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-gray-300 hover:border-gray-400"
              onClick={() => setShowAddUserModal(true)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className={`w-16 h-16 rounded-full bg-${theme.primary} flex items-center justify-center mb-4`}>
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">New User</h3>
                <p className="text-sm text-gray-600">Click here to Create New User</p>
              </CardContent>
            </Card>

            {/* User Cards */}
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {getInitials(user.name || '')}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {user.name || 'Unnamed User'}
                      </h3>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                    items={[
                      {
                        label: "Edit User",
                        icon: <Edit className="h-4 w-4" />,
                        onClick: () => handleEditUser(user)
                      },
                      {
                        label: "Change Password",
                        icon: <Key className="h-4 w-4" />,
                        onClick: () => handleChangePassword(user)
                      },
                      {
                        label: "View Details",
                        icon: <ArrowRight className="h-4 w-4" />,
                        onClick: () => handleViewUser(user)
                      },
                      {
                        label: "Delete User",
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => handleDeleteUser(user),
                        className: "text-red-600 hover:text-red-700"
                      }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{user.phone || "No phone"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(getRoleDisplayName(user.role))}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="h-3 w-3 text-gray-500 cursor-pointer hover:text-gray-700"
                        title="Edit user"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="h-3 w-3 text-gray-500 cursor-pointer hover:text-red-600"
                        title="Delete user"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleChangePassword(user)}
                        className="h-3 w-3 text-gray-500 cursor-pointer hover:text-gray-700"
                        title="Change password"
                      >
                        <Key className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`h-3 w-3 cursor-pointer ${
                          user.isActive 
                            ? 'text-green-500 hover:text-green-600' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={user.isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleViewUser(user)}
                        className="h-3 w-3 text-gray-500 cursor-pointer hover:text-gray-700"
                        title="View user details"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {/* Add New User Button */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-gray-300 hover:border-gray-400"
              onClick={() => setShowAddUserModal(true)}
            >
              <CardContent className="flex items-center justify-center p-6">
                <div className={`w-12 h-12 rounded-full bg-${theme.primary} flex items-center justify-center mr-4`}>
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                  <p className="text-sm text-gray-600">Click here to create a new user</p>
                </div>
              </CardContent>
            </Card>

            {/* User List */}
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {getInitials(user.name || '')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{user.name || 'Unnamed User'}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(getRoleDisplayName(user.role))}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {user.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {user.isActive ? (
                              <span className="text-green-600 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "View Details",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => handleViewUser(user)
                        },
                        {
                          label: "Edit User",
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => handleEditUser(user)
                        },
                        {
                          label: "Change Password",
                          icon: <Key className="h-4 w-4" />,
                          onClick: () => handleChangePassword(user)
                        },
                        {
                          label: user.isActive ? "Deactivate" : "Activate",
                          icon: user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
                          onClick: () => handleToggleUserStatus(user)
                        },
                        {
                          label: "Delete User",
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handleDeleteUser(user),
                          className: "text-red-600 hover:text-red-700"
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add User Modal */}
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onAddUser={handleAddUser}
          roles={roles}
        />

        {/* Edit User Modal */}
        <EditUserModal
          isOpen={showEditUserModal}
          onClose={() => setShowEditUserModal(false)}
          onUpdateUser={handleUpdateUser}
          user={selectedUser}
          roles={roles}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onChangePassword={handleChangeUserPassword}
          user={selectedUser}
        />

        {/* User Details Modal */}
        <UserDetailsModal
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          user={selectedUser}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => {
            deleteConfirmation.close();
            setUserToDelete(null);
          }}
          onConfirm={deleteConfirmation.handleConfirm}
          title={deleteConfirmation.options?.title || ''}
          message={deleteConfirmation.options?.message || ''}
          confirmText={deleteConfirmation.options?.confirmText}
          cancelText={deleteConfirmation.options?.cancelText}
          type={deleteConfirmation.options?.type}
          isLoading={deleteConfirmation.isLoading}
          requireConfirmationText={deleteConfirmation.options?.requireConfirmationText}
          confirmationText={deleteConfirmation.confirmationText}
          onConfirmationTextChange={deleteConfirmation.updateConfirmationText}
        />
      </div>
    </>
  );
}