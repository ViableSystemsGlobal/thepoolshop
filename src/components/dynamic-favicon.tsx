"use client";

import { useEffect } from 'react';
import { useCompany } from '@/contexts/company-context';

export function DynamicFavicon() {
  const { companyName, favicon } = useCompany();

  useEffect(() => {
    // Update document title with company name
    if (companyName && companyName !== 'AdPools Group') {
      const originalTitle = document.title;
      const baseTitle = originalTitle.includes(' - ') 
        ? originalTitle.split(' - ').slice(1).join(' - ') 
        : originalTitle;
      
      document.title = `${companyName} - ${baseTitle}`;
    }

    // Update favicon using a safer approach
    if (favicon) {
      // Use a more React-friendly approach by updating the existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (existingFavicon) {
        // Just update the href with cache-busting parameter
        existingFavicon.href = `${favicon}?v=${Date.now()}`;
      } else {
        // Only create new favicon if none exists
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = `${favicon}?v=${Date.now()}`;
        document.head.appendChild(link);
      }
    }
  }, [companyName, favicon]);

  // This component doesn't render anything visible
  return null;
}