import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PortfolioPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-gray-600 mt-1">Track your investments and assets</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Portfolio management coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
