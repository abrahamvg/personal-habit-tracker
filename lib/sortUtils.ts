import { Habit } from './types';

/**
 * Sort habits with pinned habits first, then by order
 * Pinned habits maintain their relative order among themselves
 */
export const sortHabitsWithPinnedFirst = (habits: Habit[]): Habit[] => {
  const pinned = habits.filter(h => h.pinned);
  const unpinned = habits.filter(h => !h.pinned);
  
  // Sort each group by order
  pinned.sort((a, b) => (a.order || 0) - (b.order || 0));
  unpinned.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return [...pinned, ...unpinned];
};
