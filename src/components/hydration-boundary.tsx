"use client";

import { useEffect } from 'react';

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress hydration warnings for browser extension attributes
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning: Extra attributes from the server')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
}
