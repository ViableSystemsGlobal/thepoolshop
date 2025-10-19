"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';

interface LoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingBar({ isLoading, className = '' }: LoadingBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { getThemeColor } = useTheme();

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    } else {
      // Add a small delay before hiding to prevent flicker
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 bg-transparent z-50 overflow-hidden ${className}`}
      style={{ zIndex: 9999, height: '3px' }}
    >
      <div 
        className="h-full w-full"
        style={{
          backgroundColor: getThemeColor(),
          animation: 'loading-bar 1.5s ease-in-out infinite',
          transform: 'translateX(-100%)'
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loading-bar {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `
      }} />
    </div>
  );
}
