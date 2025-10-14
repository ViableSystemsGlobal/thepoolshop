'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';

interface Account {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'PROJECT';
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

interface EditAccountModalProps {
  account: Account;
  onClose: () => void;
  onSave: (accountData: {
    name: string;
    type: string;
    email?: string;
    phone?: string;
    website?: string;
    notes?: string;
  }) => void;
}

export function EditAccountModal({ account, onClose, onSave }: EditAccountModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [formData, setFormData] = useState({
    name: '',
    type: 'INDIVIDUAL',
    email: '',
    phone: '',
    website: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: account.name,
      type: account.type,
      email: account.email || '',
      phone: account.phone || '',
      website: account.website || '',
      notes: account.notes || '',
    });
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Account</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Account Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="COMPANY">Company</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>


          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes about this account..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {loading ? 'Saving...' : 'Update Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
