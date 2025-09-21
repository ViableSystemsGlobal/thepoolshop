import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddLeadUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  leadId: string;
  leadName: string;
}

export default function AddLeadUserModal({
  isOpen,
  onClose,
  onSave,
  leadId,
  leadName
}: AddLeadUserModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    role: 'ASSIGNED',
    notes: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/lead-users?leadId=${leadId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Use availableUsers (users not already assigned to this lead)
        setUsers(Array.isArray(data.availableUsers) ? data.availableUsers : []);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      setUsers([]);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        leadId,
        userId: formData.userId,
        role: formData.role,
        notes: formData.notes
      };

      await onSave(userData);
      onClose();
      
      // Reset form
      setFormData({
        userId: '',
        role: 'ASSIGNED',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Assign User to Lead</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="leadName">Lead</Label>
            <Input
              id="leadName"
              value={leadName}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="userId">User *</Label>
            <select
              id="userId"
              value={formData.userId}
              onChange={(e) => handleChange('userId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user</option>
              {Array.isArray(users) && users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASSIGNED">Assigned</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="SUPPORT">Support</option>
              <option value="SALES">Sales</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this assignment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.userId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Adding...' : 'Assign User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
