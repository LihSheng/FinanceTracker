'use client';

import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AddAssetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Goal {
  id: string;
  name: string;
}

export default function AddAssetForm({ onSuccess, onCancel }: AddAssetFormProps) {
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formData, setFormData] = useState({
    platform: '',
    assetType: 'stock',
    ticker: '',
    name: '',
    units: '',
    buyPrice: '',
    currentPrice: '',
    currency: 'MYR',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    goalId: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/portfolio/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          units: parseFloat(formData.units),
          buyPrice: parseFloat(formData.buyPrice),
          currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined,
          goalId: formData.goalId || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add asset');
      }
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const platforms = [
    'StashAway',
    'moomoo',
    'Versa',
    'Interactive Brokers',
    'Binance',
    'Coinbase',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Add New Asset</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Platform *</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asset Type *</label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="gold">Gold</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ticker/Symbol</label>
                <Input
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleChange}
                  placeholder="e.g., AAPL, BTC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asset Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Apple Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Units *</label>
                <Input
                  name="units"
                  type="number"
                  step="0.00000001"
                  value={formData.units}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Buy Price *</label>
                <Input
                  name="buyPrice"
                  type="number"
                  step="0.01"
                  value={formData.buyPrice}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Current Price</label>
                <Input
                  name="currentPrice"
                  type="number"
                  step="0.01"
                  value={formData.currentPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Currency *</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MYR">MYR</option>
                  <option value="SGD">SGD</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date *</label>
                <Input
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link to Goal</label>
                <select
                  name="goalId"
                  value={formData.goalId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No goal</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={loading} className="flex-1">
                Add Asset
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
