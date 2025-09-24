'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { GoogleMapsService } from '@/lib/google-maps-service';
import { 
  Building2, 
  User, 
  MapPin, 
  FileText,
  X
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Distributor {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: string;
  businessRegistrationNumber?: string;
  yearsInBusiness?: number;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  territory?: string;
  expectedVolume?: number;
  experience?: string;
  investmentCapacity?: string;
  targetMarket?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  interestedProducts?: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
    interestLevel: string;
    quantity: number;
  }>;
}

interface EditDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  distributor: Distributor | null;
}

export default function EditDistributorModal({ isOpen, onClose, onSuccess, distributor }: EditDistributorModalProps) {
  const { success, error: toastError } = useToast();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessRegistrationNumber: '',
    yearsInBusiness: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    country: 'Ghana',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    
    // Business Details
    territory: '',
    expectedVolume: '',
    experience: '',
    investmentCapacity: '',
    targetMarket: '',
    notes: '',
    
    // Products
    interestedProducts: [] as string[],
    
    // Status
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load products and populate form when modal opens
  useEffect(() => {
    if (isOpen && distributor) {
      loadProducts();
      populateForm();
    }
  }, [isOpen, distributor]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch('/api/products', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toastError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Maps service for reverse geocoding
          const googleMapsService = new GoogleMapsService();
          const result = await googleMapsService.reverseGeocode(latitude, longitude);
          
          if (result) {
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude,
              address: result.address || '',
              city: result.city || '',
              region: result.region || '',
              country: result.country || 'Ghana'
            }));
            
            success('Location captured and address filled automatically!');
          } else {
            // Fallback: just set coordinates
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude
            }));
            success('Location captured successfully!');
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Fallback: just set coordinates
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          success('Location captured successfully!');
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        toastError('Failed to get current location. Please enter manually.');
      }
    );
  };

  const populateForm = () => {
    if (!distributor) return;

    setFormData({
      firstName: distributor.firstName || '',
      lastName: distributor.lastName || '',
      dateOfBirth: distributor.dateOfBirth ? new Date(distributor.dateOfBirth).toISOString().split('T')[0] : '',
      businessName: distributor.businessName || '',
      businessType: distributor.businessType || '',
      businessRegistrationNumber: distributor.businessRegistrationNumber || '',
      yearsInBusiness: distributor.yearsInBusiness?.toString() || '',
      email: distributor.email || '',
      phone: distributor.phone || '',
      address: distributor.address || '',
      city: distributor.city || '',
      region: distributor.region || '',
      country: distributor.country || 'Ghana',
      postalCode: distributor.postalCode || '',
      territory: distributor.territory || '',
      expectedVolume: distributor.expectedVolume?.toString() || '',
      experience: distributor.experience || '',
      investmentCapacity: distributor.investmentCapacity || '',
      targetMarket: distributor.targetMarket || '',
      notes: distributor.notes || '',
      interestedProducts: distributor.interestedProducts?.map(ip => ({
        id: ip.product.id,
        name: ip.product.name
      })) || [],
      status: distributor.status || 'ACTIVE'
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessType.trim()) newErrors.businessType = 'Business type is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.region.trim()) newErrors.region = 'Region is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (step === 3) {
      if (!formData.territory.trim()) newErrors.territory = 'Territory is required';
      if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
      if (!formData.investmentCapacity.trim()) newErrors.investmentCapacity = 'Investment capacity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !distributor) return;

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        expectedVolume: formData.expectedVolume ? parseFloat(formData.expectedVolume) : null,
        yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null,
        interestedProducts: formData.interestedProducts ? formData.interestedProducts.map((product: any) => product.id) : []
      };

      const response = await fetch(`/api/drm/distributors/${distributor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });

      if (response.ok) {
        success('Distributor updated successfully!');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Failed to update distributor');
      }
    } catch (error) {
      console.error('Error updating distributor:', error);
      toastError('An error occurred while updating the distributor');
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Limited Liability Company',
    'Corporation',
    'Cooperative',
    'Other'
  ];

  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Volta',
    'Eastern',
    'Northern',
    'Upper East',
    'Upper West',
    'Brong-Ahafo',
    'Western North',
    'Ahafo',
    'Bono',
    'Bono East',
    'Oti',
    'Savannah',
    'North East'
  ];

  const experienceLevels = [
    'Beginner (0-2 years)',
    'Intermediate (3-5 years)',
    'Experienced (6-10 years)',
    'Expert (10+ years)'
  ];

  const investmentRanges = [
    'GHS 1,000 - 5,000',
    'GHS 5,000 - 10,000',
    'GHS 10,000 - 25,000',
    'GHS 25,000 - 50,000',
    'GHS 50,000 - 100,000',
    'GHS 100,000+'
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  if (!distributor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Distributor</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? `bg-${themeClasses.primary} text-white` 
                  : 'bg-gray-200 text-gray-600'
              }`} style={step <= currentStep ? {
                backgroundColor: themeClasses.primary,
                color: 'white'
              } : {}}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? `bg-${themeClasses.primary}` : 'bg-gray-200'
                }`} style={step < currentStep ? {
                  backgroundColor: themeClasses.primary
                } : {}} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal & Business Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Personal & Business Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
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

              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={errors.businessName ? 'border-red-500' : ''}
                />
                {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => handleInputChange('businessType', value)}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
              </div>

              <div>
                <Label htmlFor="businessRegistrationNumber">Registration Number</Label>
                <Input
                  id="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  min="0"
                  value={formData.yearsInBusiness}
                  onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Location Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`${errors.address ? 'border-red-500' : ''} flex-1`}
                    rows={3}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="self-start"
                  >
                    {locationLoading ? 'Getting...' : 'Get Location'}
                  </Button>
                </div>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                {formData.latitude && formData.longitude && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ Location captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="region">Region *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => handleInputChange('region', value)}
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </Select>
                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Business Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Business Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="territory">Territory *</Label>
                <Input
                  id="territory"
                  value={formData.territory}
                  onChange={(e) => handleInputChange('territory', e.target.value)}
                  className={errors.territory ? 'border-red-500' : ''}
                />
                {errors.territory && <p className="text-red-500 text-sm mt-1">{errors.territory}</p>}
              </div>

              <div>
                <Label htmlFor="expectedVolume">Expected Monthly Volume (GHS)</Label>
                <Input
                  id="expectedVolume"
                  type="number"
                  min="0"
                  value={formData.expectedVolume}
                  onChange={(e) => handleInputChange('expectedVolume', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level *</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => handleInputChange('experience', value)}
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
              </div>

              <div>
                <Label htmlFor="investmentCapacity">Investment Capacity *</Label>
                <Select
                  value={formData.investmentCapacity}
                  onValueChange={(value) => handleInputChange('investmentCapacity', value)}
                >
                  <option value="">Select investment range</option>
                  {investmentRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </Select>
                {errors.investmentCapacity && <p className="text-red-500 text-sm mt-1">{errors.investmentCapacity}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Input
                  id="targetMarket"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  placeholder="e.g., Retail stores, Supermarkets, Restaurants"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Any additional information about the distributor..."
                />
              </div>
            </div>

            {/* Interested Products */}
            <div>
              <Label>Interested Products</Label>
              {productsLoading ? (
                <p className="text-gray-500 text-sm">Loading products...</p>
              ) : (
                <MultiSelect
                  options={products.map(product => ({
                    id: product.id,
                    name: `${product.name} (${product.sku})`
                  }))}
                  selected={formData.interestedProducts || []}
                  onChange={(selected) => handleInputChange('interestedProducts', selected)}
                  placeholder="Select products of interest"
                />
              )}
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Review & Confirm</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Business Information</h4>
                <p className="text-sm text-gray-600">
                  {formData.businessName} ({formData.businessType})
                </p>
                <p className="text-sm text-gray-600">
                  Contact: {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {formData.email} | Phone: {formData.phone}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Location</h4>
                <p className="text-sm text-gray-600">
                  {formData.address}, {formData.city}, {formData.region}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Business Details</h4>
                <p className="text-sm text-gray-600">
                  Territory: {formData.territory}
                </p>
                <p className="text-sm text-gray-600">
                  Experience: {formData.experience}
                </p>
                <p className="text-sm text-gray-600">
                  Investment Capacity: {formData.investmentCapacity}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {formData.status}
                </p>
              </div>

              {formData.interestedProducts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900">Interested Products</h4>
                  <p className="text-sm text-gray-600">
                    {formData.interestedProducts.length} product(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
                style={{
                  backgroundColor: themeClasses.primary,
                  color: 'white'
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
                style={{
                  backgroundColor: themeClasses.primary,
                  color: 'white'
                }}
              >
                {loading ? 'Updating...' : 'Update Distributor'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
