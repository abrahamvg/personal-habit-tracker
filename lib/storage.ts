import { Habit, HabitCompletion, Category } from './types';

const HABITS_KEY = 'habit-tracker-habits';
const COMPLETIONS_KEY = 'habit-tracker-completions';
const CATEGORIES_KEY = 'habit-tracker-categories';

// Habits
export const getHabits = (): Habit[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveHabits = (habits: Habit[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
};

export const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>): Habit => {
  const habits = getHabits();
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    archived: false,
  };
  saveHabits([...habits, newHabit]);
  return newHabit;
};

export const updateHabit = (id: string, updates: Partial<Habit>): void => {
  const habits = getHabits();
  const updatedHabits = habits.map(h => 
    h.id === id ? { ...h, ...updates } : h
  );
  saveHabits(updatedHabits);
};

export const deleteHabit = (id: string): void => {
  const habits = getHabits();
  saveHabits(habits.filter(h => h.id !== id));
  
  // Also delete all completions for this habit
  const completions = getCompletions();
  saveCompletions(completions.filter(c => c.habitId !== id));
};

// Completions
export const getCompletions = (): HabitCompletion[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COMPLETIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCompletions = (completions: HabitCompletion[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
};

export const toggleCompletion = (habitId: string, date: string): void => {
  const completions = getCompletions();
  const existingIndex = completions.findIndex(
    c => c.habitId === habitId && c.date === date
  );

  if (existingIndex >= 0) {
    completions[existingIndex].completed = !completions[existingIndex].completed;
  } else {
    completions.push({ habitId, date, completed: true });
  }

  saveCompletions(completions);
};

export const isHabitCompleted = (habitId: string, date: string): boolean => {
  const completions = getCompletions();
  const completion = completions.find(
    c => c.habitId === habitId && c.date === date
  );
  return completion?.completed || false;
};

// Categories
export const getCategories = (): Category[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) {
    // Default categories
    const defaults: Category[] = [
      { id: '1', name: 'Health', color: '#9a917d' },
      { id: '2', name: 'Productivity', color: '#b5ad9a' },
      { id: '3', name: 'Personal', color: '#887d68' },
      { id: '4', name: 'Learning', color: '#a39782' },
    ];
    saveCategories(defaults);
    return defaults;
  }
  return JSON.parse(data);
};

export const saveCategories = (categories: Category[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const addCategory = (name: string, color: string): Category => {
  const categories = getCategories();
  const newCategory: Category = {
    id: crypto.randomUUID(),
    name,
    color,
  };
  saveCategories([...categories, newCategory]);
  return newCategory;
};
