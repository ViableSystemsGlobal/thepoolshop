"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingSettings {
  companyName: string;
  companyLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

interface BrandingContextType {
  branding: BrandingSettings;
  loading: boolean;
  refreshBranding: () => Promise<void>;
  getThemeColor: () => string;
  getThemeClasses: () => {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    primaryBorder: string;
  };
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// Default branding settings
const defaultBranding: BrandingSettings = {
  companyName: 'AdPools Group',
  companyLogo: '',
  favicon: '/uploads/branding/favicon_1760896671527.jpg',
  primaryColor: '#8B5CF6',
  secondaryColor: '#7C3AED',
  description: 'A practical, single-tenant system for sales and distribution management'
};

// Convert hex color to Tailwind classes
function hexToTailwindClasses(hexColor: string) {
  // Map common hex colors to Tailwind classes
  const colorMap: { [key: string]: string } = {
    '#8B5CF6': 'purple-600',
    '#7C3AED': 'purple-700',
    '#2563eb': 'blue-600',
    '#1d4ed8': 'blue-700',
    '#16a34a': 'green-600',
    '#15803d': 'green-700',
    '#ea580c': 'orange-600',
    '#c2410c': 'orange-700',
    '#dc2626': 'red-600',
    '#b91c1c': 'red-700',
    '#4f46e5': 'indigo-600',
    '#4338ca': 'indigo-700',
    '#db2777': 'pink-600',
    '#be185d': 'pink-700',
    '#0d9488': 'teal-600',
    '#0f766e': 'teal-700',
  };

  const primaryClass = colorMap[hexColor] || 'purple-600';
  const primaryLight = primaryClass.replace('-600', '-500');
  const primaryDark = primaryClass.replace('-600', '-700');
  const primaryBg = primaryClass.replace('-600', '-50');
  const primaryHover = primaryClass.replace('-600', '-100');
  const primaryText = primaryClass.replace('-600', '-700');
  const primaryBorder = primaryClass;

  return {
    primary: primaryClass,
    primaryLight,
    primaryDark,
    primaryBg,
    primaryHover,
    primaryText,
    primaryBorder,
  };
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/public/branding');
      if (response.ok) {
        const data = await response.json();
        setBranding(data);
        
        // Update document title
        if (typeof document !== 'undefined') {
          document.title = data.companyName || 'AdPools Group';
        }
        
        // Update favicon
        if (typeof document !== 'undefined' && data.favicon) {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (favicon) {
            favicon.href = data.favicon;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding settings:', error);
      // Keep default branding on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const getThemeColor = () => {
    return branding.primaryColor;
  };

  const getThemeClasses = () => {
    return hexToTailwindClasses(branding.primaryColor);
  };

  return (
    <BrandingContext.Provider 
      value={{ 
        branding, 
        loading, 
        refreshBranding: fetchBranding,
        getThemeColor,
        getThemeClasses
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
