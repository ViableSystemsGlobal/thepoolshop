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
  onConfirm: (() => void) | null;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    onConfirm: null,
  });

  const confirm = useCallback((
    options: ConfirmationOptions,
    onConfirm: () => void
  ) => {
    setState({
      isOpen: true,
      options,
      onConfirm,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      options: null,
      onConfirm: null,
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm();
      close();
    }
  }, [state.onConfirm, close]);

  return {
    isOpen: state.isOpen,
    options: state.options,
    confirm,
    close,
    handleConfirm,
  };
}
