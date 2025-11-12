'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  label,
  className,
}: CheckboxProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {label && (
        <label htmlFor={id} className="ml-2 text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
}
