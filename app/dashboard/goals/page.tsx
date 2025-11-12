'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalCreator } from '@/components/goals/GoalCreator';
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

export default function GoalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (data: any) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create goal');

      toast({
        title: 'Success',
        description: 'Goal created successfully',
      });

      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateGoal = async (data: any) => {
    if (!editingGoal) return;

    try {
      const response = await fetch(`/api/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update goal');

      toast({
        title: 'Success',
        description: 'Goal updated successfully',
      });

      fetchGoals();
      setEditingGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete goal');

      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });

      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  const handleAddContribution = async (data: any) => {
    if (!selectedGoalForContribution) return;

    try {
      const response = await fetch(
        `/api/goals/${selectedGoalForContribution.id}/contributions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error('Failed to add contribution');

      toast({
        title: 'Success',
        description: 'Contribution added successfully',
      });

      fetchGoals();
      setSelectedGoalForContribution(null);
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

  const handleEditGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setEditingGoal(goal);
      setIsCreatorOpen(true);
    }
  };

  const handleViewDetails = (goalId: string) => {
    router.push(`/dashboard/goals/${goalId}`);
  };

  const handleOpenContributionDialog = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoalForContribution(goal);
      setIsContributionDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress toward your financial milestones
          </p>
        </div>
        <Button onClick={() => setIsCreatorOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">No goals yet</h3>
          <p className="text-muted-foreground mt-2">
            Start by creating your first financial goal
          </p>
          <Button onClick={() => setIsCreatorOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onAddContribution={handleOpenContributionDialog}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <GoalCreator
        open={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        initialData={editingGoal}
        isEditing={!!editingGoal}
      />

      {selectedGoalForContribution && (
        <ContributionDialog
          open={isContributionDialogOpen}
          onClose={() => {
            setIsContributionDialogOpen(false);
            setSelectedGoalForContribution(null);
          }}
          onSubmit={handleAddContribution}
          goalName={selectedGoalForContribution.name}
          currency={selectedGoalForContribution.currency}
        />
      )}
    </div>
  );
}
