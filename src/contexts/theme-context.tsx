"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'indigo' | 'pink' | 'teal';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  getThemeClasses: () => {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    primaryBorder: string;
  };
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeConfig = {
  purple: {
    primary: 'purple-600',
    primaryLight: 'purple-500',
    primaryDark: 'purple-700',
    primaryBg: 'purple-50',
    primaryHover: 'purple-100',
    primaryText: 'purple-700',
    primaryBorder: 'purple-600',
  },
  blue: {
    primary: 'blue-600',
    primaryLight: 'blue-500',
    primaryDark: 'blue-700',
    primaryBg: 'blue-50',
    primaryHover: 'blue-100',
    primaryText: 'blue-700',
    primaryBorder: 'blue-600',
  },
  green: {
    primary: 'green-600',
    primaryLight: 'green-500',
    primaryDark: 'green-700',
    primaryBg: 'green-50',
    primaryHover: 'green-100',
    primaryText: 'green-700',
    primaryBorder: 'green-600',
  },
  orange: {
    primary: 'orange-600',
    primaryLight: 'orange-500',
    primaryDark: 'orange-700',
    primaryBg: 'orange-50',
    primaryHover: 'orange-100',
    primaryText: 'orange-700',
    primaryBorder: 'orange-600',
  },
  red: {
    primary: 'red-600',
    primaryLight: 'red-500',
    primaryDark: 'red-700',
    primaryBg: 'red-50',
    primaryHover: 'red-100',
    primaryText: 'red-700',
    primaryBorder: 'red-600',
  },
  indigo: {
    primary: 'indigo-600',
    primaryLight: 'indigo-500',
    primaryDark: 'indigo-700',
    primaryBg: 'indigo-50',
    primaryHover: 'indigo-100',
    primaryText: 'indigo-700',
    primaryBorder: 'indigo-600',
  },
  pink: {
    primary: 'pink-600',
    primaryLight: 'pink-500',
    primaryDark: 'pink-700',
    primaryBg: 'pink-50',
    primaryHover: 'pink-100',
    primaryText: 'pink-700',
    primaryBorder: 'pink-600',
  },
  teal: {
    primary: 'teal-600',
    primaryLight: 'teal-500',
    primaryDark: 'teal-700',
    primaryBg: 'teal-50',
    primaryHover: 'teal-100',
    primaryText: 'teal-700',
    primaryBorder: 'teal-600',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>('purple');
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  // Load theme and logo from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeColor') as ThemeColor;
    if (savedTheme && themeConfig[savedTheme]) {
      setThemeColor(savedTheme);
    }
    
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  // Save theme to localStorage when it changes
  const handleSetThemeColor = (color: ThemeColor) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
  };

  // Save logo to localStorage when it changes
  const handleSetCustomLogo = (logo: string | null) => {
    setCustomLogo(logo);
    if (logo) {
      localStorage.setItem('customLogo', logo);
    } else {
      localStorage.removeItem('customLogo');
    }
  };

  const getThemeClasses = () => {
    return themeConfig[themeColor];
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        themeColor, 
        setThemeColor: handleSetThemeColor, 
        getThemeClasses,
        customLogo,
        setCustomLogo: handleSetCustomLogo
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
