"use client";

import { useLoading } from '@/contexts/loading-context';
import { useCallback } from 'react';

export function useApiLoading() {
  const { startLoading, stopLoading } = useLoading();

  const withLoading = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options?: {
      minLoadingTime?: number;
      onError?: (error: any) => void;
    }
  ): Promise<T> => {
    const { minLoadingTime = 300, onError } = options || {};
    
    startLoading();
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    withLoading,
    startLoading,
    stopLoading
  };
}
