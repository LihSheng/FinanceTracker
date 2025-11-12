'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Download, Loader2 } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['transactions']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const dataTypes = [
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'forecasts', label: 'Forecasts' },
  ];

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one data type to export');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataTypes: selectedTypes,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Reset and close
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        onOpenChange(false);
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      alert(error instanceof Error ? error.message : 'Failed to export data');
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Select the data you want to export and optionally specify a date range.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data Type Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Data Types
            </label>
            <div className="space-y-2">
              {dataTypes.map((type) => (
                <Checkbox
                  key={type.id}
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => handleTypeToggle(type.id)}
                  label={type.label}
                />
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startDate" className="mb-1 block text-xs text-gray-600">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="mb-1 block text-xs text-gray-600">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Exporting...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedTypes.length === 0}
            isLoading={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
