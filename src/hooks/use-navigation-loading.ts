"use client";

import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/loading-context';
import { useCallback } from 'react';

export function useNavigationLoading() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  const navigateWithLoading = useCallback((href: string) => {
    startLoading();
    router.push(href);
    
    // Stop loading after a short delay to allow the page to start loading
    setTimeout(() => {
      stopLoading();
    }, 100);
  }, [router, startLoading, stopLoading]);

  const replaceWithLoading = useCallback((href: string) => {
    startLoading();
    router.replace(href);
    
    // Stop loading after a short delay to allow the page to start loading
    setTimeout(() => {
      stopLoading();
    }, 100);
  }, [router, startLoading, stopLoading]);

  return {
    navigateWithLoading,
    replaceWithLoading,
    startLoading,
    stopLoading
  };
}
