import { PriorityType } from './types';

/**
 * Priority configuration for consistent styling across the app
 */
export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    emoji: '🔴',
    order: 0,
    bgClass: 'bg-priority-high-100 dark:bg-priority-high-900/30',
    textClass: 'text-priority-high-700 dark:text-priority-high-400',
    ringClass: 'ring-1 ring-priority-high-300 dark:ring-priority-high-700',
    buttonActiveClass: 'bg-priority-high-500 text-white shadow-md',
    buttonInactiveClass: 'bg-white dark:bg-dark-card text-priority-high-600 dark:text-priority-high-400 border border-priority-high-200 dark:border-priority-high-800 hover:bg-priority-high-50 dark:hover:bg-priority-high-900/20',
  },
  medium: {
    label: 'Medium',
    emoji: '🟡',
    order: 1,
    bgClass: 'bg-priority-medium-100 dark:bg-priority-medium-900/30',
    textClass: 'text-priority-medium-700 dark:text-priority-medium-400',
    ringClass: 'ring-1 ring-priority-medium-300 dark:ring-priority-medium-700',
    buttonActiveClass: 'bg-priority-medium-500 text-white shadow-md',
    buttonInactiveClass: 'bg-white dark:bg-dark-card text-priority-medium-600 dark:text-priority-medium-400 border border-priority-medium-200 dark:border-priority-medium-800 hover:bg-priority-medium-50 dark:hover:bg-priority-medium-900/20',
  },
  low: {
    label: 'Low',
    emoji: '🟢',
    order: 2,
    bgClass: 'bg-priority-low-100 dark:bg-priority-low-900/30',
    textClass: 'text-priority-low-700 dark:text-priority-low-400',
    ringClass: 'ring-1 ring-priority-low-300 dark:ring-priority-low-700',
    buttonActiveClass: 'bg-priority-low-500 text-white shadow-md',
    buttonInactiveClass: 'bg-white dark:bg-dark-card text-priority-low-600 dark:text-priority-low-400 border border-priority-low-200 dark:border-priority-low-800 hover:bg-priority-low-50 dark:hover:bg-priority-low-900/20',
  },
} as const;

/**
 * Get priority display label with emoji
 */
export function getPriorityLabel(priority: PriorityType, includeEmoji = false): string {
  const config = PRIORITY_CONFIG[priority];
  return includeEmoji ? `${config.emoji} ${config.label}` : config.label;
}

/**
 * Get priority short label (for badges)
 */
export function getPriorityShortLabel(priority: PriorityType): string {
  return priority === 'medium' ? 'Med' : PRIORITY_CONFIG[priority].label;
}

/**
 * Get priority badge CSS classes
 */
export function getPriorityBadgeClasses(priority: PriorityType): string {
  const config = PRIORITY_CONFIG[priority];
  return `badge text-xs font-semibold flex items-center gap-1 ${config.bgClass} ${config.textClass} ${config.ringClass}`;
}

/**
 * Get priority button CSS classes
 */
export function getPriorityButtonClasses(priority: PriorityType, isActive: boolean): string {
  const config = PRIORITY_CONFIG[priority];
  return `flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
    isActive ? config.buttonActiveClass : config.buttonInactiveClass
  }`;
}

/**
 * Get priority order for sorting
 */
export function getPriorityOrder(priority?: PriorityType): number {
  return priority ? PRIORITY_CONFIG[priority].order : PRIORITY_CONFIG.medium.order;
}
