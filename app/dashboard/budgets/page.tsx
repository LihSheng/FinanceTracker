import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function BudgetsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <p className="text-gray-600 mt-1">Manage your budget allocations</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Budget management coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
