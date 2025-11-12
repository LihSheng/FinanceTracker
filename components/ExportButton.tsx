'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import ExportDialog from '@/components/ExportDialog';

interface ExportButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ExportButton({
  variant = 'outline',
  size = 'md',
  className,
}: ExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsDialogOpen(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        Export Data
      </Button>

      <ExportDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
