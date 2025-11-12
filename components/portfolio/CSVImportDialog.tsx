'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import { useToastContext } from '@/contexts/ToastContext';

interface CSVImportDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CSVRow {
  [key: string]: string;
  platform: string;
  assetType: string;
  ticker: string;
  name: string;
  units: string;
  buyPrice: string;
  currentPrice: string;
  currency: string;
  purchaseDate: string;
  notes: string;
}

export default function CSVImportDialog({ onSuccess, onCancel }: CSVImportDialogProps) {
  const { success, error } = useToastContext();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    platform: '',
    assetType: '',
    ticker: '',
    name: '',
    units: '',
    buyPrice: '',
    currentPrice: '',
    currency: '',
    purchaseDate: '',
    notes: '',
  });
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [importResult, setImportResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map((h) => h.trim());
      setHeaders(headers);

      const data = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvData(data);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (field: string, header: string) => {
    setColumnMapping((prev) => ({ ...prev, [field]: header }));
  };

  const handlePreview = () => {
    setStep('preview');
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const mappedData = csvData.map((row) => ({
        platform: row[columnMapping.platform] || '',
        assetType: row[columnMapping.assetType] || '',
        ticker: row[columnMapping.ticker] || '',
        name: row[columnMapping.name] || '',
        units: row[columnMapping.units] || '',
        buyPrice: row[columnMapping.buyPrice] || '',
        currentPrice: row[columnMapping.currentPrice] || '',
        currency: row[columnMapping.currency] || '',
        purchaseDate: row[columnMapping.purchaseDate] || '',
        notes: row[columnMapping.notes] || '',
      }));

      const response = await fetch('/api/portfolio/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: mappedData }),
      });

      if (response.ok) {
        const result = await response.json();
        setImportResult(result);
        if (result.results.failed === 0) {
          success('Assets imported successfully');
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        error('Failed to import assets');
      }
    } catch (err) {
      console.error('Error importing assets:', err);
      error('Failed to import assets');
    } finally {
      setLoading(false);
    }
  };

  const requiredFields = ['platform', 'assetType', 'name', 'units', 'buyPrice', 'currency', 'purchaseDate'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Import Assets from CSV</h2>

          {step === 'upload' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV file with your asset data. The file should include columns for
                  platform, asset type, name, units, buy price, currency, and purchase date.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Map your CSV columns to the required fields. Fields marked with * are required.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(columnMapping).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      {requiredFields.includes(field) && ' *'}
                    </label>
                    <select
                      value={columnMapping[field as keyof typeof columnMapping]}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select column</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1"
                  disabled={!requiredFields.every((field) => columnMapping[field as keyof typeof columnMapping])}
                >
                  Preview
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep('upload')} className="flex-1">
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && !importResult && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Preview of {csvData.length} assets to be imported:
              </p>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Platform</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Units</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{row[columnMapping.name]}</td>
                        <td className="px-4 py-2 text-sm">{row[columnMapping.platform]}</td>
                        <td className="px-4 py-2 text-sm">{row[columnMapping.assetType]}</td>
                        <td className="px-4 py-2 text-sm">{row[columnMapping.units]}</td>
                        <td className="px-4 py-2 text-sm">{row[columnMapping.buyPrice]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 10 of {csvData.length} rows
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={handleImport} isLoading={loading} className="flex-1">
                  Import Assets
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep('mapping')} className="flex-1">
                  Back
                </Button>
              </div>
            </div>
          )}

          {importResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${importResult.results.failed === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className="font-medium">
                  {importResult.message}
                </p>
                {importResult.results.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-2">Errors:</p>
                    <ul className="text-sm space-y-1">
                      {importResult.results.errors.map((error: any, index: number) => (
                        <li key={index}>
                          Row {error.row}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button type="button" onClick={onSuccess} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
