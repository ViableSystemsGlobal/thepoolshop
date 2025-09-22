'use client';

import { X, Mail, Phone, Building, MapPin, Calendar, User, Users, TrendingUp, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Account {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'PROJECT';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    position?: string;
  }>;
  opportunities: Array<{
    id: string;
    name: string;
    stage: string;
    value?: number;
    closeDate?: string;
  }>;
  quotations: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  proformas: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

interface ViewAccountModalProps {
  account: Account;
  onClose: () => void;
}

const typeColors = {
  INDIVIDUAL: 'bg-blue-100 text-blue-800',
  COMPANY: 'bg-green-100 text-green-800',
  PROJECT: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-yellow-100 text-yellow-800',
};

export function ViewAccountModal({ account, onClose }: ViewAccountModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{account.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[account.type]}`}>
                  {account.type}
                </span>
                {account.website && (
                  <a 
                    href={account.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {account.website}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Created</div>
              <div className="font-medium">
                {new Date(account.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{account.contacts?.length || 0}</div>
              <div className="text-sm text-gray-500">Contacts</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{account.opportunities?.length || 0}</div>
              <div className="text-sm text-gray-500">Opportunities</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{account.quotations?.length || 0}</div>
              <div className="text-sm text-gray-500">Quotations</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Receipt className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{account.proformas?.length || 0}</div>
              <div className="text-sm text-gray-500">Proformas</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Contact Information</h4>
              
              {account.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href={`mailto:${account.email}`} className="text-blue-600 hover:underline">
                      {account.email}
                    </a>
                  </div>
                </div>
              )}

              {account.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <a href={`tel:${account.phone}`} className="text-blue-600 hover:underline">
                      {account.phone}
                    </a>
                  </div>
                </div>
              )}

              {(account.address || account.city || account.country) && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="text-sm">
                      {account.address && <div>{account.address}</div>}
                      {account.city && <div>{account.city}</div>}
                      {account.state && <div>{account.state}</div>}
                      {account.country && <div>{account.country}</div>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Owner</div>
                  <div className="font-medium">{account.owner.name}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Recent Quotations</h4>
              {account.quotations?.length > 0 ? (
                <div className="space-y-2">
                  {account.quotations.slice(0, 3).map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{quotation.number}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(quotation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${quotation.total.toFixed(2)}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[quotation.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {quotation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No quotations yet</div>
              )}
            </div>
          </div>

          {/* Contacts */}
          {account.contacts?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contacts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {account.contacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                    {contact.position && <div className="text-sm text-gray-500">{contact.position}</div>}
                    {contact.email && <div className="text-sm text-blue-600">{contact.email}</div>}
                    {contact.phone && <div className="text-sm text-gray-500">{contact.phone}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {account.notes && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{account.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Create Quotation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
