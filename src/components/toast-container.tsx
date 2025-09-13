"use client";

import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/contexts/toast-context';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return <Toaster toasts={toasts} onDismiss={removeToast} />;
}
