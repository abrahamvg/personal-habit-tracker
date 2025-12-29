'use client';

interface CustomTimeInputProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  maxHours?: number;
  maxMinutes?: number;
}

/**
 * Reusable custom time input component with hours and minutes
 */
export default function CustomTimeInput({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  maxHours = 23,
  maxMinutes = 59,
}: CustomTimeInputProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-beige-50 dark:bg-dark-hover rounded-lg">
      <div className="flex flex-col items-center">
        <label className="text-xs text-sand-600 dark:text-dark-text-tertiary mb-1 font-medium">
          Hours
        </label>
        <input
          type="number"
          min="0"
          max={maxHours}
          value={hours}
          onChange={(e) => {
            const val = Math.max(0, Math.min(maxHours, parseInt(e.target.value) || 0));
            onHoursChange(val);
          }}
          className="w-16 px-2 py-2 text-center bg-white dark:bg-dark-card border border-sand-200 dark:border-dark-border rounded-lg font-semibold text-sand-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sand-400 dark:focus:ring-sand-500"
        />
      </div>
      <span className="text-2xl font-bold text-sand-400 dark:text-dark-text-tertiary mt-5">:</span>
      <div className="flex flex-col items-center">
        <label className="text-xs text-sand-600 dark:text-dark-text-tertiary mb-1 font-medium">
          Minutes
        </label>
        <input
          type="number"
          min="0"
          max={maxMinutes}
          value={minutes}
          onChange={(e) => {
            const val = Math.max(0, Math.min(maxMinutes, parseInt(e.target.value) || 0));
            onMinutesChange(val);
          }}
          className="w-16 px-2 py-2 text-center bg-white dark:bg-dark-card border border-sand-200 dark:border-dark-border rounded-lg font-semibold text-sand-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sand-400 dark:focus:ring-sand-500"
        />
      </div>
    </div>
  );
}
