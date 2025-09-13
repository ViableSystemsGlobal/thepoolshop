"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  theme?: any;
}

export function ToastComponent({ toast, onDismiss, theme }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  const getToastStyles = () => {
    if (theme) {
      return {
        success: {
          bg: `bg-green-50`,
          border: `border-green-200`,
          icon: `text-green-600`,
          title: `text-green-900`,
          description: `text-green-700`,
        },
        error: {
          bg: `bg-red-50`,
          border: `border-red-200`,
          icon: `text-red-600`,
          title: `text-red-900`,
          description: `text-red-700`,
        },
        warning: {
          bg: `bg-yellow-50`,
          border: `border-yellow-200`,
          icon: `text-yellow-600`,
          title: `text-yellow-900`,
          description: `text-yellow-700`,
        },
        info: {
          bg: `bg-${theme.primaryBg}`,
          border: `border-${theme.primaryBorder}`,
          icon: `text-${theme.primary}`,
          title: `text-${theme.primaryText}`,
          description: `text-${theme.primaryText}`,
        },
      };
    }

    // Fallback styles without theme
    return {
      success: {
        bg: `bg-green-50`,
        border: `border-green-200`,
        icon: `text-green-600`,
        title: `text-green-900`,
        description: `text-green-700`,
      },
      error: {
        bg: `bg-red-50`,
        border: `border-red-200`,
        icon: `text-red-600`,
        title: `text-red-900`,
        description: `text-red-700`,
      },
      warning: {
        bg: `bg-yellow-50`,
        border: `border-yellow-200`,
        icon: `text-yellow-600`,
        title: `text-yellow-900`,
        description: `text-yellow-700`,
      },
      info: {
        bg: `bg-blue-50`,
        border: `border-blue-200`,
        icon: `text-blue-600`,
        title: `text-blue-900`,
        description: `text-blue-700`,
      },
    };
  };

  const styles = getToastStyles()[toast.type];

  return (
    <div
      className={cn(
        "relative flex w-full items-center space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        styles.bg,
        styles.border,
        "animate-in slide-in-from-right-full"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", styles.icon)} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className={cn("text-sm font-medium", styles.title)}>
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className={cn("text-sm", styles.description)}>
            {toast.description}
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          "flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5",
          styles.icon
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
