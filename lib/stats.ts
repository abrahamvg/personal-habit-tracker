import { format, subDays, parseISO, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { Habit, HabitCompletion, Stats } from './types';
import { getCompletions } from './storage';

export const getHabitStats = (habitId: string): Stats => {
  const completions = getCompletions().filter(c => c.habitId === habitId && c.completed);
  
  if (completions.length === 0) {
    return {
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
    };
  }

  // Sort by date
  const sortedDates = completions
    .map(c => c.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  let checkDate = today;
  
  // Current streak (going backwards from today)
  for (let i = 0; i < 365; i++) {
    if (sortedDates.includes(checkDate)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
    checkDate = format(subDays(new Date(checkDate), 1), 'yyyy-MM-dd');
  }

  // Longest streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const daysDiff = differenceInDays(
        parseISO(sortedDates[i]),
        parseISO(sortedDates[i - 1])
      );
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Completion rate (last 30 days)
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const recentCompletions = completions.filter(c => c.date >= thirtyDaysAgo);
  const completionRate = (recentCompletions.length / 30) * 100;

  return {
    totalCompletions: completions.length,
    currentStreak,
    longestStreak,
    completionRate: Math.round(completionRate),
  };
};

export const getWeeklyProgress = (habitId: string): { date: string; completed: boolean }[] => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const completions = getCompletions().filter(c => c.habitId === habitId);
  const progress: { date: string; completed: boolean }[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = format(subDays(weekEnd, 6 - i), 'yyyy-MM-dd');
    const isCompleted = completions.some(c => c.date === date && c.completed);
    progress.push({ date, completed: isCompleted });
  }
  
  return progress;
};

export const getMonthlyProgress = (habitId: string): { date: string; completed: boolean }[] => {
  const today = new Date();
  const completions = getCompletions().filter(c => c.habitId === habitId);
  const progress: { date: string; completed: boolean }[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const isCompleted = completions.some(c => c.date === date && c.completed);
    progress.push({ date, completed: isCompleted });
  }
  
  return progress;
};
