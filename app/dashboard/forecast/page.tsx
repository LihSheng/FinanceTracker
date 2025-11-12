import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ForecastPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Forecast</h1>
        <p className="text-gray-600 mt-1">Project your future financial position</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Financial Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Forecasting tools coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
