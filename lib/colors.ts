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

// Create consistent category ordering for color assignment
export const getCategorySortedOrder = (habits: any[], categories: any[]) => {
  // Get unique category IDs from habits, including uncategorized
  const categoryIds = [...new Set(habits.map(h => h.category || 'uncategorized'))];
  
  // Sort by category name for consistent ordering
  return categoryIds.sort((a, b) => {
    const categoryA = categories.find(c => c.id === a);
    const categoryB = categories.find(c => c.id === b);
    const nameA = categoryA?.name || 'Uncategorized';
    const nameB = categoryB?.name || 'Uncategorized';
    return nameA.localeCompare(nameB);
  });
};

// Get category color by category ID using consistent ordering
export const getCategoryColor = (categoryId: string, habits: any[], categories: any[]) => {
  const sortedCategories = getCategorySortedOrder(habits, categories);
  const index = sortedCategories.indexOf(categoryId);
  return getHabitColor(index);
};
