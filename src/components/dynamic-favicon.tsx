"use client";

import { useEffect, useState } from 'react';

export function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string>('');

  useEffect(() => {
    // Load favicon from settings
    const loadFavicon = async () => {
      try {
        const response = await fetch('/api/settings/branding');
        if (response.ok) {
          const data = await response.json();
          if (data.favicon) {
            setFaviconUrl(data.favicon);
            updateFavicon(data.favicon);
          }
        }
      } catch (error) {
        console.error('Error loading favicon:', error);
      }
    };

    loadFavicon();
  }, []);

  const updateFavicon = (url: string) => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = url;
    document.head.appendChild(link);
  };

  // This component doesn't render anything visible
  return null;
}
