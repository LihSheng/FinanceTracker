import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function StatisticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-1">View your financial analytics</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Financial Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Statistics and charts coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
