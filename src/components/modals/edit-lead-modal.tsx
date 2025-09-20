'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { SourceSelect } from '@/components/ui/source-select';
import { useTheme } from '@/contexts/theme-context';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  leadType: 'INDIVIDUAL' | 'COMPANY';
  company?: string;
  subject?: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  assignedTo?: User[];
  interestedProducts?: Product[];
  followUpDate?: string;
  notes?: string;
}

interface EditLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (leadData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    leadType: 'INDIVIDUAL' | 'COMPANY';
    company?: string;
    subject?: string;
    source?: string;
    status: string;
    assignedTo?: User[];
    interestedProducts?: Product[];
    followUpDate?: string;
    notes?: string;
  }) => void;
}

export function EditLeadModal({ lead, onClose, onSave }: EditLeadModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    leadType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'COMPANY',
    company: '',
    subject: '',
    source: '',
    status: 'NEW',
    assignedTo: [] as User[],
    interestedProducts: [] as Product[],
    followUpDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users?limit=100', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch products for products dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=100', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email || '',
      phone: lead.phone || '',
      leadType: lead.leadType || 'INDIVIDUAL',
      company: lead.company || '',
      subject: lead.subject || '',
      source: lead.source || '',
      status: lead.status,
      assignedTo: lead.assignedTo || [],
      interestedProducts: lead.interestedProducts || [],
      followUpDate: lead.followUpDate || '',
      notes: lead.notes || '',
    });
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Lead</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadType">Lead Type *</Label>
              <select
                id="leadType"
                value={formData.leadType}
                onChange={(e) => {
                  const newType = e.target.value as 'INDIVIDUAL' | 'COMPANY';
                  setFormData(prev => ({ 
                    ...prev, 
                    leadType: newType,
                    company: newType === 'INDIVIDUAL' ? '' : prev.company
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>
            {formData.leadType === 'COMPANY' && (
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Enter company name"
                  required={formData.leadType === 'COMPANY'}
                />
              </div>
            )}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g., Product Inquiry, Service Request"
              />
            </div>
            <div>
              {/* Empty div to maintain grid layout */}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SourceSelect
                label="Source"
                value={formData.source}
                onChange={(value) => handleChange('source', value)}
                placeholder="Select or create source"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <MultiSelect
                label="Assigned To"
                options={users as any}
                selected={formData.assignedTo as any}
                onChange={(selected) => setFormData(prev => ({ ...prev, assignedTo: selected as any }))}
                placeholder="Select Users"
                disabled={loadingUsers}
              />
            </div>
            <div>
              <MultiSelect
                label="Interested Products"
                options={products as any}
                selected={formData.interestedProducts as any}
                onChange={(selected) => setFormData(prev => ({ ...prev, interestedProducts: selected as any }))}
                placeholder="Select Products"
                disabled={loadingProducts}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="followUpDate">Follow-up Date</Label>
            <Input
              id="followUpDate"
              type="datetime-local"
              value={formData.followUpDate}
              onChange={(e) => handleChange('followUpDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes about this lead..."
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
              {loading ? 'Saving...' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
