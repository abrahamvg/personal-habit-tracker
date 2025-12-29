# Habit Tracker

A beautiful, minimal habit tracker with cool beige aesthetics built with Next.js.

## Features

- 📅 Track daily and weekly habits
- 🔥 Streak counters for motivation
- 📊 Progress visualization with charts
- 🏷️ Organize habits with categories
- 📱 Fully responsive design
- 💾 Local storage persistence
- 🎨 Cool beige minimal aesthetic

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- date-fns (date utilities)

## Code Organization

### Color Configuration

All habit colors are centrally managed in `lib/colors.ts` to maintain consistency across:
- Habit checkboxes (list view)
- Area charts (progress view)
- Any other habit-related UI

**To change habit colors**, simply update the `HABIT_COLORS` array in `lib/colors.ts`:

```typescript
export const HABIT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  // ... add or modify colors here
];
```

The colors will automatically update everywhere in the app!

## Deploy on Vercel

The easiest way to deploy your habit tracker is to use the [Vercel Platform](https://vercel.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
