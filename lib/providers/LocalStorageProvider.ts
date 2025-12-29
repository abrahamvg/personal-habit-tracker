/**
 * LocalStorage Implementation of IStorageProvider
 * Following SOLID principles - concrete implementation for offline/fallback usage
 * Can be used as a fallback when network is unavailable or for local-only usage
 */

import { IStorageProvider } from './IDataProvider';
import { Habit, HabitCompletion, Category } from '../types';
import { generateId } from '../utils';

const HABITS_KEY = 'habit-tracker-habits';
const COMPLETIONS_KEY = 'habit-tracker-completions';
const CATEGORIES_KEY = 'habit-tracker-categories';
const USER_KEY = 'habit-tracker-user';

export class LocalStorageProvider implements IStorageProvider {
  private mockUser: any = null;

  // ============ AUTH METHODS ============
  // Note: LocalStorage doesn't have real auth, but we mock it for interface compliance

  async signUp(email: string, password: string) {
    const user = {
      id: generateId(),
      email,
      created_at: new Date().toISOString(),
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    this.mockUser = user;
    return { user, error: null };
  }

  async signIn(email: string, password: string) {
    if (typeof window === 'undefined') {
      return { user: null, error: new Error('Window not available') };
    }

    const userData = localStorage.getItem(USER_KEY);
    if (!userData) {
      return { user: null, error: new Error('User not found') };
    }

    const user = JSON.parse(userData);
    this.mockUser = user;
    return { user, error: null };
  }

  async signOut() {
    this.mockUser = null;
    return { error: null };
  }

  async getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    if (!this.mockUser) {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        this.mockUser = JSON.parse(userData);
      }
    }
    
    return this.mockUser;
  }

  onAuthStateChange(callback: (user: any | null) => void) {
    // For localStorage, we'll just call the callback immediately with current user
    setTimeout(() => {
      callback(this.mockUser);
    }, 0);
    
    // Return no-op unsubscribe function
    return () => {};
  }

  // ============ HABIT METHODS ============

  async getHabits(): Promise<Habit[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>): Promise<Habit> {
    const habits = await this.getHabits();
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
      archived: false,
    };
    
    const updatedHabits = [...habits, newHabit];
    if (typeof window !== 'undefined') {
      localStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
    }
    
    return newHabit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    const habits = await this.getHabits();
    const updatedHabits = habits.map(h => 
      h.id === id ? { ...h, ...updates } : h
    );
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
    }
  }

  async deleteHabit(id: string): Promise<void> {
    const habits = await this.getHabits();
    const filteredHabits = habits.filter(h => h.id !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(HABITS_KEY, JSON.stringify(filteredHabits));
    }

    // Also delete completions
    const completions = await this.getCompletions();
    const filteredCompletions = completions.filter(c => c.habitId !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(filteredCompletions));
    }
  }

  // ============ COMPLETION METHODS ============

  async getCompletions(): Promise<HabitCompletion[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COMPLETIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async toggleCompletion(habitId: string, date: string): Promise<void> {
    const completions = await this.getCompletions();
    const existingIndex = completions.findIndex(
      c => c.habitId === habitId && c.date === date
    );

    let updatedCompletions: HabitCompletion[];
    if (existingIndex >= 0) {
      updatedCompletions = completions.map((c, i) => 
        i === existingIndex ? { ...c, completed: !c.completed } : c
      );
    } else {
      updatedCompletions = [...completions, { habitId, date, completed: true }];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(updatedCompletions));
    }
  }

  async isHabitCompleted(habitId: string, date: string): Promise<boolean> {
    const completions = await this.getCompletions();
    const completion = completions.find(
      c => c.habitId === habitId && c.date === date
    );
    return completion?.completed || false;
  }

  // ============ CATEGORY METHODS ============

  async getCategories(): Promise<Category[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CATEGORIES_KEY);
    
    if (!data) {
      const defaults: Category[] = [
        { id: '1', name: 'Health' },
        { id: '2', name: 'Productivity' },
        { id: '3', name: 'Personal' },
        { id: '4', name: 'Learning' },
      ];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaults));
      }
      
      return defaults;
    }
    
    return JSON.parse(data);
  }

  async addCategory(name: string): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      id: generateId(),
      name,
    };
    
    const updatedCategories = [...categories, newCategory];
    if (typeof window !== 'undefined') {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
    }
    
    return newCategory;
  }
}
