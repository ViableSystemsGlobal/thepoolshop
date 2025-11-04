"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { useBranding } from "@/contexts/branding-context";
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
  Building,
  Save
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
  const { branding, refreshBranding } = useBranding();
  const { success, info, error: showError } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewColor, setPreviewColor] = useState(themeColor);
  const [customColor, setCustomColor] = useState(branding.primaryColor || '#dc2626');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [originalColor, setOriginalColor] = useState(themeColor);
  const [originalCustomColor, setOriginalCustomColor] = useState(branding.primaryColor || '#dc2626');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load current branding settings
  useEffect(() => {
    setCustomColor(branding.primaryColor || '#dc2626');
    setOriginalCustomColor(branding.primaryColor || '#dc2626');
    
    // Check if current color is a preset or custom
    const presetColors = {
      '#dc2626': 'red',
      '#9333ea': 'purple',
      '#2563eb': 'blue',
      '#16a34a': 'green',
      '#ea580c': 'orange',
      '#4f46e5': 'indigo',
      '#db2777': 'pink',
      '#0d9488': 'teal',
    };
    
    if (presetColors[branding.primaryColor] || !branding.primaryColor) {
      setUseCustomColor(false);
    } else {
      setUseCustomColor(true);
    }
  }, [branding.primaryColor]);

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
  
  // Check if current color is custom (hex)
  const isCustomColor = theme.primary?.startsWith('#') || false;

  // Map preset colors to hex values
  const presetColorMap: { [key: string]: string } = {
    red: '#dc2626',
    purple: '#9333ea',
    blue: '#2563eb',
    green: '#16a34a',
    orange: '#ea580c',
    indigo: '#4f46e5',
    pink: '#db2777',
    teal: '#0d9488',
  };

  // Get hex color value for current selection
  const getCurrentHexColor = () => {
    if (useCustomColor) {
      return customColor;
    }
    return presetColorMap[previewMode ? previewColor : themeColor] || '#dc2626';
  };

  const handlePresetColorChange = (color: string) => {
    setUseCustomColor(false);
    if (previewMode) {
      setPreviewColor(color);
    } else {
      setThemeColor(color);
      handleSaveTheme(presetColorMap[color]);
    }
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    setUseCustomColor(true);
    if (!previewMode) {
      handleSaveTheme(hex);
    }
  };

  const handleSaveTheme = async (hexColor: string) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: branding.companyName,
          companyLogo: branding.companyLogo,
          favicon: branding.favicon,
          primaryColor: hexColor,
          secondaryColor: adjustColorBrightness(hexColor, -20),
          description: branding.description,
        }),
      });

      if (response.ok) {
        await refreshBranding();
        success("Theme Saved", "Your theme color has been saved and will apply system-wide.");
      } else {
        showError("Save Failed", "Failed to save theme color. Please try again.");
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      showError("Save Failed", "Failed to save theme color. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const startPreview = () => {
    setOriginalColor(themeColor);
    setPreviewColor(themeColor);
    setPreviewMode(true);
    info("Preview Mode", "You're now in preview mode. Changes won't be saved until you apply them.");
  };

  const applyPreview = async () => {
    // Save the preview color to database
    const hexColor = useCustomColor ? customColor : getCurrentHexColor();
    await handleSaveTheme(hexColor);
    
    // Apply the preview color as the new theme
    setThemeColor(previewColor);
    setOriginalColor(previewColor);
    setOriginalCustomColor(customColor);
    setPreviewMode(false);
  };

  const cancelPreview = () => {
    // Revert to original color
    setPreviewColor(originalColor);
    setCustomColor(originalCustomColor);
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
    <>
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
                className={!isCustomColor ? `bg-${theme.primary} hover:bg-${theme.primaryDark} text-white` : 'text-white'}
                style={isCustomColor ? { backgroundColor: getCurrentHexColor() } : {}}
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
            <div className="space-y-6">
              {/* Preset Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preset Colors
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {colorOptions.map((color) => {
                    const isSelected = !useCustomColor && (previewMode ? previewColor === color.value : themeColor === color.value);
                    return (
                      <button
                        key={color.value}
                        onClick={() => handlePresetColorChange(color.value)}
                        className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          isSelected
                            ? `border-${theme.primary} bg-${theme.primaryBg}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${color.preview} mx-auto mb-2`}></div>
                        <div className="text-sm font-medium text-gray-900">{color.name}</div>
                        {isSelected && (
                          <div 
                            className={!isCustomColor ? `absolute top-2 right-2 w-5 h-5 rounded-full bg-${theme.primary} flex items-center justify-center` : 'absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center'}
                            style={isCustomColor ? { backgroundColor: getCurrentHexColor() } : {}}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Custom Color
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^#[0-9A-F]{6}$/i.test(value)) {
                            handleCustomColorChange(value);
                          } else {
                            setCustomColor(value);
                          }
                        }}
                        placeholder="#dc2626"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a hex color code (e.g., #dc2626)
                      </p>
                    </div>
                  </div>
                  {(useCustomColor || (previewMode && useCustomColor)) && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: customColor }}
                      ></div>
                      <span className="text-sm text-gray-600">Current</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setUseCustomColor(true);
                      if (previewMode) {
                        setPreviewColor('custom');
                      } else {
                        handleSaveTheme(customColor);
                      }
                    }}
                    className={`text-sm px-4 py-2 rounded-md border ${
                      useCustomColor
                        ? `border-${theme.primary} bg-${theme.primaryBg} text-${theme.primaryText}`
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Use Custom Color
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={previewMode ? cancelPreview : startPreview}
                  className="flex items-center space-x-2"
                  disabled={isSaving}
                >
                  <Eye className="h-4 w-4" />
                  <span>{previewMode ? 'Cancel Preview' : 'Preview Changes'}</span>
                </Button>
                {previewMode && (
                  <>
                    <Button
                      onClick={applyPreview}
                      className={!isCustomColor ? `flex items-center space-x-2 bg-${theme.primary} hover:bg-${theme.primaryDark} text-white` : 'flex items-center space-x-2 text-white'}
                      style={isCustomColor ? { backgroundColor: getCurrentHexColor() } : {}}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Apply Changes'}</span>
                    </Button>
                    <p className="text-sm text-gray-600">
                      Preview mode is active. Click "Apply Changes" to save your selection.
                    </p>
                  </>
                )}
              </div>
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
                    className={!isCustomColor ? `bg-${theme.primary} hover:bg-${theme.primaryDark} text-white` : 'text-white'}
                    style={isCustomColor ? { backgroundColor: getCurrentHexColor() } : {}}
                  >
                    Primary Button
                  </Button>
                  <Button 
                    variant="outline"
                    className={!isCustomColor ? `border-${theme.primary} text-${theme.primary} hover:bg-${theme.primaryBg}` : ''}
                    style={isCustomColor ? { borderColor: getCurrentHexColor(), color: getCurrentHexColor() } : {}}
                  >
                    Outline Button
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={!isCustomColor ? `text-${theme.primary} hover:bg-${theme.primaryBg}` : ''}
                    style={isCustomColor ? { color: getCurrentHexColor() } : {}}
                  >
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
                        <div 
                          className={!isCustomColor ? `p-2 bg-${theme.primaryBg} rounded-lg group-hover:bg-${theme.primaryHover} transition-colors` : 'p-2 rounded-lg transition-colors'}
                          style={isCustomColor ? { backgroundColor: theme.primaryBg, color: getCurrentHexColor() } : {}}
                        >
                          <Palette 
                            className={!isCustomColor ? `h-4 w-4 text-${theme.primary}` : 'h-4 w-4'}
                            style={isCustomColor ? { color: getCurrentHexColor() } : {}}
                          />
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

                  <div 
                    className={!isCustomColor ? `p-4 rounded-lg bg-${theme.primaryBg} border border-${theme.primary} border-opacity-20` : 'p-4 rounded-lg border border-opacity-20'}
                    style={isCustomColor ? { backgroundColor: theme.primaryBg, borderColor: getCurrentHexColor() } : {}}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className={!isCustomColor ? `w-2 h-2 rounded-full bg-${theme.primary}` : 'w-2 h-2 rounded-full'}
                        style={isCustomColor ? { backgroundColor: getCurrentHexColor() } : {}}
                      ></div>
                      <span 
                        className={!isCustomColor ? `text-sm font-medium text-${theme.primaryText}` : 'text-sm font-medium'}
                        style={isCustomColor ? { color: getCurrentHexColor() } : {}}
                      >
                        Status Indicator
                      </span>
                    </div>
                  </div>

                  <div 
                    className={!isCustomColor ? `p-4 rounded-lg border-2 border-${theme.primary} bg-white` : 'p-4 rounded-lg border-2 bg-white'}
                    style={isCustomColor ? { borderColor: getCurrentHexColor() } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className={!isCustomColor ? `text-sm font-medium text-${theme.primaryText}` : 'text-sm font-medium'}
                        style={isCustomColor ? { color: getCurrentHexColor() } : {}}
                      >
                        Selected Item
                      </span>
                      <Check 
                        className={!isCustomColor ? `h-4 w-4 text-${theme.primary}` : 'h-4 w-4'}
                        style={isCustomColor ? { color: getCurrentHexColor() } : {}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Navigation</h4>
                <div className="flex space-x-1">
                  <button 
                    className={!isCustomColor ? `px-4 py-2 rounded-lg text-sm font-medium bg-${theme.primaryBg} text-${theme.primaryText} border-l-2 border-${theme.primary}` : 'px-4 py-2 rounded-lg text-sm font-medium border-l-2'}
                    style={isCustomColor ? { backgroundColor: theme.primaryBg, color: getCurrentHexColor(), borderLeftColor: getCurrentHexColor() } : {}}
                  >
                    Active Page
                  </button>
                  <button 
                    className={!isCustomColor ? `px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText} transition-colors` : 'px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors'}
                    onMouseEnter={(e) => {
                      if (isCustomColor) {
                        e.currentTarget.style.backgroundColor = theme.primaryBg;
                        e.currentTarget.style.color = getCurrentHexColor();
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isCustomColor) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }
                    }}
                  >
                    Inactive Page
                  </button>
                  <button 
                    className={!isCustomColor ? `px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText} transition-colors` : 'px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors'}
                    onMouseEnter={(e) => {
                      if (isCustomColor) {
                        e.currentTarget.style.backgroundColor = theme.primaryBg;
                        e.currentTarget.style.color = getCurrentHexColor();
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isCustomColor) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }
                    }}
                  >
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
    </>
  );
}
