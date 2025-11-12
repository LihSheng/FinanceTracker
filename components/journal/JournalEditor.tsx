'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { EmotionalTagSelector } from './EmotionalTagSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

interface JournalEditorProps {
  entry?: {
    id: string;
    title: string;
    content: string;
    emotionTags: string[];
    tradeType?: string;
    outcome?: string;
    date: Date | string;
    assetId?: string;
  };
  assets?: Array<{
    id: string;
    name: string;
    ticker?: string;
    platform: string;
  }>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function JournalEditor({ entry, assets = [], onSave, onCancel }: JournalEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [emotionTags, setEmotionTags] = useState<string[]>(entry?.emotionTags || []);
  const [tradeType, setTradeType] = useState<string>(entry?.tradeType || '');
  const [outcome, setOutcome] = useState<string>(entry?.outcome || '');
  const [date, setDate] = useState(
    entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [assetId, setAssetId] = useState(entry?.assetId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        title,
        content,
        emotionTags,
        tradeType: tradeType || undefined,
        outcome: outcome || undefined,
        date,
        assetId: assetId || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{entry ? 'Edit Journal Entry' : 'New Journal Entry'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {assets.length > 0 && (
            <div>
              <Label htmlFor="asset">Related Asset (Optional)</Label>
              <Select
                id="asset"
                value={assetId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssetId(e.target.value)}
              >
                <option value="">None</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} {asset.ticker && `(${asset.ticker})`} - {asset.platform}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="tradeType">Trade Type (Optional)</Label>
            <Select
              id="tradeType"
              value={tradeType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTradeType(e.target.value)}
            >
              <option value="">None</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="hold">Hold</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="outcome">Outcome (Optional)</Label>
            <Select
              id="outcome"
              value={outcome}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOutcome(e.target.value)}
            >
              <option value="">None</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="neutral">Neutral</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, analysis, and reflections..."
              rows={8}
              required
            />
          </div>

          <EmotionalTagSelector selectedTags={emotionTags} onChange={setEmotionTags} />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entry ? 'Update' : 'Create'} Entry
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
