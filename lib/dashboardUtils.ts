import { Habit, HabitCompletion } from './types';
import { getHabitStats } from './stats';
import { getPriorityOrder } from './priorityUtils';
import { getCompletions } from './storage';
import { formatToISODate } from './timeUtils';

/**
 * Auto-pick top 3 habits based on:
 * 1. Today's incomplete habits with highest priority
 * 2. Longest current streaks (don't break them!)
 */
export const autoPickTopHabits = async (habits: Habit[], allCompletions?: HabitCompletion[]): Promise<Habit[]> => {
  const today = formatToISODate(new Date());
  const activeHabits = habits.filter(h => !h.archived);
  
  // Get completion status for today
  const completionsData = allCompletions || await getCompletions();
  const completedToday = new Set(
    completionsData
      .filter(c => c.date === today && c.completed)
      .map(c => c.habitId)
  );
  
  const incompleteToday = activeHabits.filter(h => !completedToday.has(h.id));
  
  if (incompleteToday.length === 0) return [];
  
  // Calculate scores for each habit
  const scoredHabits = await Promise.all(
    incompleteToday.map(async (habit) => {
      const stats = await getHabitStats(habit.id, completionsData);
      const priorityScore = habit.priority ? (3 - getPriorityOrder(habit.priority)) * 100 : 100; // high=300, medium=200, low=100
      const streakScore = stats.currentStreak * 10; // Each streak day = 10 points
      
      return {
        habit,
        score: priorityScore + streakScore,
        streak: stats.currentStreak,
        priority: habit.priority || 'medium',
      };
    })
  );
  
  // Sort by score (highest first)
  scoredHabits.sort((a, b) => b.score - a.score);
  
  // Return top 3
  return scoredHabits.slice(0, 3).map(s => s.habit);
};

/**
 * Get pinned habits (max 3)
 */
export const getPinnedHabits = async (habits: Habit[], allCompletions?: HabitCompletion[]): Promise<Habit[]> => {
  const today = formatToISODate(new Date());
  
  // Get completion status for today
  const completionsData = allCompletions || await getCompletions();
  const completedToday = new Set(
    completionsData
      .filter(c => c.date === today && c.completed)
      .map(c => c.habitId)
  );
  
  return habits
    .filter(h => !h.archived && h.pinned && !completedToday.has(h.id))
    .slice(0, 3);
};

/**
 * Get dashboard habits: pinned first, then auto-picked to fill up to 3
 */
export const getDashboardHabits = async (habits: Habit[], allCompletions?: HabitCompletion[]): Promise<Habit[]> => {
  const pinned = await getPinnedHabits(habits, allCompletions);
  
  if (pinned.length >= 3) {
    return pinned.slice(0, 3);
  }
  
  // Need to auto-pick more
  const autoPicked = await autoPickTopHabits(habits, allCompletions);
  const pinnedIds = new Set(pinned.map(h => h.id));
  const additionalHabits = autoPicked.filter(h => !pinnedIds.has(h.id));
  
  return [...pinned, ...additionalHabits].slice(0, 3);
};
