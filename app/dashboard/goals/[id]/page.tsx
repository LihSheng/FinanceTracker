'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { GoalDetailView } from '@/components/goals/GoalDetailView';
import { ContributionDialog } from '@/components/goals/ContributionDialog';
import { useToast } from '@/lib/hooks/useToast';

interface Goal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: Date | null;
  monthlyContribution: number | null;
  expectedReturn: number | null;
  progressPercent: number;
  remainingAmount: number;
  projectedCompletionDate: Date | null;
  isOnTrack: boolean;
  monthsRemaining: number | null;
}

interface Contribution {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

interface Asset {
  id: string;
  name: string;
  ticker?: string;
  currentPrice?: number;
  buyPrice: number;
  units: number;
  currency: string;
  purchaseDate: string;
}

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoalDetails();
  }, [params.id]);

  const fetchGoalDetails = async () => {
    try {
      const response = await fetch(`/api/goals/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Error',
            description: 'Goal not found',
            variant: 'destructive',
          });
          router.push('/dashboard/goals');
          return;
        }
        throw new Error('Failed to fetch goal details');
      }

      const data = await response.json();
      setGoal(data);
      setContributions(data.contributions || []);
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goal details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContribution = async (data: any) => {
    try {
      const response = await fetch(`/api/goals/${params.id}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to add contribution');

      toast({
        title: 'Success',
        description: 'Contribution added successfully',
      });

      fetchGoalDetails();
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contribution',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold">Goal not found</h3>
        <Button onClick={() => router.push('/dashboard/goals')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/goals')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goals
      </Button>

      <GoalDetailView
        goal={goal}
        contributions={contributions}
        assets={assets}
        onAddContribution={() => setIsContributionDialogOpen(true)}
      />

      <ContributionDialog
        open={isContributionDialogOpen}
        onClose={() => setIsContributionDialogOpen(false)}
        onSubmit={handleAddContribution}
        goalName={goal.name}
        currency={goal.currency}
      />
    </div>
  );
}
