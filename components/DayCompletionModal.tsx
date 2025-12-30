'use client';

import { Habit, HabitCompletion } from '@/lib/types';
import { format } from 'date-fns';
import { X, CheckCircle2, Calendar } from 'lucide-react';
import Modal from './ui/Modal';

interface DayCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  habits: Habit[];
  completions: HabitCompletion[];
}

export default function DayCompletionModal({
  isOpen,
  onClose,
  date,
  habits,
  completions,
}: DayCompletionModalProps) {
  const dateObj = new Date(date);
  const formattedDate = format(dateObj, 'MMMM d, yyyy');
  const dayOfWeek = format(dateObj, 'EEEE');

  // Get habits that existed on this date
  const existingHabits = habits.filter(habit => {
    const habitCreatedDate = habit.createdAt
      ? new Date(habit.createdAt).toISOString().split('T')[0]
      : '1970-01-01';
    return date >= habitCreatedDate;
  });

  // Get completed habits for this date
  const completedHabits = existingHabits.filter(habit => {
    const completion = completions.find(
      c => c.habitId === habit.id && c.date === date && c.completed
    );
    return completion !== undefined;
  });

  const totalHabits = existingHabits.length;
  const completedCount = completedHabits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary">
                {dayOfWeek}
              </h2>
              <p className="text-sm text-ocean-600 dark:text-dark-text-secondary">
                {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ocean-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-ocean-600 dark:text-dark-text-secondary" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 p-4 bg-ocean-50 dark:bg-dark-hover rounded-xl">
          <div className="flex-1">
            <p className="text-3xl font-bold text-ocean-800 dark:text-dark-text-primary">
              {completedCount}/{totalHabits}
            </p>
            <p className="text-sm text-ocean-600 dark:text-dark-text-secondary">
              Habits completed
            </p>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-ocean-800 dark:text-dark-text-primary">
              {completionRate}%
            </p>
            <p className="text-sm text-ocean-600 dark:text-dark-text-secondary">
              Completion rate
            </p>
          </div>
        </div>

        {/* Completed Habits List */}
        {completedCount > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-ocean-800 dark:text-dark-text-primary mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-ocean-500" />
              Completed Habits ({completedCount})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {completedHabits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-3 bg-ocean-50 dark:bg-dark-hover rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-ocean-500 dark:text-ocean-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ocean-800 dark:text-dark-text-primary">
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-sm text-ocean-600 dark:text-dark-text-secondary truncate">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-ocean-600 dark:text-dark-text-secondary">
              No habits were completed on this day
            </p>
          </div>
        )}

        {/* Incomplete Habits (if any) */}
        {totalHabits > completedCount && (
          <div>
            <h3 className="text-lg font-semibold text-ocean-800 dark:text-dark-text-primary mb-3">
              Incomplete ({totalHabits - completedCount})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {existingHabits
                .filter(h => !completedHabits.find(ch => ch.id === h.id))
                .map(habit => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 bg-beige-100 dark:bg-dark-card rounded-lg opacity-60"
                  >
                    <div className="w-5 h-5 border-2 border-ocean-300 dark:border-dark-border rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ocean-700 dark:text-dark-text-secondary">
                        {habit.name}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
