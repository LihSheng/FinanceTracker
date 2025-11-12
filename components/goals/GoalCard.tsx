'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Edit, Plus, TrendingUp, Calendar, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';

interface GoalCardProps {
  goal: {
    id: string;
    name: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    targetDate: Date | null;
    progressPercent: number;
    remainingAmount: number;
    projectedCompletionDate: Date | null;
    isOnTrack: boolean;
    monthsRemaining: number | null;
  };
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onAddContribution: (goalId: string) => void;
  onViewDetails: (goalId: string) => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onAddContribution,
  onViewDetails,
}: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${goal.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(goal.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: goal.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{goal.category}</p>
          </div>
          <Badge variant={goal.isOnTrack ? 'default' : 'destructive'}>
            {goal.isOnTrack ? 'On Track' : 'Behind'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{goal.progressPercent}%</span>
          </div>
          <Progress value={goal.progressPercent} className="h-2" />
          
          {/* Milestone Indicators */}
          <div className="flex justify-between pt-1">
            {[25, 50, 75, 100].map((milestone) => {
              const isReached = goal.progressPercent >= milestone;
              return (
                <div
                  key={milestone}
                  className={`text-xs ${
                    isReached ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {milestone === goal.progressPercent && '●'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-sm font-semibold">{formatCurrency(goal.currentAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-semibold">{formatCurrency(goal.targetAmount)}</p>
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Remaining:</span>
          <span className="font-medium">{formatCurrency(goal.remainingAmount)}</span>
        </div>

        {/* Target Date */}
        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">
              {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
            </span>
            {goal.monthsRemaining !== null && (
              <span className="text-muted-foreground">
                ({goal.monthsRemaining} months)
              </span>
            )}
          </div>
        )}

        {/* Projected Completion */}
        {goal.projectedCompletionDate && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Projected:</span>
            <span className="font-medium">
              {format(new Date(goal.projectedCompletionDate), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(goal.id)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddContribution(goal.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(goal.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
