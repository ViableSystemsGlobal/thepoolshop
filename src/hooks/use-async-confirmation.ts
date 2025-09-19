import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  onConfirm: (() => Promise<void>) | null;
  isLoading: boolean;
}

export function useAsyncConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    onConfirm: null,
    isLoading: false,
  });

  const confirm = useCallback((
    options: ConfirmationOptions,
    onConfirm: () => Promise<void>
  ) => {
    setState({
      isOpen: true,
      options,
      onConfirm,
      isLoading: false,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      options: null,
      onConfirm: null,
      isLoading: false,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.onConfirm) {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        await state.onConfirm();
        close();
      } catch (error) {
        console.error('Confirmation action failed:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [state.onConfirm, close]);

  return {
    isOpen: state.isOpen,
    options: state.options,
    isLoading: state.isLoading,
    confirm,
    close,
    handleConfirm,
  };
}
