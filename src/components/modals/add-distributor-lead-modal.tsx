'use client';

import { useState, useRef, useEffect } from 'react';
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
  Camera, 
  User, 
  Building, 
  Phone, 
  Mail, 
  FileText,
  Upload,
  Map
} from 'lucide-react';
import { googleMapsService } from '@/lib/google-maps-service';
import { MultiSelect } from '@/components/ui/multi-select';

interface AddDistributorLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DistributorLeadData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Business Information
  businessName: string;
  businessType: string;
  businessRegistrationNumber: string;
  yearsInBusiness: string;
  
  // Location Information
  address: string;
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  
  // Additional Information
  experience: string;
  investmentCapacity: string;
  targetMarket: string;
  territory: string;
      salesVolume: string;
  interestedProducts: string[];
  notes: string;
  
  // Documents
  profilePicture: File | null;
  businessLicense: File | null;
  taxCertificate: File | null;
  businessPremises: File | null;
  idDocument: File | null;
  bankStatement: File | null;
  referenceLetter: File | null;
  otherDocument: File | null;
}

export function AddDistributorLeadModal({ isOpen, onClose, onSuccess }: AddDistributorLeadModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { success: showSuccess, error: showError } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [locationLoading, setLocationLoading] = useState(false);
  const [products, setProducts] = useState<Array<{id: string, name: string}>>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const businessLicenseRef = useRef<HTMLInputElement>(null);
  const taxCertificateRef = useRef<HTMLInputElement>(null);

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch('/api/products?limit=1000', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products?.map((product: any) => ({
          id: product.id,
          name: product.name
        })) || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };
  
  const [formData, setFormData] = useState<DistributorLeadData>({
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
    latitude: null,
    longitude: null,
    experience: '',
    investmentCapacity: '',
    targetMarket: '',
    territory: '',
      salesVolume: '',
    interestedProducts: [],
    notes: '',
    profilePicture: null,
    businessLicense: null,
    taxCertificate: null,
    businessPremises: null,
    idDocument: null,
    bankStatement: null,
    referenceLetter: null,
    otherDocument: null,
  });

  const handleInputChange = (field: keyof DistributorLeadData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: 'profilePicture' | 'businessLicense' | 'taxCertificate' | 'businessPremises' | 'idDocument' | 'bankStatement' | 'referenceLetter' | 'otherDocument', file: File | null) => {
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
    
    // Only allow submission on the final step
    if (currentStep !== 4) {
      return;
    }
    
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (key === 'interestedProducts' && Array.isArray(value)) {
            // Handle interested products array
            value.forEach(productId => {
              formDataToSend.append('interestedProducts', productId);
            });
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      console.log('Submitting distributor lead application:', {
        currentStep,
        formData: Object.fromEntries(formDataToSend.entries())
      });

      console.log('Submitting form data:', formDataToSend);
      const response = await fetch('/api/drm/distributor-leads', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        showSuccess('Distributor lead application submitted successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
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
          latitude: null,
          longitude: null,
          experience: '',
          investmentCapacity: '',
          targetMarket: '',
          territory: '',
          salesVolume: '',
          interestedProducts: [],
          notes: '',
          profilePicture: null,
          businessLicense: null,
          taxCertificate: null,
          businessPremises: null,
          idDocument: null,
          bankStatement: null,
          referenceLetter: null,
          otherDocument: null,
        });
        setCurrentStep(1);
      } else {
        let errorMessage = 'Failed to submit application';
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
          
          // Handle specific error cases
          if (errorData.error && errorData.error.includes('Unique constraint')) {
            errorMessage = 'An application with this email already exists. Please use a different email address.';
          } else if (errorData.error && errorData.error.includes('email')) {
            errorMessage = 'This email address is already registered. Please use a different email.';
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showError('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">New Distributor Application</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
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

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep
                    ? `bg-${themeClasses.primary}`
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <Label>Profile Picture</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('profilePicture', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {formData.profilePicture ? formData.profilePicture.name : 'Upload Profile Picture'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
                  <Input
                    id="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                  />
                </div>

                {/* Document Uploads for Review & Approval */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Required Documents for Review</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload clear images of all required documents for faster approval</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business License */}
                    <div>
                      <input
                        ref={businessLicenseRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => businessLicenseRef.current?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">
                          {formData.businessLicense ? formData.businessLicense.name : 'Business License'}
                        </span>
                      </Button>
                    </div>

                    {/* Tax Certificate */}
                    <div>
                      <input
                        ref={taxCertificateRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('taxCertificate', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => taxCertificateRef.current?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">
                          {formData.taxCertificate ? formData.taxCertificate.name : 'Tax Certificate'}
                        </span>
                      </Button>
                    </div>

                    {/* Business Premises */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('businessPremises', e.target.files?.[0] || null)}
                        className="hidden"
                        id="businessPremises"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('businessPremises')?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <Camera className="h-5 w-5 mb-1" />
                        <span className="text-xs">
                          {formData.businessPremises ? formData.businessPremises.name : 'Business Premises'}
                        </span>
                      </Button>
                    </div>

                    {/* ID Document */}
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('idDocument', e.target.files?.[0] || null)}
                        className="hidden"
                        id="idDocument"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('idDocument')?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">
                          {formData.idDocument ? formData.idDocument.name : 'ID Document'}
                        </span>
                      </Button>
                    </div>

                    {/* Bank Statement */}
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('bankStatement', e.target.files?.[0] || null)}
                        className="hidden"
                        id="bankStatement"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('bankStatement')?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">
                          {formData.bankStatement ? formData.bankStatement.name : 'Bank Statement'}
                        </span>
                      </Button>
                    </div>

                    {/* Reference Letter */}
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('referenceLetter', e.target.files?.[0] || null)}
                        className="hidden"
                        id="referenceLetter"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('referenceLetter')?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">
                          {formData.referenceLetter ? formData.referenceLetter.name : 'Reference Letter'}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Other Documents */}
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('otherDocument', e.target.files?.[0] || null)}
                      className="hidden"
                      id="otherDocument"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('otherDocument')?.click()}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {formData.otherDocument ? formData.otherDocument.name : 'Upload Other Documents (Optional)'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </h3>
                
                <div className="flex items-center justify-between">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center text-green-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Location captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </span>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center">
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

                <div>
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

                <div>
                  <Label htmlFor="targetMarket">Target Market</Label>
                  <Textarea
                    id="targetMarket"
                    value={formData.targetMarket}
                    onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                    rows={3}
                    placeholder="Describe your target market and customer base..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="territory">Territory</Label>
                    <Input
                      id="territory"
                      value={formData.territory}
                      onChange={(e) => handleInputChange('territory', e.target.value)}
                      placeholder="e.g., Greater Accra, Ashanti Region"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesVolume">Sales Volume (Monthly)</Label>
                    <Input
                      id="salesVolume"
                      type="number"
                      value={formData.salesVolume}
                      onChange={(e) => handleInputChange('salesVolume', e.target.value)}
                      placeholder="Expected sales in GHS per month"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="interestedProducts">Interested Products</Label>
                  <MultiSelect
                    options={products}
                    selected={products.filter(p => formData.interestedProducts.includes(p.id))}
                    onChange={(selected) => {
                      setFormData(prev => ({
                        ...prev,
                        interestedProducts: selected.map(p => p.id)
                      }));
                    }}
                    placeholder={productsLoading ? "Loading products..." : "Search and select products..."}
                    label="Select products you're interested in distributing"
                    disabled={productsLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
              >
                Cancel
              </Button>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className={`bg-${themeClasses.primary} hover:bg-${themeClasses.primaryDark} text-white`}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-${themeClasses.primary} hover:bg-${themeClasses.primaryDark} text-white`}
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
