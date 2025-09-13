"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Palette, 
  Check,
  Monitor,
  Moon,
  Sun,
  Eye,
  Upload,
  Building
} from "lucide-react";

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

export default function AppearanceSettingsPage() {
  const { themeColor, setThemeColor, getThemeClasses, customLogo, setCustomLogo } = useTheme();
  const { success, info, error: showError } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewColor, setPreviewColor] = useState(themeColor);
  const [originalColor, setOriginalColor] = useState(themeColor);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Use preview color when in preview mode, otherwise use current theme
  const currentColor = previewMode ? previewColor : themeColor;
  
  // Get theme classes based on current color (preview or actual)
  const getCurrentThemeClasses = () => {
    const colorMap: { [key: string]: any } = {
      purple: {
        primary: "purple-600",
        primaryDark: "purple-700",
        primaryLight: "purple-500",
        primaryBg: "purple-50",
        primaryHover: "purple-100",
        primaryText: "purple-700",
        primaryBorder: "purple-600",
      },
      blue: {
        primary: "blue-600",
        primaryDark: "blue-700",
        primaryLight: "blue-500",
        primaryBg: "blue-50",
        primaryHover: "blue-100",
        primaryText: "blue-700",
        primaryBorder: "blue-600",
      },
      green: {
        primary: "green-600",
        primaryDark: "green-700",
        primaryLight: "green-500",
        primaryBg: "green-50",
        primaryHover: "green-100",
        primaryText: "green-700",
        primaryBorder: "green-600",
      },
      orange: {
        primary: "orange-600",
        primaryDark: "orange-700",
        primaryLight: "orange-500",
        primaryBg: "orange-50",
        primaryHover: "orange-100",
        primaryText: "orange-700",
        primaryBorder: "orange-600",
      },
      red: {
        primary: "red-600",
        primaryDark: "red-700",
        primaryLight: "red-500",
        primaryBg: "red-50",
        primaryHover: "red-100",
        primaryText: "red-700",
        primaryBorder: "red-600",
      },
      indigo: {
        primary: "indigo-600",
        primaryDark: "indigo-700",
        primaryLight: "indigo-500",
        primaryBg: "indigo-50",
        primaryHover: "indigo-100",
        primaryText: "indigo-700",
        primaryBorder: "indigo-600",
      },
      pink: {
        primary: "pink-600",
        primaryDark: "pink-700",
        primaryLight: "pink-500",
        primaryBg: "pink-50",
        primaryHover: "pink-100",
        primaryText: "pink-700",
        primaryBorder: "pink-600",
      },
      teal: {
        primary: "teal-600",
        primaryDark: "teal-700",
        primaryLight: "teal-500",
        primaryBg: "teal-50",
        primaryHover: "teal-100",
        primaryText: "teal-700",
        primaryBorder: "teal-600",
      },
    };
    return colorMap[currentColor] || colorMap.purple;
  };

  const theme = getCurrentThemeClasses();

  const handleColorChange = (color: string) => {
    if (previewMode) {
      setPreviewColor(color);
    } else {
      setThemeColor(color);
      success("Theme Updated", `Your theme has been changed to ${color.charAt(0).toUpperCase() + color.slice(1)}`);
    }
  };

  const startPreview = () => {
    setOriginalColor(themeColor);
    setPreviewColor(themeColor);
    setPreviewMode(true);
    info("Preview Mode", "You're now in preview mode. Changes won't be saved until you apply them.");
  };

  const applyPreview = () => {
    // Apply the preview color as the new theme
    setThemeColor(previewColor);
    setOriginalColor(previewColor);
    setPreviewMode(false);
    success("Theme Applied", `Your theme has been changed to ${previewColor.charAt(0).toUpperCase() + previewColor.slice(1)}`);
  };

  const cancelPreview = () => {
    // Revert to original color
    setPreviewColor(originalColor);
    setPreviewMode(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError("Invalid File", "Please select an image file (PNG, JPG, GIF, etc.)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError("File Too Large", "Please select an image smaller than 2MB");
      return;
    }

    setIsUploadingLogo(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        success("Logo Updated", "Your logo has been successfully updated.");
        setIsUploadingLogo(false);
      };
      reader.onerror = () => {
        showError("Upload Failed", "Failed to process the image. Please try again.");
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showError("Upload Failed", "Failed to upload the image. Please try again.");
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    success("Logo Removed", "Your logo has been removed. The default logo will be shown.");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appearance Settings</h1>
              <p className="text-gray-600">Customize your application's look and feel</p>
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
            
            <div className="mt-6 flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={previewMode ? cancelPreview : startPreview}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{previewMode ? 'Cancel Preview' : 'Preview Changes'}</span>
              </Button>
              {previewMode && (
                <p className="text-sm text-gray-600">
                  Preview mode is active. Click "Apply Changes" to save your selection.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logo Customization */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-gray-600" />
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
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primary} cursor-pointer ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        {/* Theme Preview */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Theme Preview</CardTitle>
            <CardDescription>
              See how your selected theme will look across different UI elements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Buttons Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Buttons</h4>
                <div className="flex items-center space-x-3">
                  <Button 
                    className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                  >
                    Primary Button
                  </Button>
                  <Button 
                    variant="outline"
                    className={`border-${theme.primary} text-${theme.primary} hover:bg-${theme.primaryBg}`}
                  >
                    Outline Button
                  </Button>
                  <Button variant="ghost" className={`text-${theme.primary} hover:bg-${theme.primaryBg}`}>
                    Ghost Button
                  </Button>
                </div>
              </div>

              {/* Cards Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Cards & States</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`border border-gray-200 hover:border-${theme.primary} hover:shadow-sm transition-all cursor-pointer group`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-${theme.primaryBg} rounded-lg group-hover:bg-${theme.primaryHover} transition-colors`}>
                          <Palette className={`h-4 w-4 text-${theme.primary}`} />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            Active Card
                          </h5>
                          <p className="text-sm text-gray-600">Hover to see theme colors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className={`p-4 rounded-lg bg-${theme.primaryBg} border border-${theme.primary} border-opacity-20`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${theme.primary}`}></div>
                      <span className={`text-sm font-medium text-${theme.primaryText}`}>
                        Status Indicator
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 border-${theme.primary} bg-white`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium text-${theme.primaryText}`}>
                        Selected Item
                      </span>
                      <Check className={`h-4 w-4 text-${theme.primary}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Navigation</h4>
                <div className="flex space-x-1">
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium bg-${theme.primaryBg} text-${theme.primaryText} border-l-2 border-${theme.primary}`}>
                    Active Page
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText} transition-colors`}>
                    Inactive Page
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText} transition-colors`}>
                    Another Page
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>
              More customization options for your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">Switch to dark theme (Coming Soon)</p>
                </div>
                <Button variant="outline" disabled>
                  <Moon className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
                  <p className="text-sm text-gray-600">Reduce spacing for more content (Coming Soon)</p>
                </div>
                <Button variant="outline" disabled>
                  <Monitor className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
