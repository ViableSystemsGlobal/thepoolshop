"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { 
  ArrowLeft,
  Palette,
  Star,
  Settings,
  Check,
  Upload,
  Building,
  Globe,
  Bell,
  Shield
} from "lucide-react";
import Link from "next/link";

const colorOptions = [
  { name: 'Purple', value: 'purple', preview: 'bg-purple-600' },
  { name: 'Blue', value: 'blue', preview: 'bg-blue-600' },
  { name: 'Green', value: 'green', preview: 'bg-green-600' },
  { name: 'Orange', value: 'orange', preview: 'bg-orange-600' },
  { name: 'Red', value: 'red', preview: 'bg-red-600' },
  { name: 'Indigo', value: 'indigo', preview: 'bg-indigo-600' },
  { name: 'Pink', value: 'pink', preview: 'bg-pink-600' },
  { name: 'Teal', value: 'teal', preview: 'bg-teal-600' },
];

export default function SystemSettingsPage() {
  const { themeColor, setThemeColor, getThemeClasses, customLogo, setCustomLogo } = useTheme();
  const { success, error: showError } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewColor, setPreviewColor] = useState(themeColor);
  const [originalColor, setOriginalColor] = useState(themeColor);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [companyName, setCompanyName] = useState("AdPools Group");
  const [description, setDescription] = useState("A practical, single-tenant system for sales and distribution management");

  // Use preview color when in preview mode, otherwise use current theme
  const currentColor = previewMode ? previewColor : themeColor;
  
  // Get theme classes
  const getCurrentThemeClasses = () => {
    const colorMap: { [key: string]: any } = {
      purple: { primary: "purple-600", primaryDark: "purple-700", primaryBg: "purple-50", primaryHover: "purple-100", primaryText: "purple-700" },
      blue: { primary: "blue-600", primaryDark: "blue-700", primaryBg: "blue-50", primaryHover: "blue-100", primaryText: "blue-700" },
      green: { primary: "green-600", primaryDark: "green-700", primaryBg: "green-50", primaryHover: "green-100", primaryText: "green-700" },
      orange: { primary: "orange-600", primaryDark: "orange-700", primaryBg: "orange-50", primaryHover: "orange-100", primaryText: "orange-700" },
      red: { primary: "red-600", primaryDark: "red-700", primaryBg: "red-50", primaryHover: "red-100", primaryText: "red-700" },
      indigo: { primary: "indigo-600", primaryDark: "indigo-700", primaryBg: "indigo-50", primaryHover: "indigo-100", primaryText: "indigo-700" },
      pink: { primary: "pink-600", primaryDark: "pink-700", primaryBg: "pink-50", primaryHover: "pink-100", primaryText: "pink-700" },
      teal: { primary: "teal-600", primaryDark: "teal-700", primaryBg: "teal-50", primaryHover: "teal-100", primaryText: "teal-700" },
    };
    return colorMap[currentColor] || colorMap.purple;
  };

  const theme = getCurrentThemeClasses();

  const handleColorChange = (color: string) => {
    if (previewMode) {
      setPreviewColor(color as any);
    } else {
      setThemeColor(color as any);
      success("Theme Updated", `Your theme has been changed to ${color.charAt(0).toUpperCase() + color.slice(1)}`);
    }
  };

  const applyPreview = () => {
    setThemeColor(previewColor as any);
    setOriginalColor(previewColor as any);
    setPreviewMode(false);
    success("Theme Applied", `Your theme has been changed to ${previewColor.charAt(0).toUpperCase() + previewColor.slice(1)}`);
  };

  const cancelPreview = () => {
    setPreviewColor(originalColor);
    setPreviewMode(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError("Invalid File", "Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError("File Too Large", "Please select an image smaller than 2MB");
      return;
    }

    setIsUploadingLogo(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        success("Logo Updated", "Your logo has been successfully updated.");
        setIsUploadingLogo(false);
      };
      reader.onerror = () => {
        showError("Upload Failed", "Failed to process the image.");
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showError("Upload Failed", "Failed to upload the image.");
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    success("Logo Removed", "The default logo will be shown.");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Customize appearance, branding, and system preferences</p>
            </div>
          </div>
          {previewMode && (
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={cancelPreview}>
                Cancel
              </Button>
              <Button 
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                onClick={applyPreview}
              >
                Apply Changes
              </Button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/settings/system/branding">
            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Branding</h3>
                  <p className="text-xs text-gray-500">Full settings</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/settings/notifications">
            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500">Email & SMS</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/settings/google-maps">
            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Integrations</h3>
                  <p className="text-xs text-gray-500">Google Maps</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="border border-gray-200 opacity-60">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Security</h3>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theme Color Selection */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-gray-600" />
              <span>Theme Color</span>
            </CardTitle>
            <CardDescription>
              Choose your primary accent color. This will be used throughout the application for buttons, links, and highlights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    currentColor === color.value
                      ? `border-${theme.primary} bg-${theme.primaryBg}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${color.preview} mx-auto mb-2`}></div>
                  <div className="text-sm font-medium text-gray-900">{color.name}</div>
                  {currentColor === color.value && (
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-${theme.primary} flex items-center justify-center`}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Logo */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-gray-600" />
              <span>Company Logo</span>
            </CardTitle>
            <CardDescription>
              Upload a custom logo to replace the default icon in the sidebar. Recommended size: 32x32px or larger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Logo Preview */}
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700">Current Logo:</div>
                <div className="flex items-center space-x-2">
                  {customLogo ? (
                    <img 
                      src={customLogo} 
                      alt="Current Logo" 
                      className="h-8 w-8 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br from-${theme.primary} to-${theme.primaryDark} flex items-center justify-center`}>
                      <Building className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    {customLogo ? "Custom Logo" : "Default Logo"}
                  </span>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                  disabled={isUploadingLogo}
                />
                <label
                  htmlFor="logo-upload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </label>
                
                {customLogo && (
                  <Button
                    variant="outline"
                    onClick={removeLogo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove Logo
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Supported formats: PNG, JPG, GIF, SVG. Maximum file size: 2MB.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-gray-600" />
              <span>Company Information</span>
            </CardTitle>
            <CardDescription>
              Basic company details and system description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter company description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shortcuts to Other Settings */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">More Settings</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Visit <Link href="/settings/system/branding" className="underline font-medium">Branding Settings</Link> for full branding customization (colors, favicon, etc.)</li>
                  <li>• Configure <Link href="/settings/notifications" className="underline font-medium">Notification Settings</Link> for email and SMS setup</li>
                  <li>• Manage <Link href="/settings/google-maps" className="underline font-medium">Google Maps Integration</Link> for location services</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
