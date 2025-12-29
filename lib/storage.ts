/**
 * Storage Layer - Provider-agnostic API
 * Following SOLID principles - depends on abstraction (IStorageProvider)
 * 
 * This layer provides a simple API that wraps the async provider.
 * Components should use the provider from useAuth() context for authenticated operations.
 * 
 * NOTE: These functions now return Promises. Update calling code accordingly.
 */

import { Habit, HabitCompletion, Category } from './types';
import { IStorageProvider } from './providers/IDataProvider';

// Global provider instance - can be set by AuthContext or for testing
let globalProvider: IStorageProvider | null = null;

/**
 * Set the global provider instance
 * Called by AuthContext when provider is initialized
 */
export function setGlobalProvider(provider: IStorageProvider): void {
  globalProvider = provider;
}

/**
 * Get the global provider instance
 * Throws error if not initialized - components should use useProvider() hook instead
 */
function getProvider(): IStorageProvider {
  if (!globalProvider) {
    throw new Error(
      'Provider not initialized. Use useProvider() hook from AuthContext in components.'
    );
  }
  return globalProvider;
}

/**
 * Reset provider instance (useful for testing)
 */
export function resetProvider(): void {
  globalProvider = null;
}

// ============ HABITS ============

export const getHabits = async (): Promise<Habit[]> => {
  try {
    return await getProvider().getHabits();
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>): Promise<Habit> => {
  return await getProvider().addHabit(habit);
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<void> => {
  return await getProvider().updateHabit(id, updates);
};

export const deleteHabit = async (id: string): Promise<void> => {
  return await getProvider().deleteHabit(id);
};

export const togglePinHabit = async (id: string): Promise<void> => {
  const habits = await getHabits();
  const habit = habits.find(h => h.id === id);
  if (habit) {
    await updateHabit(id, { pinned: !habit.pinned });
  }
};

export const toggleSubtask = async (habitId: string, subtaskId: string): Promise<void> => {
  const habits = await getHabits();
  const habit = habits.find(h => h.id === habitId);
  
  if (habit && habit.subtasks) {
    const updatedSubtasks = habit.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );
    await updateHabit(habitId, { subtasks: updatedSubtasks });
  }
};

// ============ COMPLETIONS ============

export const getCompletions = async (): Promise<HabitCompletion[]> => {
  try {
    return await getProvider().getCompletions();
  } catch (error) {
    console.error('Error getting completions:', error);
    return [];
  }
};

export const toggleCompletion = async (habitId: string, date: string): Promise<void> => {
  return await getProvider().toggleCompletion(habitId, date);
};

export const isHabitCompleted = async (habitId: string, date: string): Promise<boolean> => {
  return await getProvider().isHabitCompleted(habitId, date);
};

// ============ CATEGORIES ============

export const getCategories = async (): Promise<Category[]> => {
  try {
    return await getProvider().getCategories();
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCategory = async (name: string): Promise<Category> => {
  return await getProvider().addCategory(name);
};

// ============ HELPERS ============

/**
 * Filter to get only active (non-archived) habits
 */
export const getActiveHabits = (habits: Habit[]): Habit[] => {
  return habits.filter(h => !h.archived);
};

// ============ BACKWARD COMPATIBILITY (DEPRECATED) ============
// These synchronous versions are kept for gradual migration
// They use localStorage provider and will be removed in future versions

import { LocalStorageProvider } from './providers/LocalStorageProvider';
const legacyProvider = new LocalStorageProvider();

/**
 * @deprecated Use async getHabits() instead
 */
export const getHabitsSync = (): Habit[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('habit-tracker-habits');
  return data ? JSON.parse(data) : [];
};

/**
 * @deprecated Use async getCompletions() instead
 */
export const getCompletionsSync = (): HabitCompletion[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('habit-tracker-completions');
  return data ? JSON.parse(data) : [];
};

/**
 * @deprecated Use async isHabitCompleted() instead
 */
export const isHabitCompletedSync = (habitId: string, date: string): boolean => {
  const completions = getCompletionsSync();
  const completion = completions.find(
    c => c.habitId === habitId && c.date === date
  );
  return completion?.completed || false;
};
