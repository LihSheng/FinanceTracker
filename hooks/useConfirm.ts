'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    message: '',
  });
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveCallback) {
      resolveCallback(true);
      setResolveCallback(null);
    }
  }, [resolveCallback]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveCallback) {
      resolveCallback(false);
      setResolveCallback(null);
    }
  }, [resolveCallback]);

  return {
    confirm,
    isOpen,
    options,
    handleConfirm,
    handleCancel,
  };
}
