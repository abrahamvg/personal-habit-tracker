'use client';

import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Habit } from '@/lib/types';
import { getCompletions } from '@/lib/storage';
import { useState, useEffect } from 'react';

interface HeatmapCalendarProps {
  habits: Habit[];
  onDayClick?: (date: string) => void;
}

export default function HeatmapCalendar({ habits, onDayClick }: HeatmapCalendarProps) {
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number; total: number }[]>([]);

  useEffect(() => {
    const completions = getCompletions();
    const activeHabits = habits.filter(h => !h.archived);
    
    // Generate last 364 days (52 weeks) for heatmap
    const data: { date: string; count: number; total: number }[] = [];
    
    for (let i = 363; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      // Count habits that existed on this date
      const existingHabits = activeHabits.filter(habit => {
        const habitCreatedDate = format(new Date(habit.createdAt), 'yyyy-MM-dd');
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
  }, [habits]);

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
    if (total === 0) return 'bg-beige-200 border-beige-300';
    const percentage = (count / total) * 100;
    
    if (percentage === 0) return 'bg-beige-200 border-beige-300';
    if (percentage <= 25) return 'bg-sand-300 border-sand-400';
    if (percentage <= 50) return 'bg-sand-400 border-sand-500';
    if (percentage <= 75) return 'bg-sand-600 border-sand-700';
    return 'bg-sand-800 border-sand-900';
  };

  const getTextColor = (count: number, total: number) => {
    if (total === 0) return 'text-sand-500';
    const percentage = (count / total) * 100;
    return percentage > 50 ? 'text-white' : 'text-sand-900';
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-sand-900">Activity Heatmap</h2>
        <p className="text-sm text-sand-600 mt-1">Your habit completion over the last year</p>
      </div>

      <div className="w-full">
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col gap-1 justify-start pt-5">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="h-3 w-6 flex items-center justify-center text-[10px] text-sand-700 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1 flex-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex-1 flex flex-col gap-1">
                {/* Month label for first week of month */}
                {weekIndex === 0 || (week[0] && new Date(week[0].date).getDate() <= 7) ? (
                  <div className="h-4 text-[10px] text-sand-700 font-semibold whitespace-nowrap">
                    {week[0] && format(new Date(week[0].date), 'MMM')}
                  </div>
                ) : (
                  <div className="h-4"></div>
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
                        h-3 w-full rounded-sm border transition-all
                        ${getHeatColor(day.count, day.total)}
                        ${isToday ? 'ring-1 ring-sand-900' : ''}
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
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sand-200">
        <span className="text-xs text-sand-700 font-medium">Less</span>
        <div className="flex gap-1.5">
          <div className="w-4 h-3 rounded-sm border bg-beige-200 border-beige-300" title="0%"></div>
          <div className="w-4 h-3 rounded-sm border bg-sand-300 border-sand-400" title="1-25%"></div>
          <div className="w-4 h-3 rounded-sm border bg-sand-400 border-sand-500" title="26-50%"></div>
          <div className="w-4 h-3 rounded-sm border bg-sand-600 border-sand-700" title="51-75%"></div>
          <div className="w-4 h-3 rounded-sm border bg-sand-800 border-sand-900" title="76-100%"></div>
        </div>
        <span className="text-xs text-sand-700 font-medium">More</span>
      </div>
    </div>
  );
}
