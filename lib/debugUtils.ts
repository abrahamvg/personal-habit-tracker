import { Habit } from './types';
import { formatToISODate } from './timeUtils';
import { subDays } from 'date-fns';

const DEBUG_DATE_KEY = 'habit-tracker-debug-date';
const DEBUG_MODE_KEY = 'habit-tracker-debug-mode';

/**
 * Check if debug mode is enabled via URL parameter or localStorage
 */
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const params = new URLSearchParams(window.location.search);
  const urlDebug = params.get('debug') === 'true';
  const storedDebug = localStorage.getItem(DEBUG_MODE_KEY) === 'true';
  
  return urlDebug || storedDebug;
}

/**
 * Enable/disable debug mode
 */
export function setDebugMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEBUG_MODE_KEY, String(enabled));
}

/**
 * Get current debug date (or actual date if not in debug mode)
 */
export function getDebugDate(): Date {
  if (typeof window === 'undefined') return new Date();
  
  const storedDate = localStorage.getItem(DEBUG_DATE_KEY);
  if (storedDate && isDebugMode()) {
    return new Date(storedDate);
  }
  return new Date();
}

/**
 * Set debug date for time travel testing
 */
export function setDebugDate(date: Date): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEBUG_DATE_KEY, date.toISOString());
}

/**
 * Reset to current date
 */
export function resetDebugDate(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEBUG_DATE_KEY);
}

/**
 * Add a habit completion for a specific date (for testing)
 */
export async function addDebugCompletion(habitId: string, date: string, completed: boolean = true): Promise<void> {
  const { toggleCompletion, getCompletions } = await import('./storage');
  
  // Check if completion already exists
  const completions = await getCompletions();
  const existing = completions.find(c => c.habitId === habitId && c.date === date);
  
  if (existing && existing.completed === completed) {
    console.log(`[DEBUG] Completion already exists for ${habitId} on ${date}`);
    return;
  }
  
  // Toggle to set the desired state
  await toggleCompletion(habitId, date);
  console.log(`[DEBUG] Added completion for ${habitId} on ${date}`);
}

/**
 * Bulk add completions for testing streaks
 */
export async function addDebugStreak(habitId: string, startDate: Date, days: number): Promise<void> {
  for (let i = 0; i < days; i++) {
    const date = formatToISODate(subDays(startDate, i));
    await addDebugCompletion(habitId, date, true);
  }
  console.log(`[DEBUG] Added ${days}-day streak for ${habitId}`);
}

/**
 * Add a habit with a custom creation date (for testing)
 */
export async function addDebugHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>, createdAt: Date): Promise<Habit> {
  const { addHabitWithDate } = await import('./storage');
  
  const newHabit = await addHabitWithDate(habitData, createdAt.toISOString());
  console.log(`[DEBUG] Added habit with custom date: ${habitData.name} (${createdAt.toISOString().split('T')[0]})`);
  return newHabit;
}

/**
 * Get debug info summary
 */
export function getDebugInfo(): {
  debugMode: boolean;
  currentDebugDate: string;
  actualDate: string;
  daysDifference: number;
} {
  const debugDate = getDebugDate();
  const actualDate = new Date();
  const daysDiff = Math.floor((debugDate.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    debugMode: isDebugMode(),
    currentDebugDate: formatToISODate(debugDate),
    actualDate: formatToISODate(actualDate),
    daysDifference: daysDiff,
  };
}
