"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Star, Image, Globe } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/toast-context";

interface BrandingSettings {
  companyName: string;
  companyLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState<BrandingSettings>({
    companyName: "AdPools Group",
    companyLogo: "/uploads/branding/company_logo_default.svg",
    favicon: "/uploads/branding/favicon_default.svg",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    description: "A practical, single-tenant system for sales and distribution management"
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/branding');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading branding settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showSuccess('Branding settings saved successfully!');
        // Update favicon if changed
        if (settings.favicon) {
          updateFavicon(settings.favicon);
        }
      } else {
        showError('Failed to save branding settings');
      }
    } catch (error) {
      console.error('Error saving branding settings:', error);
      showError('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
  };

  const handleFileUpload = async (field: 'companyLogo' | 'favicon', file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', field);

      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          [field]: data.url
        }));
        showSuccess(`${field === 'companyLogo' ? 'Company logo' : 'Favicon'} uploaded successfully!`);
      } else {
        showError(`Failed to upload ${field}`);
      }
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      showError(`Failed to upload ${field}`);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading branding settings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
            <p className="text-gray-600">Customize your company's visual identity and branding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                Basic company details and branding information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter company description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5" />
                <span>Visual Assets</span>
              </CardTitle>
              <CardDescription>
                Upload and manage your company logo and favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Logo */}
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 space-y-3">
                  {settings.companyLogo && (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={settings.companyLogo} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain border rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Current logo</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload('companyLogo', file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="text-center">
                          <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload logo</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <Label>Favicon</Label>
                <div className="mt-2 space-y-3">
                  {settings.favicon && (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={settings.favicon} 
                        alt="Favicon" 
                        className="h-8 w-8 object-contain border rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Current favicon</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload('favicon', file);
                        }
                      }}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <Label htmlFor="favicon-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="text-center">
                          <Globe className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload favicon</p>
                          <p className="text-xs text-gray-500">Recommended: 32x32 or 16x16 pixels</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </>
  );
}
