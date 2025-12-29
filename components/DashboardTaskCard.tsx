'use client';

import { useState, useEffect } from 'react';
import { Habit, Stats, HabitCompletion } from '@/lib/types';
import { Clock, Flame, CheckCircle2, Pin } from 'lucide-react';
import { formatTimeEstimate } from '@/lib/timeUtils';
import PriorityBadge from './ui/PriorityBadge';
import { getHabitStats } from '@/lib/stats';

interface DashboardTaskCardProps {
  habit: Habit;
  onToggle: () => void;
  isPinned: boolean;
  isCompleted: boolean;
  allCompletions?: HabitCompletion[];
}

export default function DashboardTaskCard({ habit, onToggle, isPinned, isCompleted, allCompletions }: DashboardTaskCardProps) {
  const [stats, setStats] = useState<Stats>({ totalCompletions: 0, currentStreak: 0, longestStreak: 0, completionRate: 0 });
  const timeDisplay = habit.timeEstimate ? formatTimeEstimate(habit.timeEstimate) : null;
  
  useEffect(() => {
    const loadStats = async () => {
      const habitStats = await getHabitStats(habit.id, allCompletions);
      setStats(habitStats);
    };
    loadStats();
  }, [habit.id, allCompletions]);

  return (
    <div className="relative group">
      <div className={`card p-5 hover:shadow-lg transition-all duration-300 border-2 ${
        isCompleted 
          ? 'opacity-60 bg-ocean-50/50 dark:bg-ocean-900/20 border-ocean-300 dark:border-ocean-700' 
          : 'border-transparent hover:border-ocean-300 dark:hover:border-ocean-700'
      }`}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 ${
              isCompleted
                ? 'bg-ocean-500 dark:bg-ocean-600 border-3 border-ocean-500 dark:border-ocean-600'
                : 'border-3 border-ocean-400 dark:border-ocean-600 hover:border-ocean-500 dark:hover:border-ocean-500'
            }`}
            aria-label="Complete task"
          >
            <CheckCircle2 className={`w-5 h-5 transition-opacity ${
              isCompleted 
                ? 'text-white opacity-100' 
                : 'text-ocean-400 dark:text-ocean-600 opacity-0 group-hover:opacity-100'
            }`} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-semibold text-lg ${
                isCompleted 
                  ? 'text-ocean-600 dark:text-dark-text-secondary line-through' 
                  : 'text-ocean-900 dark:text-dark-text-primary'
              }`}>
                {habit.name}
              </h3>
              {isPinned && (
                <Pin className="w-4 h-4 text-ocean-500 dark:text-ocean-400 flex-shrink-0" fill="currentColor" />
              )}
            </div>

            {habit.description && (
              <p className="text-sm text-ocean-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
                {habit.description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {habit.priority && <PriorityBadge priority={habit.priority} />}
              
              {timeDisplay && (
                <span className="px-3 py-1 rounded-full bg-ocean-100 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300 text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {timeDisplay}
                </span>
              )}

              {stats.currentStreak > 0 && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
