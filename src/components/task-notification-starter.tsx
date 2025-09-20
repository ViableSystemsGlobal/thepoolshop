'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function TaskNotificationStarter() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only start for authenticated admin users
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'ADMIN') return;

    let mounted = true;

    const startNotificationRunner = async () => {
      try {
        // Check if already running
        const statusResponse = await fetch('/api/tasks/notification-runner');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.isActive) {
            console.log('Task notification runner is already active');
            return;
          }
        }

        // Start the runner
        const response = await fetch('/api/tasks/notification-runner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' })
        });

        if (response.ok && mounted) {
          console.log('✅ Task notification runner started automatically');
        }
      } catch (error) {
        console.error('Failed to start task notification runner:', error);
      }
    };

    // Start after a short delay to ensure everything is loaded
    const timer = setTimeout(startNotificationRunner, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [session, status]);

  return null; // This component doesn't render anything
}
