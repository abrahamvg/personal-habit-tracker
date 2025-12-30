'use client';

import { Habit, Category } from '@/lib/types';
import { Zap, Target, Clock } from 'lucide-react';
import { timeEstimateToMinutes } from '@/lib/timeUtils';
import { getCategoryColor } from '@/lib/colors';
import HabitCard from './HabitCard';

interface FocusModeViewProps {
  habits: Habit[];
  categories: Category[];
  completions: Map<string, boolean>;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onStartTimer?: (habit: Habit) => void;
  onSubtaskToggle: (habitId: string, subtaskId: string) => void;
  onPin: (habitId: string) => void;
  onArchive: (habitId: string) => void;
}

export default function FocusModeView({
  habits,
  categories,
  completions,
  onToggle,
  onDelete,
  onEdit,
  onStartTimer,
  onSubtaskToggle,
  onPin,
  onArchive,
}: FocusModeViewProps) {
  // Use the habits passed in (already filtered by getDashboardHabits algorithm)
  const focusHabits = habits;

  const totalTimeMinutes = focusHabits.reduce((sum, h) => {
    return sum + timeEstimateToMinutes(h.timeEstimate || '15min');
  }, 0);

  return (
    <div className="space-y-6">
      {/* Focus Mode - Ocean themed */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-ocean-50 via-ocean-100 to-ocean-200 dark:from-dark-card dark:via-dark-card dark:to-dark-hover border-2 border-ocean-300 dark:border-dark-border rounded-2xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-2xl shadow-md">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary">Focus Mode</h2>
            <p className="text-sm text-ocean-600 dark:text-dark-text-secondary">One task at a time. You've got this!</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 p-4 bg-white/80 dark:bg-dark-hover/80 backdrop-blur rounded-xl border border-ocean-200 dark:border-dark-border">
            <div className="p-2 bg-ocean-100 dark:bg-ocean-700/30 rounded-lg">
              <Target className="w-5 h-5 text-ocean-600 dark:text-ocean-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary">{focusHabits.length}</p>
              <p className="text-xs text-ocean-500 dark:text-dark-text-tertiary">Focus tasks</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-4 bg-white/80 dark:bg-dark-hover/80 backdrop-blur rounded-xl border border-ocean-200 dark:border-dark-border">
            <div className="p-2 bg-ocean-100 dark:bg-ocean-700/30 rounded-lg">
              <Clock className="w-5 h-5 text-ocean-600 dark:text-ocean-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary">~{totalTimeMinutes}</p>
              <p className="text-xs text-ocean-500 dark:text-dark-text-tertiary">Minutes total</p>
            </div>
          </div>
        </div>

        {focusHabits.length === 0 ? (
          <div className="text-center py-12 bg-white/60 dark:bg-dark-hover/60 backdrop-blur rounded-2xl">
            <div className="text-7xl mb-4">🌊</div>
            <p className="text-xl font-bold text-ocean-800 dark:text-dark-text-primary">All focus tasks done!</p>
            <p className="text-sm text-ocean-600 dark:text-dark-text-secondary mt-2">Smooth sailing! Take a well-deserved break.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {focusHabits.map((habit) => {
              const category = categories.find(c => c.id === habit.category);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={() => onToggle(habit.id)}
                  onDelete={() => onDelete(habit.id)}
                  onEdit={() => onEdit(habit)}
                  onStartTimer={onStartTimer ? () => onStartTimer(habit) : undefined}
                  onSubtaskToggle={(subtaskId) => onSubtaskToggle(habit.id, subtaskId)}
                  onPin={() => onPin(habit.id)}
                  onArchive={() => onArchive(habit.id)}
                  isCompleted={false}
                  categoryColor={category ? getCategoryColor(category.id, habits, categories) : undefined}
                  categoryName={category?.name}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Quick tip - Ocean themed */}
      <div className="card p-5 bg-gradient-to-r from-ocean-50 to-ocean-100 dark:from-dark-hover dark:to-dark-card border border-ocean-200 dark:border-dark-border rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-ocean-200 dark:bg-dark-border rounded-lg flex-shrink-0">
            <span className="text-lg">🌊</span>
          </div>
          <div>
            <p className="font-semibold text-ocean-800 dark:text-dark-text-primary mb-1">Stay in the Flow</p>
            <p className="text-sm text-ocean-600 dark:text-dark-text-secondary leading-relaxed">
              One task at a time. Break big tasks into smaller steps. 
              Progress over perfection!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
