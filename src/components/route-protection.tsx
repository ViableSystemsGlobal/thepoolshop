"use client";

import { useSession } from 'next-auth/react';
import { useAbilities } from '@/hooks/use-abilities';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredModule: string;
  fallbackRoute?: string;
}

export function RouteProtection({ 
  children, 
  requiredModule, 
  fallbackRoute = '/dashboard' 
}: RouteProtectionProps) {
  const { data: session, status } = useSession();
  const { canAccess } = useAbilities();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!canAccess(requiredModule)) {
      router.push(fallbackRoute);
      return;
    }
  }, [session, status, canAccess, requiredModule, fallbackRoute, router]);

  // Show loading while checking permissions
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  // Don't render if doesn't have required permissions
  if (!canAccess(requiredModule)) {
    return null;
  }

  return <>{children}</>;
}
