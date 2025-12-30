/**
 * Centralized State Management with Zustand
 * 
 * This store eliminates workarounds like:
 * - refreshKey pattern (forced re-renders)
 * - loadingRef (React Strict Mode workaround)
 * - isMounted (hydration workaround)
 * - Manual state duplication
 * 
 * Single source of truth for all habit data with automatic reactivity.
 */

import { create } from 'zustand';
import { Habit, HabitCompletion, Category } from './types';
import { formatToISODate } from './timeUtils';
import { 
  getHabits as fetchHabits,
  getCompletions as fetchCompletions,
  getCategories as fetchCategories,
  addHabit as createHabit,
  updateHabit as modifyHabit,
  deleteHabit as removeHabit,
  toggleCompletion as toggleHabitCompletion,
  toggleSubtask as toggleHabitSubtask,
  togglePinHabit as toggleHabitPin,
  toggleArchiveHabit as toggleHabitArchive,
  reorderHabits as reorderHabitsStorage,
} from './storage';

interface HabitStore {
  // State
  habits: Habit[];
  completions: HabitCompletion[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Computed state helpers
  getCompletionMap: (date: string) => Map<string, boolean>;
  getActiveHabits: () => Habit[];
  
  // Actions
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  toggleSubtask: (habitId: string, subtaskId: string) => Promise<void>;
  togglePin: (habitId: string) => Promise<void>;
  toggleArchive: (habitId: string) => Promise<void>;
  reorderHabits: (habitIds: string[]) => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  // Initial state
  habits: [],
  completions: [],
  categories: [],
  loading: false,
  error: null,
  initialized: false,
  
  // Computed helpers
  getCompletionMap: (date: string) => {
    const { completions } = get();
    const map = new Map<string, boolean>();
    completions.forEach((c) => {
      if (c.date === date) {
        map.set(c.habitId, c.completed);
      }
    });
    return map;
  },
  
  getActiveHabits: () => {
    const { habits } = get();
    return habits.filter(h => !h.archived);
  },
  
  // Initialize store - load all data
  initialize: async () => {
    const { initialized, loading } = get();
    
    // Prevent duplicate initialization
    if (initialized || loading) return;
    
    set({ loading: true, error: null });
    
    try {
      const [habits, completions, categories] = await Promise.all([
        fetchHabits(),
        fetchCompletions(),
        fetchCategories(),
      ]);
      
      set({ 
        habits, 
        completions, 
        categories, 
        loading: false, 
        initialized: true 
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false 
      });
    }
  },
  
  // Refresh all data
  refresh: async () => {
    set({ loading: true, error: null });
    
    try {
      const [habits, completions, categories] = await Promise.all([
        fetchHabits(),
        fetchCompletions(),
        fetchCategories(),
      ]);
      
      set({ habits, completions, categories, loading: false });
    } catch (error) {
      console.error('Error refreshing store:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        loading: false 
      });
    }
  },
  
  // Add new habit
  addHabit: async (habitData) => {
    try {
      const newHabit = await createHabit(habitData);
      set((state) => ({ 
        habits: [...state.habits, newHabit] 
      }));
      return newHabit;
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },
  
  // Update habit
  updateHabit: async (id, updates) => {
    try {
      await modifyHabit(id, updates);
      set((state) => ({
        habits: state.habits.map(h => 
          h.id === id ? { ...h, ...updates } : h
        )
      }));
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },
  
  // Delete habit
  deleteHabit: async (id) => {
    try {
      await removeHabit(id);
      set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        completions: state.completions.filter(c => c.habitId !== id)
      }));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },
  
  // Toggle completion
  toggleCompletion: async (habitId, date) => {
    try {
      // Optimistic update
      set((state) => {
        const existingIndex = state.completions.findIndex(
          c => c.habitId === habitId && c.date === date
        );
        
        let newCompletions: HabitCompletion[];
        if (existingIndex >= 0) {
          newCompletions = state.completions.map((c, i) =>
            i === existingIndex ? { ...c, completed: !c.completed } : c
          );
        } else {
          newCompletions = [...state.completions, { habitId, date, completed: true }];
        }
        
        return { completions: newCompletions };
      });
      
      // Sync with backend
      await toggleHabitCompletion(habitId, date);
    } catch (error) {
      console.error('Error toggling completion:', error);
      // Revert on error
      await get().refresh();
      throw error;
    }
  },
  
  // Toggle subtask
  toggleSubtask: async (habitId, subtaskId) => {
    try {
      // Optimistic update
      set((state) => ({
        habits: state.habits.map(habit => {
          if (habit.id === habitId && habit.subtasks) {
            return {
              ...habit,
              subtasks: habit.subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              )
            };
          }
          return habit;
        })
      }));
      
      // Sync with backend
      await toggleHabitSubtask(habitId, subtaskId);
    } catch (error) {
      console.error('Error toggling subtask:', error);
      // Revert on error
      await get().refresh();
      throw error;
    }
  },
  
  // Toggle pin
  togglePin: async (habitId) => {
    try {
      // Optimistic update
      set((state) => ({
        habits: state.habits.map(habit =>
          habit.id === habitId ? { ...habit, pinned: !habit.pinned } : habit
        )
      }));
      
      // Sync with backend
      await toggleHabitPin(habitId);
    } catch (error) {
      console.error('Error toggling pin:', error);
      // Revert on error
      await get().refresh();
      throw error;
    }
  },
  
  // Toggle archive
  toggleArchive: async (habitId) => {
    try {
      // Optimistic update
      set((state) => ({
        habits: state.habits.map(habit =>
          habit.id === habitId ? { ...habit, archived: !habit.archived } : habit
        )
      }));
      
      // Sync with backend
      await toggleHabitArchive(habitId);
    } catch (error) {
      console.error('Error toggling archive:', error);
      // Revert on error
      await get().refresh();
      throw error;
    }
  },

  // Reorder habits
  reorderHabits: async (habitIds) => {
    try {
      // Optimistic update
      set((state) => ({
        habits: state.habits.map(habit => {
          const newIndex = habitIds.indexOf(habit.id);
          return newIndex !== -1 ? { ...habit, order: newIndex } : habit;
        })
      }));
      
      // Sync with backend
      await reorderHabitsStorage(habitIds);
    } catch (error) {
      console.error('Error reordering habits:', error);
      // Revert on error
      await get().refresh();
      throw error;
    }
  },
  
  // Set error
  setError: (error) => {
    set({ error });
  },
  
  // Reset store
  reset: () => {
    set({
      habits: [],
      completions: [],
      categories: [],
      loading: false,
      error: null,
      initialized: false,
    });
  },
}));
