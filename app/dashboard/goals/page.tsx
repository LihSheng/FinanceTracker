import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function GoalsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
        <p className="text-gray-600 mt-1">Set and track your financial goals</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Goal tracking coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
