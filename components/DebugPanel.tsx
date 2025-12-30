'use client';

import { useState, useEffect } from 'react';
import { Bug, Calendar, Plus, Trash2, Zap, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  isDebugMode, 
  setDebugMode, 
  getDebugDate, 
  setDebugDate, 
  resetDebugDate,
  addDebugCompletion,
  addDebugStreak,
  addDebugHabit,
  getDebugInfo
} from '@/lib/debugUtils';
import { formatToISODate } from '@/lib/timeUtils';
import { addDays, subDays } from 'date-fns';
import { Habit } from '@/lib/types';

interface DebugPanelProps {
  habits: Habit[];
  onRefresh: () => void;
}

export default function DebugPanel({ habits, onRefresh }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(getDebugInfo());
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [customDate, setCustomDate] = useState(formatToISODate(new Date()));
  const [streakDays, setStreakDays] = useState(7);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDaysAgo, setNewHabitDaysAgo] = useState(0);

  useEffect(() => {
    setDebugInfo(getDebugInfo());
  }, []);

  const handleToggleDebugMode = () => {
    setDebugMode(!debugInfo.debugMode);
    setDebugInfo(getDebugInfo());
    onRefresh();
  };

  const handleTimeTravelToday = () => {
    resetDebugDate();
    setDebugInfo(getDebugInfo());
    onRefresh();
  };

  const handleTimeTravelDays = (days: number) => {
    const newDate = addDays(new Date(), days);
    setDebugDate(newDate);
    setDebugInfo(getDebugInfo());
    onRefresh();
  };

  const handleSetCustomDate = (dateStr: string) => {
    const newDate = new Date(dateStr);
    setDebugDate(newDate);
    setCustomDate(dateStr);
    setDebugInfo(getDebugInfo());
    onRefresh();
  };

  const handleAddCompletion = async () => {
    if (!selectedHabit) return;
    try {
      await addDebugCompletion(selectedHabit, customDate, true);
      onRefresh();
    } catch (error) {
      console.error('Failed to add completion:', error);
    }
  };

  const handleAddStreak = async () => {
    if (!selectedHabit) return;
    try {
      const startDate = new Date(customDate);
      await addDebugStreak(selectedHabit, startDate, streakDays);
      onRefresh();
    } catch (error) {
      console.error('Failed to add streak:', error);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      const createdDate = subDays(new Date(), newHabitDaysAgo);
      await addDebugHabit({
        name: newHabitName,
        frequency: 'daily',
        priority: 'medium',
      }, createdDate);
      setNewHabitName('');
      setNewHabitDaysAgo(0);
      onRefresh();
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  };

  if (!isDebugMode()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all"
        title="Debug Panel"
      >
        <Bug className="w-5 h-5" />
        <span className="font-semibold">DEBUG</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-h-[600px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-red-500">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Debug Tools
              </h3>
              <button
                onClick={handleToggleDebugMode}
                className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Exit Debug
              </button>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                <span className="font-bold text-red-600 dark:text-red-400">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Date:</span>
                <span className="font-mono">{debugInfo.currentDebugDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Actual Date:</span>
                <span className="font-mono">{debugInfo.actualDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Difference:</span>
                <span className="font-bold">{debugInfo.daysDifference} days</span>
              </div>
            </div>

            {/* Time Travel */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Travel
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTimeTravelDays(-7)}
                  className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  -7 Days
                </button>
                <button
                  onClick={() => handleTimeTravelDays(-1)}
                  className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  -1 Day
                </button>
                <button
                  onClick={() => handleTimeTravelDays(1)}
                  className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  +1 Day
                </button>
                <button
                  onClick={() => handleTimeTravelDays(7)}
                  className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  +7 Days
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={() => handleSetCustomDate(customDate)}
                  className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Set
                </button>
              </div>
              <button
                onClick={handleTimeTravelToday}
                className="w-full px-3 py-2 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Today
              </button>
            </div>

            {/* Add Completion */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Completion
              </h4>
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select a habit...</option>
                {habits.map(habit => (
                  <option key={habit.id} value={habit.id}>{habit.name}</option>
                ))}
              </select>
              <button
                onClick={handleAddCompletion}
                disabled={!selectedHabit}
                className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Completion for {customDate}
              </button>
            </div>

            {/* Add Streak */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Add Streak
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={streakDays}
                  onChange={(e) => setStreakDays(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Days"
                />
                <button
                  onClick={handleAddStreak}
                  disabled={!selectedHabit}
                  className="flex-1 px-3 py-2 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add {streakDays}-Day Streak
                </button>
              </div>
            </div>

            {/* Add Habit with Custom Date */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Past/Future Habit
              </h4>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name..."
                className="w-full px-3 py-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newHabitDaysAgo}
                  onChange={(e) => setNewHabitDaysAgo(Number(e.target.value))}
                  placeholder="Days ago"
                  className="w-32 px-3 py-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={handleAddHabit}
                  disabled={!newHabitName.trim()}
                  className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Habit
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {newHabitDaysAgo > 0 
                  ? `Created ${formatToISODate(subDays(new Date(), newHabitDaysAgo))}`
                  : 'Created today'
                }
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 p-3 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Debug Mode Active</strong>
              <p className="mt-1">Changes are persistent. Use with caution.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
