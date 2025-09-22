"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';

interface LoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingBar({ isLoading, className = '' }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress with realistic timing
      const timer1 = setTimeout(() => setProgress(20), 200);
      const timer2 = setTimeout(() => setProgress(40), 500);
      const timer3 = setTimeout(() => setProgress(65), 800);
      const timer4 = setTimeout(() => setProgress(85), 1200);
      const timer5 = setTimeout(() => setProgress(95), 1600);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    } else {
      // Complete the progress and hide
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-0.5 z-50 ${className}`}
      style={{ zIndex: 9999 }}
    >
      <div
        className={`h-full transition-all duration-300 ease-out bg-gradient-to-r from-${theme.primary} to-${theme.primaryLight}`}
        style={{
          width: `${progress}%`,
          transform: 'translateZ(0)', // Hardware acceleration
        }}
      />
    </div>
  );
}
