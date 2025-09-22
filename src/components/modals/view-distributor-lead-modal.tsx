'use client';

import React from 'react';
import { X, MapPin, Phone, Mail, Building, Calendar, FileText, User, Briefcase, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/theme-context';

interface DistributorLead {
  id: string;
  // API fields
  firstName?: string;
  lastName?: string;
  businessName?: string;
  city?: string;
  region?: string;
  createdAt?: string;
  // Frontend fields (for mock data)
  companyName?: string;
  contactPerson?: string;
  location?: string;
  applicationDate?: string;
  // Common fields
  email: string;
  phone: string;
  businessType: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  notes?: string;
  territory?: string;
  expectedVolume?: number;
  experience?: string;
  profileImage?: string;
}

interface ViewDistributorLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: DistributorLead | null;
}

const ViewDistributorLeadModal: React.FC<ViewDistributorLeadModalProps> = ({
  isOpen,
  onClose,
  lead
}) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  if (!isOpen || !lead) return null;

  // Get display values with fallbacks
  const companyName = lead.companyName || lead.businessName || 'N/A';
  const contactPerson = lead.contactPerson || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'N/A';
  const location = lead.location || `${lead.city || ''}, ${lead.region || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A';
  const applicationDate = lead.applicationDate || lead.createdAt || new Date().toISOString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'UNDER_REVIEW': return <FileText className="w-4 h-4" />;
      case 'APPROVED': return <Target className="w-4 h-4" />;
      case 'REJECTED': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${themeClasses.primary} text-white p-6 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {lead.profileImage ? (
                <img
                  src={lead.profileImage}
                  alt={contactPerson}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{companyName}</h2>
                <p className="text-white text-opacity-90">{contactPerson}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`${getStatusColor(lead.status)} flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium`}>
                {getStatusIcon(lead.status)}
                <span>{lead.status.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Applied: {new Date(applicationDate).toLocaleDateString()}
            </div>
          </div>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Application Date</p>
                  <p className="font-medium">{new Date(applicationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Business Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Business Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium">{lead.businessType}</p>
                </div>
              </div>
              {lead.territory && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Territory</p>
                    <p className="font-medium">{lead.territory}</p>
                  </div>
                </div>
              )}
              {lead.expectedVolume && (
                <div className="flex items-center space-x-3">
                  <Target className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Expected Volume</p>
                    <p className="font-medium">{lead.expectedVolume.toLocaleString()} units/month</p>
                  </div>
                </div>
              )}
              {lead.experience && (
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{lead.experience}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Notes</span>
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </Card>
          )}

          {/* Profile Image */}
          {lead.profileImage && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Image</span>
              </h3>
              <div className="flex justify-center">
                <img
                  src={lead.profileImage}
                  alt={contactPerson}
                  className="w-32 h-32 rounded-lg object-cover shadow-md"
                />
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewDistributorLeadModal;
