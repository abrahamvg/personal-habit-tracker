'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Habit, Category } from '@/lib/types';
import { Archive, ArrowLeft, Inbox } from 'lucide-react';
import { useHabitStore } from '@/lib/store';
import { getHabitColor, getCategoryColor } from '@/lib/colors';
import { formatToISODate } from '@/lib/timeUtils';
import HabitCard from '@/components/HabitCard';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function ArchivedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const {
    habits: allHabits,
    categories,
    loading: dataLoading,
    initialized,
    initialize,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    toggleSubtask,
    toggleArchive,
    getCompletionMap,
  } = useHabitStore();
  
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const today = formatToISODate(new Date());

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/');
      return;
    }
    
    if (user && !initialized && !dataLoading) {
      initialize();
    }
  }, [user, authLoading, initialized, dataLoading, initialize, router]);

  const archivedHabits = allHabits.filter(h => h.archived);
  const completions = getCompletionMap(today);

  const handleToggleHabit = async (habitId: string, date: string = today) => {
    try {
      await toggleCompletion(habitId, date);
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm('Are you sure you want to permanently delete this habit?')) {
      try {
        await deleteHabit(habitId);
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleSubtaskToggle = async (habitId: string, subtaskId: string) => {
    try {
      await toggleSubtask(habitId, subtaskId);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleArchiveToggle = async (habitId: string) => {
    try {
      await toggleArchive(habitId);
    } catch (error) {
      console.error('Error unarchiving habit:', error);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-beige-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ocean-600 dark:text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 dark:bg-dark-bg">
      {/* Header */}
      <header className="bg-ocean-50 dark:bg-dark-card border-b border-ocean-200 dark:border-dark-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg hover:bg-ocean-100 dark:hover:bg-dark-hover transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5 text-ocean-600 dark:text-dark-text-secondary" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-ocean-800 dark:text-dark-text-primary flex items-center gap-2">
                  <Archive className="w-6 h-6 text-ocean-500" />
                  Archived Habits
                </h1>
                <p className="text-sm text-ocean-600 dark:text-dark-text-secondary mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Info Card */}
          <div className="card p-5 bg-gradient-to-r from-ocean-50 to-ocean-100 dark:from-dark-hover dark:to-dark-card border border-ocean-200 dark:border-dark-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-ocean-200 dark:bg-dark-border rounded-lg flex-shrink-0">
                <Archive className="w-5 h-5 text-ocean-700 dark:text-ocean-400" />
              </div>
              <div>
                <p className="font-semibold text-ocean-800 dark:text-dark-text-primary mb-1">
                  Archived Habits
                </p>
                <p className="text-sm text-ocean-600 dark:text-dark-text-secondary leading-relaxed">
                  These habits are hidden from your main view and focus mode. You can unarchive them anytime to make them active again, or permanently delete them.
                </p>
              </div>
            </div>
          </div>

          {/* Archived Habits List */}
          <div>
            {archivedHabits.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="mb-4">
                  <Inbox className="w-16 h-16 text-ocean-300 dark:text-dark-text-tertiary mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-ocean-800 dark:text-dark-text-primary mb-2">
                  No Archived Habits
                </h3>
                <p className="text-ocean-600 dark:text-dark-text-secondary mb-6">
                  When you archive habits, they'll appear here. Archive habits you no longer actively track but want to keep for reference.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-primary"
                >
                  Go to Active Habits
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {archivedHabits.map((habit, index) => {
                  const category = categories.find(c => c.id === habit.category);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onToggle={() => handleToggleHabit(habit.id)}
                      onDelete={() => handleDeleteHabit(habit.id)}
                      onEdit={() => handleEditHabit(habit)}
                      onSubtaskToggle={(subtaskId) => handleSubtaskToggle(habit.id, subtaskId)}
                      onArchive={() => handleArchiveToggle(habit.id)}
                      isCompleted={completions.get(habit.id) === true}
                      categoryColor={category ? getCategoryColor(category.id, archivedHabits, categories) : undefined}
                      categoryName={category?.name}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
