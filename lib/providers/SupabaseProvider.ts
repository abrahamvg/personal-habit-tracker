/**
 * Supabase Implementation of IStorageProvider
 * Following SOLID principles - this is a concrete implementation
 * Can be swapped with FirebaseProvider, MongoProvider, etc.
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { IStorageProvider } from './IDataProvider';
import { Habit, HabitCompletion, Category } from '../types';
import { generateId } from '../utils';

export class SupabaseProvider implements IStorageProvider {
  private client: SupabaseClient;
  private currentUser: User | null = null;
  private userFetchPromise: Promise<User> | null = null;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  // ============ AUTH METHODS ============

  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });
    
    if (data.user) {
      this.currentUser = data.user;
    }
    
    return { user: data.user, error: error as Error | null };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user) {
      this.currentUser = data.user;
    }
    
    return { user: data.user, error: error as Error | null };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    this.currentUser = null;
    return { error: error as Error | null };
  }

  async getCurrentUser() {
    const { data: { user } } = await this.client.auth.getUser();
    this.currentUser = user;
    return user;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = this.client.auth.onAuthStateChange(
      (_event, session) => {
        this.currentUser = session?.user || null;
        callback(this.currentUser);
      }
    );

    return () => subscription.unsubscribe();
  }

  // ============ HABIT METHODS ============

  private async ensureAuthenticated(): Promise<User> {
    // Return cached user if available and not expired
    if (this.currentUser) {
      return this.currentUser;
    }

    // Deduplicate concurrent requests
    if (this.userFetchPromise) {
      return this.userFetchPromise;
    }

    // Fetch user and cache result
    this.userFetchPromise = (async () => {
      const { data: { user } } = await this.client.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      this.currentUser = user;
      return user;
    })();

    try {
      const user = await this.userFetchPromise;
      return user;
    } finally {
      this.userFetchPromise = null;
    }
  }

  async getHabits(): Promise<Habit[]> {
    const user = await this.ensureAuthenticated();

    const { data, error } = await this.client
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>): Promise<Habit> {
    const user = await this.ensureAuthenticated();

    const habitId = generateId();
    const dbHabit = {
      id: habitId,
      user_id: user.id,
      name: habitData.name,
      description: habitData.description,
      category: habitData.category,
      frequency: habitData.frequency,
      priority: habitData.priority,
      time_estimate: habitData.timeEstimate,
      subtasks: habitData.subtasks || [],
      archived: false,
      pinned: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('habits')
      .insert([dbHabit])
      .select()
      .single();

    if (error) throw error;
    
    return this.mapHabitFromDB(data);
  }

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<void> {
    const user = await this.ensureAuthenticated();

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.timeEstimate !== undefined) dbUpdates.time_estimate = updates.timeEstimate;
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
    if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
    if (updates.pinned !== undefined) dbUpdates.pinned = updates.pinned;

    const { error } = await this.client
      .from('habits')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async deleteHabit(id: string): Promise<void> {
    const user = await this.ensureAuthenticated();

    // Delete all completions for this habit first
    await this.client
      .from('completions')
      .delete()
      .eq('habit_id', id)
      .eq('user_id', user.id);

    // Delete the habit
    const { error } = await this.client
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // ============ COMPLETION METHODS ============

  async getCompletions(): Promise<HabitCompletion[]> {
    const user = await this.ensureAuthenticated();

    const { data, error } = await this.client
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(this.mapCompletionFromDB);
  }

  async toggleCompletion(habitId: string, date: string): Promise<void> {
    const user = await this.ensureAuthenticated();

    // Check if completion exists
    const { data: existing, error: fetchError } = await this.client
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('habit_id', habitId)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      // Toggle existing
      const { error: updateError } = await this.client
        .from('completions')
        .update({ completed: !existing.completed })
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('date', date);

      if (updateError) throw updateError;
    } else {
      // Create new completion
      const { error: insertError } = await this.client
        .from('completions')
        .insert([{
          user_id: user.id,
          habit_id: habitId,
          date,
          completed: true,
        }]);

      if (insertError) throw insertError;
    }
  }

  async isHabitCompleted(habitId: string, date: string): Promise<boolean> {
    const user = await this.ensureAuthenticated();

    const { data } = await this.client
      .from('completions')
      .select('completed')
      .eq('user_id', user.id)
      .eq('habit_id', habitId)
      .eq('date', date)
      .single();

    return data?.completed || false;
  }

  // ============ CATEGORY METHODS ============

  async getCategories(): Promise<Category[]> {
    const user = await this.ensureAuthenticated();

    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;

    // If no categories exist, create defaults (with deduplication check)
    if (!data || data.length === 0) {
      const defaults = ['Health', 'Productivity', 'Personal', 'Learning'];
      
      // Check if defaults already exist (prevent race condition duplicates)
      const { data: existing } = await this.client
        .from('categories')
        .select('name')
        .eq('user_id', user.id)
        .in('name', defaults);
      
      const existingNames = new Set((existing || []).map((c: any) => c.name));
      const toCreate = defaults.filter(name => !existingNames.has(name));
      
      if (toCreate.length > 0) {
        const newCategories = toCreate.map(name => ({
          id: generateId(),
          name,
          user_id: user.id,
        }));
        
        const { data: inserted } = await this.client
          .from('categories')
          .insert(newCategories)
          .select();
        
        return (inserted || []).map(this.mapCategoryFromDB);
      }

      return [];
    }

    return data.map(this.mapCategoryFromDB);
  }

  async addCategory(name: string): Promise<Category> {
    const user = await this.ensureAuthenticated();

    // Check if category already exists for this user
    const { data: existing } = await this.client
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', name)
      .maybeSingle();
    
    if (existing) {
      return this.mapCategoryFromDB(existing);
    }

    const newCategory = {
      id: generateId(),
      name,
      user_id: user.id,
    };

    const { data, error } = await this.client
      .from('categories')
      .insert([newCategory])
      .select()
      .single();

    if (error) throw error;
    
    return this.mapCategoryFromDB(data);
  }

  // ============ HELPER METHODS ============

  private mapHabitFromDB(dbHabit: any): Habit {
    return {
      id: dbHabit.id,
      name: dbHabit.name,
      description: dbHabit.description,
      category: dbHabit.category,
      frequency: dbHabit.frequency,
      priority: dbHabit.priority,
      timeEstimate: dbHabit.time_estimate,
      subtasks: dbHabit.subtasks || [],
      createdAt: dbHabit.created_at,
      archived: dbHabit.archived,
      pinned: dbHabit.pinned || false,
    };
  }

  private mapCompletionFromDB(dbCompletion: any): HabitCompletion {
    return {
      habitId: dbCompletion.habit_id,
      date: dbCompletion.date,
      completed: dbCompletion.completed,
    };
  }

  private mapCategoryFromDB(dbCategory: any): Category {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
    };
  }
}
