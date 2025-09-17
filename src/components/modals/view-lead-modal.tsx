'use client';

import { X, Mail, Phone, Building, MapPin, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  score: number;
  notes?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface ViewLeadModalProps {
  lead: Lead;
  onClose: () => void;
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  CONVERTED: 'bg-purple-100 text-purple-800',
  LOST: 'bg-red-100 text-red-800',
};

export function ViewLeadModal({ lead, onClose }: ViewLeadModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Lead Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {lead.firstName} {lead.lastName}
              </h3>
              <p className="text-gray-600">{lead.company || 'No company'}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
                {lead.status}
              </span>
              <div className="mt-2">
                <div className="text-sm text-gray-500">Lead Score</div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${lead.score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{lead.score}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Contact Information</h4>
              
              {lead.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {lead.company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Company</div>
                    <div className="font-medium">{lead.company}</div>
                  </div>
                </div>
              )}

              {lead.source && (
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Source</div>
                    <div className="font-medium">{lead.source}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Lead Information</h4>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">
                    {new Date(lead.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Owner</div>
                  <div className="font-medium">{lead.owner.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Convert to Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
