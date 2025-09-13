"use client";

import React from 'react';
import { ToastComponent, Toast } from './toast';
import { useTheme } from '@/contexts/theme-context';

interface ToasterProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 w-96 max-w-sm">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          theme={theme}
        />
      ))}
    </div>
  );
}
