import InsightsDashboard from '@/components/insights/InsightsDashboard';
import FinancialHealthScore from '@/components/insights/FinancialHealthScore';
import RebalancingRecommendations from '@/components/insights/RebalancingRecommendations';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="mt-2 text-gray-600">
          Get personalized financial insights and recommendations powered by AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialHealthScore />
        <RebalancingRecommendations />
      </div>

      <InsightsDashboard />
    </div>
  );
}
