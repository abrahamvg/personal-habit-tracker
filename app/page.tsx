'use client';

import Link from 'next/link';
import { format, subDays, addDays } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { Habit, Category } from '@/lib/types';
import { Plus, X, Menu, Target, Trophy, Flame, Calendar, TrendingUp, Focus, Archive, LogOut, Keyboard, ChevronLeft, ChevronRight, List, Zap, Clock, Filter, SortAsc, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useHabitStore } from '@/lib/store';
import { getHabitColor, getCategoryColor } from '@/lib/colors';
import { timeEstimateToMinutes, formatToISODate } from '@/lib/timeUtils';
import { getPriorityOrder } from '@/lib/priorityUtils';
import { getDashboardHabits } from '@/lib/dashboardUtils';
import HabitCard from '@/components/HabitCard';
import AddHabitModal from '@/components/AddHabitModal';
import StreakIndicator from '@/components/StreakIndicator';
import DarkModeToggle from '@/components/DarkModeToggle';
import PomodoroTimer from '@/components/PomodoroTimer';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import AuthModal from '@/components/AuthModal';
import DebugPanel from '@/components/DebugPanel';
import FocusModeView from '@/components/FocusModeView';
import DraggableHabitList from '@/components/DraggableHabitList';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { isDebugMode } from '@/lib/debugUtils';
import { sortHabitsWithPinnedFirst } from '@/lib/sortUtils';

