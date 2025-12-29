// Centralized color configuration for habit tracking
// Use these colors consistently across checkboxes, charts, and other habit-related UI

// Opacity for area chart fills (hex values: 00=0%, 80=50%, FF=100%)
// Common values: 33=20%, 4D=30%, 66=40%, 80=50%, 99=60%, B3=70%, CC=80%
const AREA_FILL_OPACITY = '80'; // 50% opacity

export const HABIT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

// Get a specific habit color by index
export const getHabitColor = (index: number): string => {
  return HABIT_COLORS[index % HABIT_COLORS.length];
};

// For area charts - returns both line and fill colors
export const getHabitColorPair = (index: number) => {
  const color = getHabitColor(index);
  return {
    line: color,
    fill: `${color}${AREA_FILL_OPACITY}`,
  };
};
