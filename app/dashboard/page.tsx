'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Habit, HabitCompletion } from '@/lib/types';
import { 
  Home, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Flame, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useHabitStore } from '@/lib/store';
import { getDashboardHabits } from '@/lib/dashboardUtils';
import { formatToISODate, timeEstimateToMinutes } from '@/lib/timeUtils';
import { getHabitStats } from '@/lib/stats';
import DarkModeToggle from '@/components/DarkModeToggle';
import ProgressRing from '@/components/ProgressRing';
import DebugPanel from '@/components/DebugPanel';
import { isDebugMode } from '@/lib/debugUtils';
import DashboardTaskCard from '@/components/DashboardTaskCard';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import MultiLineProgressChart from '@/components/MultiLineProgressChart';
import FocusModeView from '@/components/FocusModeView';
import DayCompletionModal from '@/components/DayCompletionModal';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const router = useRouter();
  
  // Zustand store - single source of truth
  const {
    habits: allHabits,
    completions: allCompletions,
    categories,
    loading: dataLoading,
    initialized,
    initialize,
    refresh,
    toggleCompletion,
    toggleSubtask,
    togglePin,
    toggleArchive,
    deleteHabit,
    updateHabit,
    getCompletionMap,
    getActiveHabits
  } = useHabitStore();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = useMemo(() => formatToISODate(new Date()), []);

  // Check debug mode on client-side mount
  useEffect(() => {
    setDebugMode(isDebugMode());
  }, []);

  // Initialize store on mount
  useEffect(() => {
    if (!initialized && !dataLoading) {
      initialize();
    }
  }, [initialized, dataLoading, initialize]);

  const allActiveHabits = useMemo(() => getActiveHabits(), [allHabits]);
  
  const [dashboardHabits, setDashboardHabits] = useState<Habit[]>([]);
  const completions = useMemo(() => getCompletionMap(today), [allCompletions, today]);
  const totalCompleted = allActiveHabits.filter(h => completions.get(h.id) === true).length;
  
  useEffect(() => {
    if (allHabits.length === 0) return;
    const loadDashboardHabits = async () => {
      const selected = await getDashboardHabits(allHabits, allCompletions);
      setDashboardHabits(selected);
    };
    loadDashboardHabits();
  }, [allHabits, allCompletions]);
  const totalTasks = allActiveHabits.length;
  const completionPercentage = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  // Calculate total estimated time for dashboard tasks
  const totalEstimatedMinutes = dashboardHabits.reduce((sum, habit) => {
    return sum + timeEstimateToMinutes(habit.timeEstimate || '15min');
  }, 0);

  // Calculate current longest streak across all habits
  const [longestCurrentStreak, setLongestCurrentStreak] = useState(0);
  
  useEffect(() => {
    if (allCompletions.length === 0) return;
    const loadLongestStreak = async () => {
      let maxStreak = 0;
      for (const habit of allActiveHabits) {
        const stats = await getHabitStats(habit.id, allCompletions);
        maxStreak = Math.max(maxStreak, stats.currentStreak);
      }
      setLongestCurrentStreak(maxStreak);
    };
    loadLongestStreak();
  }, [allActiveHabits, allCompletions]);

  // Weekly stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyCompletions = allCompletions.filter((c: HabitCompletion) => {
    const date = new Date(c.date);
    return c.completed && date >= weekStart && date <= weekEnd;
  }).length;

  // Best day this week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const bestDay = (() => {
    const dailyCompletions = Array.from({ length: 7 }, (_, i) => {
      const date = formatToISODate(subDays(weekEnd, 6 - i));
      const count = allActiveHabits.filter(h => {
        const completion = allCompletions.find((c: HabitCompletion) => c.habitId === h.id && c.date === date);
        return completion?.completed || false;
      }).length;
      return { day: daysOfWeek[i], count, total: allActiveHabits.length };
    });
    return dailyCompletions.length > 0 
      ? dailyCompletions.reduce((best, current) => 
          current.count > best.count ? current : best
        , { day: 'None', count: 0, total: 0 })
      : { day: 'None', count: 0, total: 0 };
  })();

  // Time saved calculation (assuming each habit saves time in the long run)
  const timeSavedMinutes = weeklyCompletions * 15; // Rough estimate: 15 min per habit
  const timeSavedHours = Math.floor(timeSavedMinutes / 60);
  const timeSavedRemainder = timeSavedMinutes % 60;

  const handleToggleHabit = async (habitId: string) => {
    const wasCompleted = completions.get(habitId) || false;
    
    try {
      await toggleCompletion(habitId, today);
      
      // Check if all dashboard tasks are now complete
      if (!wasCompleted) {
        const updatedCompletions = getCompletionMap(today);
        const newCompleted = dashboardHabits.filter(h => 
          h.id === habitId || updatedCompletions.get(h.id) === true
        ).length;
        
        if (newCompleted === dashboardHabits.length && dashboardHabits.length > 0) {
          triggerCelebration();
        }
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
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

  const handlePinToggle = async (habitId: string) => {
    try {
      await togglePin(habitId);
    } catch (error) {
      console.error('Error pinning habit:', error);
    }
  };

  const handleArchiveToggle = async (habitId: string) => {
    try {
      await toggleArchive(habitId);
    } catch (error) {
      console.error('Error archiving habit:', error);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        setTimeout(() => setShowCelebration(false), 1000);
        return;
      }

      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.9), y: 0 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
        gravity: 0.6,
        scalar: 1.2,
        drift: randomInRange(-0.5, 0.5),
      });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-ocean-50/30 to-beige-100 dark:from-dark-bg dark:via-dark-bg dark:to-dark-card">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">Amazing Work!</h2>
            <p className="text-xl text-white/90 mt-2">All tasks complete!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-ocean-200 dark:border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <Sparkles className="w-6 h-6 text-ocean-500" />
                  Dashboard
                </h1>
                <p className="text-sm text-ocean-600 dark:text-dark-text-secondary mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFocusMode(!showFocusMode)}
                className={`btn flex items-center gap-2 ${
                  showFocusMode ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Focus</span>
              </button>
              <DarkModeToggle />
              <button
                onClick={() => router.push('/')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">All Habits</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {showFocusMode ? (
          <FocusModeView
            habits={dashboardHabits}
            categories={categories}
            completions={completions}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
            onEdit={handleEditHabit}
            onSubtaskToggle={handleSubtaskToggle}
            onPin={handlePinToggle}
            onArchive={handleArchiveToggle}
          />
        ) : (
          <>
        {/* Top Section: Progress Ring + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Ring */}
          <div className="lg:col-span-1">
            <div className="card p-8 text-center h-full flex flex-col items-center justify-center">
              <ProgressRing progress={completionPercentage} />
              <p className="text-sm text-ocean-600 dark:text-dark-text-secondary mt-4">
                {totalCompleted} of {totalTasks} habits complete
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Current Streak */}
            <div className="card p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                    {longestCurrentStreak}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-300 uppercase tracking-wide">
                    Day Streak
                  </p>
                </div>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Keep it going!
              </p>
            </div>

            {/* Estimated Time */}
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                    ~{totalEstimatedMinutes}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                    Minutes Today
                  </p>
                </div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                For {dashboardHabits.length} task{dashboardHabits.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Weekly Completions */}
            <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                    {weeklyCompletions}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 uppercase tracking-wide">
                    This Week
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Habits completed
              </p>
            </div>

            {/* Best Day */}
            <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {bestDay.day}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                    Best Day
                  </p>
                </div>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {bestDay.count}/{bestDay.total} complete
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tasks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary flex items-center gap-2">
              <Zap className="w-6 h-6 text-ocean-500" />
              Focus Tasks
            </h2>
          </div>

          {dashboardHabits.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary mb-2">
                All Caught Up!
              </h3>
              <p className="text-ocean-600 dark:text-dark-text-secondary mb-6">
                You've completed all your tasks for today. Great work!
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary"
              >
                View All Habits
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardHabits.map((habit) => (
                <DashboardTaskCard
                  key={habit.id}
                  habit={habit}
                  onToggle={() => handleToggleHabit(habit.id)}
                  isPinned={habit.pinned || false}
                  isCompleted={completions.get(habit.id) === true}
                  allCompletions={allCompletions}
                />
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Calendar Heatmap */}
          <div>
            <h2 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-ocean-500" />
              Year Overview
            </h2>
            <HeatmapCalendar
              habits={allActiveHabits}
              completions={allCompletions}
              onDayClick={(date) => {
                setSelectedDate(date);
              }}
            />
          </div>
          
          {/* Progress Charts */}
          <div>
            <h2 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-ocean-500" />
              Progress Trends
            </h2>
            <MultiLineProgressChart 
              habits={allActiveHabits} 
              completions={allCompletions}
              categories={categories}
            />
          </div>
        </div>
        </>
        )}
      </main>

      {/* Day Completion Modal */}
      {selectedDate && (
        <DayCompletionModal
          isOpen={true}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          habits={allActiveHabits}
          completions={allCompletions}
        />
      )}

      {/* Debug Panel (only visible when ?debug=true in URL) */}
      {debugMode && (
        <DebugPanel 
          habits={allActiveHabits} 
          onRefresh={() => refresh()}
        />
      )}
    </div>
  );
}
