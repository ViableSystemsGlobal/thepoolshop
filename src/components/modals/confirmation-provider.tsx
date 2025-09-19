"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useConfirmation } from '@/hooks/use-confirmation';
import { ConfirmationModal } from './confirmation-modal';

interface ConfirmationContextType {
  confirm: (
    options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    },
    onConfirm: () => void
  ) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const { isOpen, options, confirm, close, handleConfirm } = useConfirmation();

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        title={options?.title || ''}
        message={options?.message || ''}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        type={options?.type}
      />
    </ConfirmationContext.Provider>
  );
}

export function useConfirmationModal() {
  const context = useContext(ConfirmationContext);
  if (context === undefined) {
    throw new Error('useConfirmationModal must be used within a ConfirmationProvider');
  }
  return context;
}
