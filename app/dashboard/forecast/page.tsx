'use client';

import { useState } from 'react';
import { ForecastGenerator } from '@/components/forecast/ForecastGenerator';
import { ForecastChart } from '@/components/forecast/ForecastChart';
import { ForecastSummary } from '@/components/forecast/ForecastSummary';
import { ForecastParameters, ForecastResult } from '@/lib/utils/forecasting';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Save, Download } from 'lucide-react';
// Simple toast implementation
function useToast() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    // Simple alert for now - can be replaced with a proper toast component
    alert(`${title}${description ? '\n' + description : ''}`);
  };
  return { toast };
}

export default function ForecastPage() {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastParameters, setLastParameters] =
    useState<ForecastParameters | null>(null);
  const [lastForecastName, setLastForecastName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (
    parameters: ForecastParameters,
    name?: string
  ) => {
    setIsLoading(true);
    setLastParameters(parameters);
    setLastForecastName(name || null);

    try {
      const response = await fetch('/api/forecast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters,
          name,
          saveToDatabase: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate forecast');
      }

      const data = await response.json();
      setForecast(data.forecast);

      toast({
        title: 'Forecast Generated',
        description: 'Your financial forecast has been generated successfully.',
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate forecast. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lastParameters) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/forecast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters: lastParameters,
          name: lastForecastName,
          saveToDatabase: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save forecast');
      }

      toast({
        title: 'Forecast Saved',
        description: 'Your forecast has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving forecast:', error);
      toast({
        title: 'Error',
        description: 'Failed to save forecast. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!forecast) return;

    // Create CSV content
    const csvContent = [
      ['Date', 'Projected Income', 'Projected Expenses', 'Projected Balance'],
      ...forecast.projections.map((p) => [
        p.date,
        p.projectedIncome.toFixed(2),
        p.projectedExpenses.toFixed(2),
        p.projectedBalance.toFixed(2),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Forecast Exported',
      description: 'Your forecast has been exported to CSV.',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Forecast</h1>
          <p className="text-muted-foreground">
            Project your future financial position based on historical data
          </p>
        </div>
        {forecast && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Forecast'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Forecast</TabsTrigger>
          {forecast && <TabsTrigger value="results">Results</TabsTrigger>}
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <ForecastGenerator onGenerate={handleGenerate} isLoading={isLoading} />

          {forecast && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Forecast generated successfully. Switch to the Results tab to
                  view detailed projections.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {forecast && (
          <TabsContent value="results" className="space-y-4">
            <ForecastSummary forecast={forecast} />
            <ForecastChart projections={forecast.projections} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
