/**
 * Abstract Data Provider Interface
 * Following SOLID principles - Dependency Inversion Principle
 * 
 * This interface defines the contract for any data storage provider.
 * Implementations can be Supabase, Firebase, MongoDB, or even localStorage.
 * The application depends on this abstraction, not concrete implementations.
 */

import { Habit, HabitCompletion, Category } from '../types';

export interface IAuthProvider {
  /**
   * Sign up a new user
   */
  signUp(email: string, password: string): Promise<{ user: any; error: Error | null }>;
  
  /**
   * Sign in existing user
   */
  signIn(email: string, password: string): Promise<{ user: any; error: Error | null }>;
  
  /**
   * Sign out current user
   */
  signOut(): Promise<{ error: Error | null }>;
  
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<any | null>;
  
  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: any | null) => void): () => void;
}

export interface IDataProvider {
  // ============ HABITS ============
  
  /**
   * Retrieve all habits for the current user
   */
  getHabits(): Promise<Habit[]>;
  
  /**
   * Create a new habit
   */
  addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>): Promise<Habit>;
  
  /**
   * Update an existing habit
   */
  updateHabit(id: string, updates: Partial<Habit>): Promise<void>;
  
  /**
   * Delete a habit and all its completions
   */
  deleteHabit(id: string): Promise<void>;
  
  // ============ COMPLETIONS ============
  
  /**
   * Retrieve all completions for the current user
   */
  getCompletions(): Promise<HabitCompletion[]>;
  
  /**
   * Toggle completion status for a habit on a specific date
   */
  toggleCompletion(habitId: string, date: string): Promise<void>;
  
  /**
   * Check if a habit is completed on a specific date
   */
  isHabitCompleted(habitId: string, date: string): Promise<boolean>;
  
  // ============ CATEGORIES ============
  
  /**
   * Retrieve all categories for the current user
   */
  getCategories(): Promise<Category[]>;
  
  /**
   * Create a new category
   */
  addCategory(name: string): Promise<Category>;
  
  // ============ HELPER METHODS ============
  
  /**
   * Initialize the provider (if needed)
   */
  initialize?(): Promise<void>;
  
  /**
   * Clean up resources (if needed)
   */
  cleanup?(): Promise<void>;
}

/**
 * Combined provider interface for both auth and data operations
 */
export interface IStorageProvider extends IDataProvider, IAuthProvider {}
