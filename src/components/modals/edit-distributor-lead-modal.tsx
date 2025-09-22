'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  X, 
  MapPin, 
  User, 
  Building, 
  Phone, 
  Mail, 
  FileText,
  Map,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { googleMapsService } from '@/lib/google-maps-service';

interface EditDistributorLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead: any;
}

export function EditDistributorLeadModal({ isOpen, onClose, onSuccess, lead }: EditDistributorLeadModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { success: showSuccess, error: showError } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // File upload refs
  const profileImageRef = useRef<HTMLInputElement>(null);
  const businessLicenseRef = useRef<HTMLInputElement>(null);
  const taxCertificateRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    businessName: '',
    businessType: '',
    businessRegistrationNumber: '',
    yearsInBusiness: '',
    address: '',
    city: '',
    region: '',
    country: 'Ghana',
    latitude: null as number | null,
    longitude: null as number | null,
    experience: '',
    investmentCapacity: '',
    targetMarket: '',
    notes: '',
    profilePicture: null as File | null,
    businessLicense: null as File | null,
    taxCertificate: null as File | null
  });

  // Populate form when lead data changes
  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        dateOfBirth: lead.dateOfBirth || '',
        businessName: lead.businessName || '',
        businessType: lead.businessType || '',
        businessRegistrationNumber: lead.businessRegistrationNumber || '',
        yearsInBusiness: lead.yearsInBusiness || '',
        address: lead.address || '',
        city: lead.city || '',
        region: lead.region || '',
        country: lead.country || 'Ghana',
        latitude: lead.latitude || null,
        longitude: lead.longitude || null,
        experience: lead.experience || '',
        investmentCapacity: lead.investmentCapacity || '',
        targetMarket: lead.targetMarket || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: 'profilePicture' | 'businessLicense' | 'taxCertificate', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        
        // Reverse geocoding to get address
        reverseGeocode(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        showError('Unable to get your current location');
        setLocationLoading(false);
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Initialize Google Maps service
      await googleMapsService.initialize();
      
      // Use Google Maps service for reverse geocoding
      const result = await googleMapsService.reverseGeocode(lat, lng);
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          city: result.city || '',
          region: result.region || '',
          country: result.country || 'Ghana',
          address: result.address || ''
        }));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/drm/distributor-leads/${lead.id}`, {
        method: 'PUT',
        body: formDataToSend, // Use FormData instead of JSON
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update response:', result);
        showSuccess('Distributor lead updated successfully!');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        showError(errorData.error || 'Failed to update distributor lead');
      }
    } catch (error) {
      console.error('Error updating distributor lead:', error);
      showError('Failed to update distributor lead');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Edit Distributor Lead</h2>
            <p className="text-sm text-gray-600">Update distributor information</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Building className="h-5 w-5 mr-2" />
                Business Information
              </h3>
              
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <select
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Business Type</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Limited Liability Company">Limited Liability Company</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Cooperative">Cooperative</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    value={formData.yearsInBusiness}
                    onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
                <Input
                  id="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                />
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                Location Information
              </h3>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">Get Current Location</h4>
                  <p className="text-sm text-gray-600">Use GPS to automatically fill location details</p>
                </div>
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  variant="outline"
                  className="flex items-center"
                >
                  <Map className="h-4 w-4 mr-2" />
                  {locationLoading ? 'Getting Location...' : 'Get Location'}
                </Button>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                <Card className="p-4 bg-green-50 border-green-200 mt-4">
                  <div className="flex items-center text-green-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Location captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </span>
                  </div>
                </Card>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2" />
                Additional Information
              </h3>
              
              <div>
                <Label htmlFor="experience">Previous Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={3}
                  placeholder="Describe your relevant business experience..."
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="investmentCapacity">Investment Capacity</Label>
                <select
                  id="investmentCapacity"
                  value={formData.investmentCapacity}
                  onChange={(e) => handleInputChange('investmentCapacity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Investment Range</option>
                  <option value="Under GHS 10,000">Under GHS 10,000</option>
                  <option value="GHS 10,000 - 50,000">GHS 10,000 - 50,000</option>
                  <option value="GHS 50,000 - 100,000">GHS 50,000 - 100,000</option>
                  <option value="GHS 100,000 - 500,000">GHS 100,000 - 500,000</option>
                  <option value="Over GHS 500,000">Over GHS 500,000</option>
                </select>
              </div>

              <div className="mt-4">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Textarea
                  id="targetMarket"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  rows={3}
                  placeholder="Describe your target market and customer base..."
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Any additional information you'd like to share..."
                />
              </div>

              {/* File Uploads */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Documents & Images</h4>
                
                {/* Profile Picture */}
                <div>
                  <Label>Profile Picture</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    {formData.profilePicture ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={URL.createObjectURL(formData.profilePicture)}
                          alt="Profile preview"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{formData.profilePicture.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.profilePicture.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload('profilePicture', null)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => profileImageRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Profile Picture
                        </Button>
                      </div>
                    )}
                    <input
                      ref={profileImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('profilePicture', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Business License */}
                <div>
                  <Label>Business License</Label>
                  <div className="mt-2">
                    {formData.businessLicense ? (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{formData.businessLicense.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.businessLicense.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload('businessLicense', null)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => businessLicenseRef.current?.click()}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Business License
                      </Button>
                    )}
                    <input
                      ref={businessLicenseRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Tax Certificate */}
                <div>
                  <Label>Tax Certificate</Label>
                  <div className="mt-2">
                    {formData.taxCertificate ? (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{formData.taxCertificate.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.taxCertificate.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload('taxCertificate', null)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => taxCertificateRef.current?.click()}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Tax Certificate
                      </Button>
                    )}
                    <input
                      ref={taxCertificateRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('taxCertificate', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 p-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`bg-${themeClasses.primary} hover:bg-${themeClasses.primaryDark} text-white`}
            >
              {isLoading ? 'Updating...' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
