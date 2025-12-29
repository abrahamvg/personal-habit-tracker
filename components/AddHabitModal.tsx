'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FrequencyType, Category } from '@/lib/types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: {
    name: string;
    description?: string;
    category?: string;
    frequency: FrequencyType;
  }) => void;
  categories: Category[];
  editData?: {
    name: string;
    description?: string;
    category?: string;
    frequency: FrequencyType;
  };
}

export default function AddHabitModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  categories,
  editData 
}: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description || '');
      setCategory(editData.category || '');
      setFrequency(editData.frequency);
    } else {
      setName('');
      setDescription('');
      setCategory('');
      setFrequency('daily');
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
      frequency,
    });

    setName('');
    setDescription('');
    setCategory('');
    setFrequency('daily');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-sand-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-sand-900">
            {editData ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sand-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-sand-800 mb-1.5">
              Habit Name*
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Morning workout"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-sand-800 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-sand-800 mb-1.5">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-800 mb-2">
              Frequency*
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  frequency === 'daily'
                    ? 'bg-sand-700 text-beige-50'
                    : 'bg-beige-200 text-sand-800 hover:bg-beige-300'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  frequency === 'weekly'
                    ? 'bg-sand-700 text-beige-50'
                    : 'bg-beige-200 text-sand-800 hover:bg-beige-300'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Action buttons - visually separated */}
          <div className="mt-6 pt-6 border-t border-sand-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 shadow-md"
            >
              {editData ? 'Update Habit' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
