"use client";

import React, { useEffect, useState } from 'react';

interface LoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingBar({ isLoading, className = '' }: LoadingBarProps) {
  const [isVisible, setIsVisible] = useState(false);

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
      className={`fixed inset-0 bg-white z-50 flex items-center justify-center ${className}`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* YouTube-style loading spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
        </div>
        
        {/* Simple loading text */}
        <div className="text-gray-600 text-sm font-medium">
          Loading...
        </div>
      </div>
    </div>
  );
}
