'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export default function SuppliersPage() {
  const { status } = useSession();
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({ name: '', status: 'ACTIVE' });
  const [editing, setEditing] = useState<Supplier | null>(null);

  // Populate form when editing changes
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        email: editing.email || '',
        phone: editing.phone || '',
        status: editing.status || 'ACTIVE'
      });
    } else {
      setForm({ name: '', status: 'ACTIVE' });
    }
  }, [editing]);

  useEffect(() => {
    if (status === 'unauthenticated') return;
    load();
  }, [status]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!form.name) return;
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/suppliers/${editing.id}` : '/api/suppliers';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      success(editing ? 'Supplier updated' : 'Supplier created');
      setShowAdd(false);
      setEditing(null);
      setForm({ name: '', status: 'ACTIVE' });
      load();
    } else {
      error('Failed to save supplier');
    }
  };

  const remove = async (s: Supplier) => {
    const res = await fetch(`/api/suppliers/${s.id}`, { method: 'DELETE' });
    if (res.ok) { success('Supplier deleted'); load(); } else { error('Failed to delete'); }
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${theme.primaryBg}`}>
            <Users className={`h-5 w-5 text-${theme.primary}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <p className="text-gray-600">Manage inventory suppliers</p>
          </div>
        </div>
        <Button 
          className="text-white hover:opacity-90 transition-opacity" 
          style={{ backgroundColor: getThemeColor() }}
          onClick={() => { setShowAdd(true); setEditing(null); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Supplier
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <SkeletonTable rows={8} columns={4} />
        ) : (
          <DataTable
            data={filtered}
            itemsPerPage={10}
            onRowClick={(s) => {
              setEditing(s as Supplier);
              setShowAdd(true);
            }}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'contact', label: 'Contact', render: (s: any) => (
                <div className="text-sm">
                  {s.email && <div>{s.email}</div>}
                  {s.phone && <div className="text-gray-500">{s.phone}</div>}
                </div>
              )},
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions', render: (s: any) => (
                <div className="flex gap-2" data-stop-row-click>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditing(s); setShowAdd(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); remove(s); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )},
            ]}
          />
        )}
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <div className="space-y-3">
              <Input placeholder="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <select className="w-full px-3 py-2 border rounded" value={(form.status as any) || 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
              <Button 
                className="text-white hover:opacity-90 transition-opacity" 
                style={{ backgroundColor: getThemeColor() }}
                onClick={submit}
              >
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


