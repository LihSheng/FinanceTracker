import { useState, useCallback } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Toast) => {
    // Simple alert for now - can be enhanced with a proper toast component later
    if (variant === 'destructive') {
      alert(`Error: ${title}${description ? '\n' + description : ''}`);
    } else {
      alert(`${title}${description ? '\n' + description : ''}`);
    }
  }, []);

  return { toast, toasts };
}
