import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  requireConfirmationText?: string;
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  onConfirm: (() => Promise<void>) | null;
  isLoading: boolean;
  confirmationText: string;
}

export function useAsyncConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    onConfirm: null,
    isLoading: false,
    confirmationText: '',
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
      confirmationText: '',
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      options: null,
      onConfirm: null,
      isLoading: false,
      confirmationText: '',
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.onConfirm) {
      // Check if confirmation text is required and matches
      if (state.options?.requireConfirmationText && 
          state.confirmationText !== state.options.requireConfirmationText) {
        return; // Don't proceed if confirmation text doesn't match
      }
      
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        await state.onConfirm();
        close();
      } catch (error) {
        console.error('Confirmation action failed:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [state.onConfirm, state.options, state.confirmationText, close]);

  const updateConfirmationText = useCallback((text: string) => {
    setState(prev => ({ ...prev, confirmationText: text }));
  }, []);

  return {
    isOpen: state.isOpen,
    options: state.options,
    isLoading: state.isLoading,
    confirmationText: state.confirmationText,
    confirm,
    close,
    handleConfirm,
    updateConfirmationText,
  };
}
