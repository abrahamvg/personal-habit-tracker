'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { formatTimeEstimate } from '@/lib/timeUtils';
import { FrequencyType, Category, PriorityType, TimeEstimate, Subtask } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { getPriorityButtonClasses, getPriorityLabel } from '@/lib/priorityUtils';
import CustomTimeInput from './ui/CustomTimeInput';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: {
    name: string;
    description?: string;
    category?: string;
    frequency: FrequencyType;
    priority?: PriorityType;
    timeEstimate?: TimeEstimate;
    subtasks?: Subtask[];
  }) => void;
  categories: Category[];
  editData?: {
    name: string;
    description?: string;
    category?: string;
    frequency: FrequencyType;
    priority?: PriorityType;
    timeEstimate?: TimeEstimate;
    subtasks?: Subtask[];
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
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate>('15min');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description || '');
      setCategory(editData.category || '');
      setFrequency(editData.frequency);
      setPriority(editData.priority || 'medium');
      
      const time = editData.timeEstimate || '15min';
      // Check if it's a custom time format (HH:MM)
      if (time.includes(':')) {
        const [hrs, mins] = time.split(':').map(Number);
        setUseCustomTime(true);
        setCustomHours(hrs);
        setCustomMinutes(mins);
        setTimeEstimate(time);
      } else {
        setUseCustomTime(false);
        setTimeEstimate(time);
      }
      
      setSubtasks(editData.subtasks || []);
    } else {
      setName('');
      setDescription('');
      setCategory('');
      setFrequency('daily');
      setPriority('medium');
      setTimeEstimate('15min');
      setSubtasks([]);
      setUseCustomTime(false);
      setCustomHours(0);
      setCustomMinutes(25);
    }
    setNewSubtaskName('');
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Format time estimate based on mode
    const finalTimeEstimate = useCustomTime
      ? `${customHours.toString().padStart(2, '0')}:${customMinutes.toString().padStart(2, '0')}`
      : timeEstimate;

    onAdd({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
      frequency,
      priority,
      timeEstimate: finalTimeEstimate,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });

    setName('');
    setDescription('');
    setCategory('');
    setFrequency('daily');
    setSubtasks([]);
    setNewSubtaskName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ocean-900/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-0 animate-in fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 dark:from-ocean-700 dark:to-ocean-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {editData ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-ocean-100 text-sm mt-1">
            {editData ? 'Update your habit details' : 'Build better habits, one step at a time'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Habit Name - Most important field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-ocean-800 dark:text-dark-text-primary mb-2">
              What habit do you want to build?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input text-lg"
              placeholder="e.g., Morning meditation"
              required
              autoFocus
            />
          </div>

          {/* Two column layout for Category and Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input text-sm py-2"
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
              <label className="block text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary mb-1.5 uppercase tracking-wide">
                Frequency
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                    frequency === 'daily'
                      ? 'bg-ocean-500 dark:bg-ocean-600 text-white'
                      : 'bg-ocean-100 dark:bg-dark-hover text-ocean-700 dark:text-dark-text-primary hover:bg-ocean-200 dark:hover:bg-dark-border'
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                    frequency === 'weekly'
                      ? 'bg-ocean-500 dark:bg-ocean-600 text-white'
                      : 'bg-ocean-100 dark:bg-dark-hover text-ocean-700 dark:text-dark-text-primary hover:bg-ocean-200 dark:hover:bg-dark-border'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Priority & Time - Compact row layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority - Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary mb-1.5 uppercase tracking-wide">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className="input text-sm py-2"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            {/* Time Estimate - Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary mb-1.5 uppercase tracking-wide">
                Duration
              </label>
              {!useCustomTime ? (
                <div className="flex gap-1">
                  <select
                    value={timeEstimate}
                    onChange={(e) => setTimeEstimate(e.target.value as TimeEstimate)}
                    className="input text-sm py-2 flex-1"
                  >
                    <option value="5min">5 min</option>
                    <option value="15min">15 min</option>
                    <option value="30min">30 min</option>
                    <option value="1hr">1 hour</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomTime(true)}
                    className="px-2 text-ocean-500 hover:text-ocean-700 dark:text-ocean-300 text-xs"
                    title="Set custom time"
                  >
                    ⏱️
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <CustomTimeInput
                    hours={customHours}
                    minutes={customMinutes}
                    onHoursChange={setCustomHours}
                    onMinutesChange={setCustomMinutes}
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomTime(false)}
                    className="text-xs text-ocean-500 hover:text-ocean-700 dark:text-ocean-300"
                  >
                    Use presets
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks - Collapsible section */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-ocean-700 dark:text-dark-text-secondary hover:text-ocean-800 dark:hover:text-dark-text-primary">
              <span>Add Subtasks (optional)</span>
              <span className="text-xs bg-ocean-100 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                {subtasks.length > 0 ? `${subtasks.length} added` : 'Break it down'}
              </span>
            </summary>
            
            <div className="mt-3 space-y-2">
              {/* Add subtask input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSubtaskName.trim()) {
                        setSubtasks([...subtasks, { 
                          id: generateId(), 
                          name: newSubtaskName.trim(), 
                          completed: false 
                        }]);
                        setNewSubtaskName('');
                      }
                    }
                  }}
                  placeholder="Add a small step..."
                  className="input flex-1 text-sm py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSubtaskName.trim()) {
                      setSubtasks([...subtasks, { 
                        id: generateId(), 
                        name: newSubtaskName.trim(), 
                        completed: false 
                      }]);
                      setNewSubtaskName('');
                    }
                  }}
                  className="p-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-colors"
                  title="Add subtask"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Subtasks list */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {subtasks.map((subtask, index) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 p-2 bg-ocean-50 dark:bg-dark-hover rounded-lg"
                    >
                      <span className="w-5 h-5 flex items-center justify-center bg-ocean-200 dark:bg-ocean-700 rounded text-xs font-medium text-ocean-700 dark:text-ocean-200">
                        {index + 1}
                      </span>
                      <span className="text-sm text-ocean-800 dark:text-dark-text-primary truncate flex-1">
                        {subtask.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter(st => st.id !== subtask.id))}
                        className="p-1 hover:bg-ocean-200 dark:hover:bg-dark-border rounded transition-colors"
                        title="Remove subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-ocean-500 dark:text-dark-text-tertiary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>

          {/* Description - Optional, at the bottom */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-ocean-700 dark:text-dark-text-secondary hover:text-ocean-800 dark:hover:text-dark-text-primary">
              <span>Add Description (optional)</span>
            </summary>
            <div className="mt-3">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none text-sm"
                rows={2}
                placeholder="Any notes or details..."
              />
            </div>
          </details>
        </form>

        {/* Action buttons - Fixed at bottom */}
        <div className="px-6 py-4 bg-ocean-50/50 dark:bg-dark-hover/50 border-t border-ocean-200 dark:border-dark-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="habit-form"
            onClick={handleSubmit}
            className="btn btn-primary flex-1 shadow-md"
          >
            {editData ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}
