'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntryProps {
  entry: {
    id: string;
    title: string;
    content: string;
    emotionTags: string[];
    tradeType?: string;
    outcome?: string;
    date: Date | string;
    asset?: {
      id: string;
      name: string;
      ticker?: string;
      platform: string;
    };
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function JournalEntry({ entry, onEdit, onDelete }: JournalEntryProps) {
  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failure':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTradeTypeColor = (tradeType?: string) => {
    switch (tradeType) {
      case 'buy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sell':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'hold':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{entry.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(entry.date), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entry.asset && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Asset:</span>
              <span>
                {entry.asset.name} {entry.asset.ticker && `(${entry.asset.ticker})`}
              </span>
              <Badge variant="outline" className="text-xs">
                {entry.asset.platform}
              </Badge>
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm">{entry.content}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {entry.tradeType && (
              <Badge className={getTradeTypeColor(entry.tradeType)}>
                {entry.tradeType.toUpperCase()}
              </Badge>
            )}
            {entry.outcome && (
              <Badge className={getOutcomeColor(entry.outcome)}>
                {entry.outcome === 'success' && <TrendingUp className="h-3 w-3 mr-1" />}
                {entry.outcome === 'failure' && <TrendingDown className="h-3 w-3 mr-1" />}
                {entry.outcome.charAt(0).toUpperCase() + entry.outcome.slice(1)}
              </Badge>
            )}
            {entry.emotionTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
