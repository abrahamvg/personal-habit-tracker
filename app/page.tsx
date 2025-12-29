'use client';

import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Habit, Category } from '@/lib/types';
import { Plus, List, Calendar as CalendarIcon, TrendingUp, Target, Trophy } from 'lucide-react';
import { 
  getHabits, 
  addHabit, 
  updateHabit, 
  deleteHabit,
  toggleCompletion,
  isHabitCompleted,
  getCategories
} from '@/lib/storage';
import { getHabitStats } from '@/lib/stats';
import { getHabitColor } from '@/lib/colors';
import HabitCard from '@/components/HabitCard';
import AddHabitModal from '@/components/AddHabitModal';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import MultiLineProgressChart from '@/components/MultiLineProgressChart';
import TrendLineChart from '@/components/TrendLineChart';
import StreakIndicator from '@/components/StreakIndicator';

type ViewMode = 'list' | 'calendar' | 'progress';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    setHabits(getHabits());
    setCategories(getCategories());
  }, [refreshKey]);

  const handleAddHabit = (habitData: {
    name: string;
    description?: string;
    category?: string;
    frequency: 'daily' | 'weekly';
  }) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
    } else {
      addHabit(habitData);
    }
    setRefreshKey(prev => prev + 1);
  };

  const handleToggleHabit = (habitId: string, date: string = today) => {
    toggleCompletion(habitId, date);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const activeHabits = habits.filter(h => !h.archived);
  const todayCompleted = activeHabits.filter(h => isHabitCompleted(h.id, today)).length;

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Header */}
      <header className="bg-beige-100 border-b border-sand-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-sand-900">Habit Tracker</h1>
              <p className="text-sm text-sand-600 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            
            {/* Today's Progress Pills */}
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="px-4 py-2 rounded-full bg-sand-100 border border-sand-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-sand-700" />
                <span className="text-sm font-semibold text-sand-900">{todayCompleted}/{activeHabits.length}</span>
                <span className="text-xs text-sand-600">tasks</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-sand-100 border border-sand-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-sand-700" />
                <span className="text-sm font-semibold text-sand-900">
                  {activeHabits.length > 0 ? Math.round((todayCompleted / activeHabits.length) * 100) : 0}%
                </span>
                <span className="text-xs text-sand-600">rate</span>
              </div>
            </div>
            
            {/* Streak Indicator */}
            <div className="mr-4">
              <StreakIndicator 
                totalHabits={activeHabits.length}
                completedToday={todayCompleted}
              />
            </div>

            <button
              onClick={() => {
                setEditingHabit(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Habit</span>
            </button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('list')}
              className={`btn flex items-center gap-2 ${
                viewMode === 'list' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`btn flex items-center gap-2 ${
                viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('progress')}
              className={`btn flex items-center gap-2 ${
                viewMode === 'progress' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Progress</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Habits List */}
            <div>
              <h2 className="text-lg font-semibold text-sand-900 mb-4">Your Habits</h2>
              <div className="space-y-3">
                {activeHabits.length === 0 ? (
                  <div className="card p-12 text-center">
                    <p className="text-sand-500 mb-4">No habits yet. Start building better habits today!</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your First Habit
                    </button>
                  </div>
                ) : (
                  activeHabits.map((habit, index) => {
                    const category = categories.find(c => c.id === habit.category);
                    const habitColor = getHabitColor(index);
                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onToggle={() => handleToggleHabit(habit.id)}
                        onDelete={() => handleDeleteHabit(habit.id)}
                        onEdit={() => handleEditHabit(habit)}
                        isCompleted={isHabitCompleted(habit.id, today)}
                        categoryColor={category?.color}
                        habitColor={habitColor}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <HeatmapCalendar
            habits={activeHabits}
            onDayClick={(date) => {
              // Optional: Handle day click if needed
            }}
          />
        )}

        {viewMode === 'progress' && (
          <MultiLineProgressChart habits={activeHabits} />
        )}
      </main>

      {/* Add/Edit Habit Modal */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onAdd={handleAddHabit}
        categories={categories}
        editData={editingHabit ? {
          name: editingHabit.name,
          description: editingHabit.description,
          category: editingHabit.category,
          frequency: editingHabit.frequency,
        } : undefined}
      />
    </div>
  );
}
