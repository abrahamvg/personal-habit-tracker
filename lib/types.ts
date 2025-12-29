export type FrequencyType = 'daily' | 'weekly';
export type PriorityType = 'high' | 'medium' | 'low';
export type TimeEstimate = '5min' | '15min' | '30min' | '1hr' | string; // string allows custom "HH:MM" format

export type Category = {
  id: string;
  name: string;
};

export type Subtask = {
  id: string;
  name: string;
  completed: boolean;
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  frequency: FrequencyType;
  priority?: PriorityType;
  timeEstimate?: TimeEstimate;
  subtasks?: Subtask[];
  createdAt: string;
  archived: boolean;
  pinned?: boolean;
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
