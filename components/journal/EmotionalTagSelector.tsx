'use client';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

const EMOTION_OPTIONS = [
  'confident',
  'uncertain',
  'FOMO',
  'fearful',
  'excited',
  'anxious',
  'optimistic',
  'pessimistic',
  'greedy',
  'cautious',
  'patient',
  'impulsive',
];

interface EmotionalTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function EmotionalTagSelector({ selectedTags, onChange }: EmotionalTagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Emotional Tags</label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_OPTIONS.map((emotion) => (
            <Button
              key={emotion}
              type="button"
              variant={selectedTags.includes(emotion) ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleTag(emotion)}
              className="text-xs"
            >
              {emotion}
            </Button>
          ))}
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Selected Tags</label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
