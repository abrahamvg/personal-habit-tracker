export type FrequencyType = 'daily' | 'weekly';

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  frequency: FrequencyType;
  createdAt: string;
  archived: boolean;
};

export type HabitCompletion = {
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
};

export type Stats = {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
};
