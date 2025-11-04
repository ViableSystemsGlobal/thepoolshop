"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { useCompany } from "@/contexts/company-context";
import { 
  ArrowLeft,
  Palette,
  Star,
  Settings,
  Upload,
  Building,
  Globe,
  Bell,
  Shield,
  MessageCircle
} from "lucide-react";
import Link from "next/link";


export default function SystemSettingsPage() {
  const { getThemeClasses, customLogo, setCustomLogo } = useTheme();
  const { success, error: showError } = useToast();
  const { companyName: contextCompanyName, description: contextDescription, favicon, refreshCompanyData } = useCompany();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [chatBackground, setChatBackground] = useState<string>("");
  const [isUploadingChatBg, setIsUploadingChatBg] = useState(false);
  const [companyName, setCompanyName] = useState(contextCompanyName);
  const [description, setDescription] = useState(contextDescription);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load chat background on mount
  useEffect(() => {
    const saved = localStorage.getItem('chatButtonBg');
    if (saved) setChatBackground(saved);
  }, []);

  const theme = getThemeClasses();

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

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 handleFaviconUpload called!', event.target.files);
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    console.log('📁 File selected:', file.name, file.size, file.type);

    if (!file.type.startsWith('image/')) {
      showError("Invalid File", "Please select an image file (PNG, ICO, SVG recommended)");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      showError("File Too Large", "Favicon should be smaller than 1MB");
      return;
    }

    setIsUploadingFavicon(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'favicon');

    try {
      console.log('📤 Starting upload to /api/upload/branding');
      // Use the dedicated branding upload endpoint
      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      });
      console.log('📥 Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        success("Favicon Updated", "Your favicon has been successfully updated.");
        
        // Update the favicon in the database
        const settingsResponse = await fetch('/api/settings/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            favicon: data.url
          }),
        });
        
        if (settingsResponse.ok) {
          await refreshCompanyData();
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      showError("Upload Failed", "Failed to upload favicon.");
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const saveCompanySettings = async () => {
    try {
      setIsSavingSettings(true);
      const response = await fetch('/api/settings/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          description
          // Don't include favicon here - it's uploaded separately via handleFaviconUpload
        }),
      });

      if (response.ok) {
        success('Company settings saved successfully');
        await refreshCompanyData();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      showError('Error', 'Failed to save company settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChatBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError("File Too Large", "Please select an image smaller than 2MB");
      return;
    }

    setIsUploadingChatBg(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setChatBackground(result);
      localStorage.setItem('chatButtonBg', result);
      success("Background Updated", "Chat button background updated");
      setIsUploadingChatBg(false);
    };
    reader.readAsDataURL(file);
  };

  const removeChatBg = () => {
    setChatBackground("");
    localStorage.removeItem('chatButtonBg');
    success("Background Removed", "Using default gradient");
  };

  return (
    <>
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
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/settings/appearance">
            <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Palette className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Appearance & Theme</h3>
                  <p className="text-xs text-gray-500">Colors & logo</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
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
        </div>

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

        {/* Chat Button Background */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <span>AI Chat Button</span>
            </CardTitle>
            <CardDescription>
              Upload a custom background image for the floating chat button
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700">Preview:</div>
                <div 
                  className="h-14 w-14 rounded-full border flex items-center justify-center"
                  style={{
                    background: chatBackground || 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  }}
                >
                  {!chatBackground && <MessageCircle className="h-6 w-6 text-white" />}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChatBgUpload}
                  className="hidden"
                  id="chat-bg-upload"
                  disabled={isUploadingChatBg}
                />
                <label
                  htmlFor="chat-bg-upload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploadingChatBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingChatBg ? 'Uploading...' : 'Upload Background'}
                </label>
                
                {chatBackground && (
                  <Button
                    variant="outline"
                    onClick={removeChatBg}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500">
                PNG, JPG, GIF. Max 2MB. Square image recommended.
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

            {/* Favicon Upload */}
            <div>
              <Label>Favicon</Label>
              <div className="flex items-center space-x-4 mt-2">
                {favicon && (
                  <div className="flex items-center space-x-2">
                    <img 
                      src={favicon} 
                      alt="Current favicon" 
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-sm text-gray-600">Current favicon</span>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                  id="favicon-upload"
                  disabled={isUploadingFavicon}
                />
                <label
                  htmlFor="favicon-upload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploadingFavicon ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                PNG, ICO, or SVG. Max 1MB. 32x32px or 16x16px recommended.
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={saveCompanySettings}
                disabled={isSavingSettings}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
              >
                {isSavingSettings ? 'Saving...' : 'Save Company Settings'}
              </Button>
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
    </>
  );
}
