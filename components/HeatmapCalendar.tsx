'use client';

import { format, subDays, startOfWeek } from 'date-fns';
import { Habit, HabitCompletion } from '@/lib/types';
import { formatToISODate } from '@/lib/timeUtils';
import { useState, useEffect } from 'react';

interface HeatmapCalendarProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onDayClick?: (date: string) => void;
}

export default function HeatmapCalendar({ habits, completions, onDayClick }: HeatmapCalendarProps) {
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number; total: number }[]>([]);

  useEffect(() => {
    const loadHeatmapData = () => {
      const activeHabits = habits.filter(h => !h.archived);
      
      // Generate last 364 days (52 weeks) for heatmap
      const data: { date: string; count: number; total: number }[] = [];
      
      for (let i = 363; i >= 0; i--) {
        const date = formatToISODate(subDays(new Date(), i));
        
        // Count habits that existed on this date
        const existingHabits = activeHabits.filter(habit => {
          const habitCreatedDate = formatToISODate(new Date(habit.createdAt));
          return date >= habitCreatedDate;
        });
        
        // Count completed habits for this date
        const completed = existingHabits.filter(habit => {
          return completions.some(c => c.habitId === habit.id && c.date === date && c.completed);
        }).length;
        
        data.push({ 
          date, 
          count: completed, 
          total: existingHabits.length 
        });
      }
      
      setHeatmapData(data);
    };
    
    loadHeatmapData();
  }, [habits, completions]);

  // Group by weeks (starting from Sunday)
  const weeks: { date: string; count: number; total: number }[][] = [];
  let currentWeek: { date: string; count: number; total: number }[] = [];
  
  // Find the first Sunday to start from
  const firstDate = heatmapData.length > 0 ? new Date(heatmapData[0].date) : new Date();
  const firstSunday = startOfWeek(firstDate, { weekStartsOn: 0 });
  
  heatmapData.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();
    
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(day);
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getHeatColor = (count: number, total: number) => {
    if (total === 0) return 'bg-ocean-50 border-ocean-200';
    const percentage = (count / total) * 100;
    
    if (percentage === 0) return 'bg-ocean-50 border-ocean-200';
    if (percentage <= 25) return 'bg-ocean-200 border-ocean-300';
    if (percentage <= 50) return 'bg-ocean-400 border-ocean-500';
    if (percentage <= 75) return 'bg-ocean-500 border-ocean-600';
    return 'bg-ocean-700 border-ocean-800';
  };

  const getTextColor = (count: number, total: number) => {
    if (total === 0) return 'text-sand-500';
    const percentage = (count / total) * 100;
    return percentage > 50 ? 'text-white' : 'text-sand-900';
  };

  const today = formatToISODate(new Date());
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-ocean-800 dark:text-dark-text-primary">Activity Heatmap</h2>
        <p className="text-sm text-ocean-600 dark:text-dark-text-secondary mt-1">Your habit completion over the last year</p>
      </div>

      {/* Scrollable container for mobile */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex gap-1 sm:gap-2 min-w-[700px]">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 sm:gap-1 justify-start pt-4 sm:pt-5 flex-shrink-0">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="h-2.5 sm:h-3 w-5 sm:w-6 flex items-center justify-center text-[8px] sm:text-[10px] text-ocean-600 dark:text-dark-text-secondary font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.5 sm:gap-1 flex-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex-1 flex flex-col gap-0.5 sm:gap-1 min-w-[10px]">
                {/* Month label for first week of month */}
                {weekIndex === 0 || (week[0] && new Date(week[0].date).getDate() <= 7) ? (
                  <div className="h-3 sm:h-4 text-[8px] sm:text-[10px] text-ocean-600 dark:text-dark-text-secondary font-semibold whitespace-nowrap">
                    {week[0] && format(new Date(week[0].date), 'MMM')}
                  </div>
                ) : (
                  <div className="h-3 sm:h-4"></div>
                )}
                
                {week.map((day, dayIndex) => {
                  const isToday = day.date === today;
                  const isFuture = new Date(day.date) > new Date();
                  
                  return (
                    <button
                      key={day.date}
                      onClick={() => !isFuture && onDayClick && onDayClick(day.date)}
                      disabled={isFuture}
                      className={`
                        h-2.5 sm:h-3 w-full rounded-sm border transition-all
                        ${getHeatColor(day.count, day.total)}
                        ${isToday ? 'ring-1 ring-ocean-600 dark:ring-ocean-400' : ''}
                        ${isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 hover:shadow-sm cursor-pointer'}
                      `}
                      title={`${format(new Date(day.date), 'MMM d, yyyy')}: ${day.count}/${day.total} habits completed`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-ocean-200 dark:border-dark-border">
        <span className="text-[10px] sm:text-xs text-ocean-600 dark:text-dark-text-secondary font-medium">Less</span>
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-3 sm:w-4 h-2.5 sm:h-3 rounded-sm border bg-ocean-50 border-ocean-200" title="0%"></div>
          <div className="w-3 sm:w-4 h-2.5 sm:h-3 rounded-sm border bg-ocean-200 border-ocean-300" title="1-25%"></div>
          <div className="w-3 sm:w-4 h-2.5 sm:h-3 rounded-sm border bg-ocean-400 border-ocean-500" title="26-50%"></div>
          <div className="w-3 sm:w-4 h-2.5 sm:h-3 rounded-sm border bg-ocean-500 border-ocean-600" title="51-75%"></div>
          <div className="w-3 sm:w-4 h-2.5 sm:h-3 rounded-sm border bg-ocean-700 border-ocean-800" title="76-100%"></div>
        </div>
        <span className="text-[10px] sm:text-xs text-ocean-600 dark:text-dark-text-secondary font-medium">More</span>
      </div>
    </div>
  );
}
