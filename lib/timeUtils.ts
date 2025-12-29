import { TimeEstimate } from './types';

/**
 * Preset time configurations
 */
const TIME_PRESETS = {
  '5min': { minutes: 5, display: '5m' },
  '15min': { minutes: 15, display: '15m' },
  '30min': { minutes: 30, display: '30m' },
  '1hr': { minutes: 60, display: '1h' },
} as const;

/**
 * Parse time estimate into hours and minutes
 * @internal
 */
function parseTimeEstimate(timeEstimate: string): { hours: number; minutes: number } | null {
  // Check if it's a preset format
  if (timeEstimate in TIME_PRESETS) {
    const mins = TIME_PRESETS[timeEstimate as keyof typeof TIME_PRESETS].minutes;
    return { hours: Math.floor(mins / 60), minutes: mins % 60 };
  }
  
  // Check if it's custom format (HH:MM)
  if (timeEstimate.includes(':')) {
    const [hrs, mins] = timeEstimate.split(':').map(Number);
    if (!isNaN(hrs) && !isNaN(mins)) {
      return { hours: hrs, minutes: mins };
    }
  }
  
  return null;
}

/**
 * Converts time estimate to total minutes
 * Handles both preset formats (5min, 15min, etc.) and custom format (HH:MM)
 */
export function timeEstimateToMinutes(timeEstimate?: TimeEstimate): number {
  if (!timeEstimate) return 0;
  
  const parsed = parseTimeEstimate(timeEstimate);
  if (!parsed) return 0;
  
  return parsed.hours * 60 + parsed.minutes;
}

/**
 * Converts time estimate to total seconds (for timers)
 */
export function timeEstimateToSeconds(timeEstimate?: TimeEstimate): number {
  return timeEstimateToMinutes(timeEstimate) * 60;
}

/**
 * Formats time estimate for display
 * Converts preset formats and custom HH:MM to readable format
 */
export function formatTimeEstimate(timeEstimate: string | undefined): string {
  if (!timeEstimate) return '';
  
  // Check if it's a preset format - use pre-defined display string
  if (timeEstimate in TIME_PRESETS) {
    return TIME_PRESETS[timeEstimate as keyof typeof TIME_PRESETS].display;
  }
  
  // Parse custom format
  const parsed = parseTimeEstimate(timeEstimate);
  if (!parsed) return timeEstimate;
  
  const { hours, minutes } = parsed;
  
  if (hours === 0 && minutes === 0) return '0m';
  
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  return parts.join(' ');
}

/**
 * Formats seconds to MM:SS display format
 */
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 * Centralized to ensure consistency across the app
 */
export function formatToISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Validate the date object
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date passed to formatToISODate:', date);
    return new Date().toISOString().split('T')[0]; // Return today's date as fallback
  }
  
  return dateObj.toISOString().split('T')[0];
}
