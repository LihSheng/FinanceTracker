'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { JournalEntry } from '@/components/journal/JournalEntry';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { JournalAnalytics } from '@/components/journal/JournalAnalytics';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
    fetchAnalytics();
    fetchAssets();
  }, []);

  const fetchEntries = async (filters?: any) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.emotionTag) params.append('emotionTag', filters.emotionTag);
      if (filters?.outcome) params.append('outcome', filters.outcome);

      const response = await fetch(`/api/journal/entries?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch journal entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/journal/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/portfolio/assets');
      if (!response.ok) throw new Error('Failed to fetch assets');
      
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const url = editingEntry
        ? `/api/journal/entries/${editingEntry.id}`
        : '/api/journal/entries';
      
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save entry');

      toast({
        title: 'Success',
        description: `Journal entry ${editingEntry ? 'updated' : 'created'} successfully`,
      });

      setIsEditing(false);
      setEditingEntry(null);
      fetchEntries();
      fetchAnalytics();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save journal entry',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setEditingEntry(entry);
      setIsEditing(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      const response = await fetch(`/api/journal/entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      toast({
        title: 'Success',
        description: 'Journal entry deleted successfully',
      });

      fetchEntries();
      fetchAnalytics();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete journal entry',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    fetchEntries({
      search: searchTerm,
      emotionTag: filterEmotion,
      outcome: filterOutcome,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto py-6">
        <JournalEditor
          entry={editingEntry}
          assets={assets}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setEditingEntry(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Journal</h1>
          <p className="text-muted-foreground">
            Track your investment decisions and learn from your experiences
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Entries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select
              value={filterEmotion}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterEmotion(e.target.value)}
              className="w-[180px]"
            >
              <option value="">All emotions</option>
              <option value="confident">Confident</option>
              <option value="uncertain">Uncertain</option>
              <option value="FOMO">FOMO</option>
              <option value="fearful">Fearful</option>
              <option value="excited">Excited</option>
              <option value="anxious">Anxious</option>
            </Select>
            <Select
              value={filterOutcome}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterOutcome(e.target.value)}
              className="w-[180px]"
            >
              <option value="">All outcomes</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="neutral">Neutral</option>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No journal entries yet</p>
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {analytics ? (
            <JournalAnalytics analytics={analytics} />
          ) : (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
