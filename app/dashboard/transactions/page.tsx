import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TransactionsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Track your income and expenses</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Transaction tracking coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