type ViewMode = 'list' | 'focus';

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  
  // Zustand store - single source of truth
  const {
    habits: allHabits,
    completions: allCompletions,
    categories,
    loading: dataLoading,
    initialized,
    initialize,
    refresh,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    toggleSubtask,
    togglePin,
    toggleArchive,
    reorderHabits,
    getCompletionMap,
    getActiveHabits
  } = useHabitStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [pomodoroHabit, setPomodoroHabit] = useState<Habit | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [focusHabits, setFocusHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatToISODate(new Date()));
  
  // Filtering and Sorting state
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all'); // all, <15, <30
  const [sortBy, setSortBy] = useState<string>('none'); // none, priority-asc, priority-desc, time-asc, time-desc
  const [groupBy, setGroupBy] = useState<string>('none'); // none, category, priority
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const today = formatToISODate(new Date());
  const isViewingToday = selectedDate === today;

  // Check debug mode on client-side mount
  useEffect(() => {
    setDebugMode(isDebugMode());
  }, []);

  // Initialize store when user is authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      setShowAuthModal(true);
      return;
    }
    
    if (user && !initialized && !dataLoading) {
      initialize();
    }
  }, [user, authLoading, initialized, dataLoading, initialize]);

  useEffect(() => {
    if (allHabits.length === 0) return;
    const loadFocusHabits = async () => {
      const selected = await getDashboardHabits(allHabits, allCompletions);
      setFocusHabits(selected);
    };
    loadFocusHabits();
  }, [allHabits, allCompletions]);

  const handleAddHabit = async (habitData: {
    name: string;
    description?: string;
    category?: string;
    frequency: 'daily' | 'weekly';
    priority?: 'high' | 'medium' | 'low';
    timeEstimate?: string;
    subtasks?: any[];
  }) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, habitData);
        setEditingHabit(null);
      } else {
        await addHabit(habitData);
      }
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const handleToggleHabit = async (habitId: string, date: string = selectedDate) => {
    try {
      await toggleCompletion(habitId, date);
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const goToPreviousDay = () => {
    const prevDay = formatToISODate(subDays(new Date(selectedDate), 1));
    setSelectedDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = formatToISODate(addDays(new Date(selectedDate), 1));
    if (nextDay <= today) {
      setSelectedDate(nextDay);
    }
  };

  const goToToday = () => {
    setSelectedDate(today);
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
    setIsModalOpen(true);
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

  const handleReorder = async (habitIds: string[]) => {
    try {
      await reorderHabits(habitIds);
    } catch (error) {
      console.error('Error reordering habits:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          setEditingHabit(null);
          setIsModalOpen(true);
          break;
        case '?':
          setShowShortcuts(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Get all active habits and completion status
  const allActiveHabits = getActiveHabits();
  const completions = useMemo(() => getCompletionMap(selectedDate), [allCompletions, getCompletionMap, selectedDate]);
  const totalCompleted = allActiveHabits.filter(h => completions.get(h.id) === true).length;
  
  // Filter habits for display
  let filteredHabits = [...allActiveHabits];
  
  if (filterPriority !== 'all') {
    filteredHabits = filteredHabits.filter(h => h.priority === filterPriority);
  }
  
  if (filterTime !== 'all') {
    filteredHabits = filteredHabits.filter(h => {
      const mins = timeEstimateToMinutes(h.timeEstimate);
      if (filterTime === '<15') return mins > 0 && mins < 15;
      if (filterTime === '<30') return mins >= 15 && mins < 30;
      return true;
    });
  }
  
  // Sort habits with pinned first, then by order (if no custom sort applied)
  let sortedHabits = [...filteredHabits];
  
  if (sortBy === 'none') {
    // Default: pinned first, then by order
    sortedHabits = sortHabitsWithPinnedFirst(sortedHabits);
  } else if (sortBy === 'priority-asc') {
    // High to Low priority
    sortedHabits.sort((a, b) => {
      return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
    });
  } else if (sortBy === 'priority-desc') {
    // Low to High priority
    sortedHabits.sort((a, b) => {
      return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
    });
  } else if (sortBy === 'time-asc') {
    // Low to High time
    sortedHabits.sort((a, b) => timeEstimateToMinutes(a.timeEstimate) - timeEstimateToMinutes(b.timeEstimate));
  } else if (sortBy === 'time-desc') {
    // High to Low time
    sortedHabits.sort((a, b) => timeEstimateToMinutes(b.timeEstimate) - timeEstimateToMinutes(a.timeEstimate));
  }
  
  const activeHabits = sortedHabits;
  
  // Group habits if needed
  const groupedHabits: Record<string, typeof activeHabits> = {};
  if (groupBy === 'category') {
    activeHabits.forEach(habit => {
      const key = habit.category || 'Uncategorized';
      if (!groupedHabits[key]) groupedHabits[key] = [];
      groupedHabits[key].push(habit);
    });
  } else if (groupBy === 'priority') {
    activeHabits.forEach(habit => {
      const key = habit.priority || 'medium';
      if (!groupedHabits[key]) groupedHabits[key] = [];
      groupedHabits[key].push(habit);
    });
  } else {
    groupedHabits['all'] = activeHabits;
  }
  
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ocean-600 dark:text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!user) {
    return (
      <>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-beige-50 via-ocean-50/30 to-beige-100 dark:from-dark-bg dark:via-dark-bg dark:to-dark-card flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-ocean-800 dark:text-dark-text-primary mb-2">Habit Tracker</h1>
              <p className="text-ocean-600 dark:text-dark-text-secondary">Track your habits, achieve your goals</p>
            </div>
            <div className="card p-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-ocean-800 dark:text-dark-text-primary mb-4">Welcome!</h2>
              <p className="text-ocean-600 dark:text-dark-text-secondary mb-6">
                Sign in to start tracking your habits and sync across all your devices.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn btn-primary w-full"
              >
                Sign In / Sign Up
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 dark:bg-dark-bg">
      {/* Header */}
      <header className="bg-ocean-50 dark:bg-dark-card border-b border-ocean-200 dark:border-dark-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link href="/dashboard" className="inline-block hover:opacity-80 transition-opacity">
                <h1 className="text-2xl sm:text-3xl font-bold text-ocean-800 dark:text-dark-text-primary cursor-pointer">Habit Tracker</h1>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={goToPreviousDay}
                  className="p-1 hover:bg-ocean-100 dark:hover:bg-dark-hover rounded transition-colors"
                  title="Previous day"
                >
                  <ChevronLeft className="w-4 h-4 text-ocean-600 dark:text-dark-text-secondary" />
                </button>
                <p className="text-sm text-ocean-600 dark:text-dark-text-secondary">
                  {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                  {!isViewingToday && (
                    <button
                      onClick={goToToday}
                      className="ml-2 text-xs px-2 py-0.5 bg-ocean-500 text-white rounded hover:bg-ocean-600 transition-colors"
                    >
                      ⟳
                    </button>
                  )}
                </p>
                <button
                  onClick={goToNextDay}
                  disabled={isViewingToday}
                  className="p-1 hover:bg-ocean-100 dark:hover:bg-dark-hover rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next day"
                >
                  <ChevronRight className="w-4 h-4 text-ocean-600 dark:text-dark-text-secondary" />
                </button>
              </div>
            </div>
            
            {/* Today's Progress Pills - Desktop */}
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="px-4 py-2 rounded-full bg-ocean-100 dark:bg-dark-hover border border-ocean-200 dark:border-dark-border flex items-center gap-2">
                <Target className="w-4 h-4 text-ocean-600 dark:text-dark-text-secondary" />
                <span className="text-sm font-semibold text-ocean-800 dark:text-dark-text-primary">{totalCompleted}/{allActiveHabits.length}</span>
                <span className="text-xs text-ocean-500 dark:text-dark-text-tertiary">tasks</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-ocean-100 dark:bg-dark-hover border border-ocean-200 dark:border-dark-border flex items-center gap-2">
                <Trophy className="w-4 h-4 text-ocean-600 dark:text-dark-text-secondary" />
                <span className="text-sm font-semibold text-ocean-800 dark:text-dark-text-primary">
                  {allActiveHabits.length > 0 ? Math.round((totalCompleted / allActiveHabits.length) * 100) : 0}%
                </span>
              </div>
              <StreakIndicator totalHabits={allActiveHabits.length} completedToday={totalCompleted} />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-ocean-100 dark:bg-dark-hover text-ocean-700 dark:text-dark-text-primary hover:bg-ocean-200 dark:hover:bg-dark-border transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <DarkModeToggle />
              <button
                onClick={() => {
                  setEditingHabit(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary flex items-center gap-2 rounded-full max-lg:p-5 max-lg:fixed max-lg:bottom-8 max-lg:right-4 max-lg:z-50"
                disabled={dataLoading}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Habit</span>
              </button>
              
              {/* User Profile Dropdown - Extreme Right */}
              {user && (
                <UserProfileDropdown userEmail={user.email || ''} onSignOut={signOut} />
              )}
            </div>
          </div>

          {/* Mobile Stats Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 p-4 bg-ocean-100/50 dark:bg-dark-hover/50 rounded-xl border border-ocean-200 dark:border-dark-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2 p-3 bg-white dark:bg-dark-card rounded-lg">
                  <Target className="w-5 h-5 text-ocean-500" />
                  <div>
                    <p className="text-lg font-bold text-ocean-800 dark:text-dark-text-primary">{totalCompleted}/{allActiveHabits.length}</p>
                    <p className="text-xs text-ocean-500 dark:text-dark-text-tertiary">Tasks Done</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 p-3 bg-white dark:bg-dark-card rounded-lg">
                  <Trophy className="w-5 h-5 text-ocean-500" />
                  <div>
                    <p className="text-lg font-bold text-ocean-800 dark:text-dark-text-primary">
                      {allActiveHabits.length > 0 ? Math.round((totalCompleted / allActiveHabits.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-ocean-500 dark:text-dark-text-tertiary">Complete</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <StreakIndicator totalHabits={allActiveHabits.length} completedToday={totalCompleted} />
                </div>
              </div>
            </div>
          )}

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('list')}
              className={`btn flex items-center gap-2 ${
                viewMode === 'list' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('focus')}
              className={`btn flex items-center gap-2 ${
                viewMode === 'focus' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Focus</span>
            </button>
            <Link href="/archived" className="btn btn-secondary flex items-center gap-2">
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Archived</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Filter and Sort Control*/}
            <div className="card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="flex items-center gap-2 text-ocean-700 dark:text-dark-text-primary hover:text-ocean-800 dark:hover:text-dark-text-secondary transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Filters & Sort</span>
                  {filtersExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                
                {/* Reset Button - Always visible */}
                <button
                  onClick={() => {
                    setFilterPriority('all');
                    setFilterTime('all');
                    setSortBy('none');
                    setGroupBy('none');
                    setExpandedGroups(new Set());
                  }}
                  className="btn btn-secondary flex items-center gap-2 text-sm"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
              
              {filtersExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {/* Filter by Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary uppercase tracking-wider flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5" />
                      Priority
                    </label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="input w-full py-2 px-3 text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>

                  {/* Filter by Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Duration
                    </label>
                    <select
                      value={filterTime}
                      onChange={(e) => setFilterTime(e.target.value)}
                      className="input w-full py-2 px-3 text-sm"
                    >
                      <option value="all">All Durations</option>
                      <option value="<15">⚡ Quick (&lt; 15 min)</option>
                      <option value="<30">⏱️  Medium (15-30 min)</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary uppercase tracking-wider flex items-center gap-2">
                      <SortAsc className="w-3.5 h-3.5" />
                      Sort
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input w-full py-2 px-3 text-sm"
                    >
                      <option value="none">Default Order</option>
                      <option value="priority-asc">Priority: High → Low</option>
                      <option value="priority-desc">Priority: Low → High</option>
                      <option value="time-asc">Time: Low → High</option>
                      <option value="time-desc">Time: High → Low</option>
                    </select>
                  </div>

                  {/* Group By */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ocean-600 dark:text-dark-text-secondary uppercase tracking-wider flex items-center gap-2">
                      <List className="w-3.5 h-3.5" />
                      Group
                    </label>
                    <select
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                      className="input w-full py-2 px-3 text-sm"
                    >
                      <option value="none">No Grouping</option>
                      <option value="category">📁 By Category</option>
                      <option value="priority">🎯 By Priority</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Habits List */}
            <div>
              {activeHabits.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-sand-500 dark:text-dark-text-secondary mb-4">No habits match your filters. Try adjusting them!</p>
                  <button
                    onClick={() => {
                      setFilterPriority('all');
                      setFilterTime('all');
                      setIsModalOpen(true);
                    }}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Habit
                  </button>
                </div>
              ) : groupBy === 'none' && sortBy === 'none' ? (
                <DraggableHabitList
                  habits={activeHabits}
                  categories={categories}
                  completions={completions}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                  onEdit={handleEditHabit}
                  onStartTimer={setPomodoroHabit}
                  onSubtaskToggle={handleSubtaskToggle}
                  onPin={handlePinToggle}
                  onArchive={handleArchiveToggle}
                  onReorder={handleReorder}
                />
              ) : groupBy === 'none' ? (
                <div className="space-y-3">
                  {activeHabits.map((habit, index) => {
                    const category = categories.find(c => c.id === habit.category);
                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onToggle={() => handleToggleHabit(habit.id)}
                        onDelete={() => handleDeleteHabit(habit.id)}
                        onEdit={() => handleEditHabit(habit)}
                        onStartTimer={() => setPomodoroHabit(habit)}
                        onSubtaskToggle={(subtaskId) => handleSubtaskToggle(habit.id, subtaskId)}
                        onPin={() => handlePinToggle(habit.id)}
                        onArchive={() => handleArchiveToggle(habit.id)}
                        isCompleted={completions.get(habit.id) === true}
                        categoryColor={category ? getCategoryColor(category.id, activeHabits, categories) : undefined}
                        categoryName={category?.name}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedHabits).map(([groupKey, habits], groupIndex) => {
                    const isExpanded = expandedGroups.has(groupKey);
                    const groupCategory = categories.find(c => c.id === groupKey);
                    const groupName = groupBy === 'category' 
                      ? (groupCategory?.name || 'Uncategorized')
                      : groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
                    
                    // Use consistent category color assignment
                    let groupColor = undefined;
                    if (groupBy === 'category') {
                      groupColor = getCategoryColor(groupKey, activeHabits, categories);
                    }
                    
                    return (
                      <div key={groupKey} className="card overflow-hidden">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full p-5 flex items-center justify-between hover:bg-ocean-50 dark:hover:bg-dark-hover transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-ocean-500" /> : <ChevronUp className="w-5 h-5 text-ocean-500" />}
                            <span className="font-semibold text-ocean-800 dark:text-dark-text-primary">
                              {groupName}
                            </span>
                            {groupColor && (
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: groupColor }}
                              >
                                {habits.length}
                              </span>
                            )}
                            {!groupColor && (
                              <span className="text-sm text-ocean-500 dark:text-dark-text-tertiary">
                                ({habits.length})
                              </span>
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-5 space-y-3 border-t border-ocean-200 dark:border-dark-border">
                            {habits.map((habit, index) => {
                              const category = categories.find(c => c.id === habit.category);
                              const habitColor = getHabitColor(index);
                              return (
                                <HabitCard
                                  key={habit.id}
                                  habit={habit}
                                  onToggle={() => handleToggleHabit(habit.id)}
                                  onDelete={() => handleDeleteHabit(habit.id)}
                                  onEdit={() => handleEditHabit(habit)}
                                  onStartTimer={() => setPomodoroHabit(habit)}
                                  onSubtaskToggle={(subtaskId) => handleSubtaskToggle(habit.id, subtaskId)}
                                  onPin={() => handlePinToggle(habit.id)}
                                  onArchive={() => handleArchiveToggle(habit.id)}
                                  isCompleted={completions.get(habit.id) === true}
                                  categoryColor={category ? getCategoryColor(category.id, activeHabits, categories) : undefined}
                                  categoryName={category?.name}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'focus' && (
          <FocusModeView
            habits={focusHabits}
            categories={categories}
            completions={completions}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
            onEdit={handleEditHabit}
            onStartTimer={setPomodoroHabit}
            onSubtaskToggle={handleSubtaskToggle}
            onPin={handlePinToggle}
            onArchive={handleArchiveToggle}
          />
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
          priority: editingHabit.priority,
          timeEstimate: editingHabit.timeEstimate,
          subtasks: editingHabit.subtasks,
        } : undefined}
      />

      {/* Pomodoro Timer */}
      {pomodoroHabit && (
        <PomodoroTimer
          habitName={pomodoroHabit.name}
          timeEstimate={pomodoroHabit.timeEstimate}
          onComplete={() => {
            handleToggleHabit(pomodoroHabit.id);
          }}
          onClose={() => setPomodoroHabit(null)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

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
