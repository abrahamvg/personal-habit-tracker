'use client';

import { format, subDays } from 'date-fns';
import { Habit } from '@/lib/types';
import { getMonthlyProgress } from '@/lib/stats';
import { useEffect, useState } from 'react';

interface ProgressChartProps {
  habit: Habit;
}

export default function ProgressChart({ habit }: ProgressChartProps) {
  const [progress, setProgress] = useState<{ date: string; completed: boolean }[]>([]);

  useEffect(() => {
    const data = getMonthlyProgress(habit.id);
    setProgress(data);
  }, [habit.id]);

  // Get last 14 days for display
  const last14Days = progress.slice(-14);

  if (last14Days.length === 0) {
    return null;
  }

  const maxHeight = 60;
  const completedCount = last14Days.filter(d => d.completed).length;
  const completionRate = Math.round((completedCount / last14Days.length) * 100);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-sand-900">{habit.name}</h3>
          <p className="text-xs text-sand-600 mt-0.5">Last 14 days</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-sand-900">{completionRate}%</div>
          <div className="text-xs text-sand-600">Completion</div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-1 h-16">
        {last14Days.map((day, index) => {
          const height = day.completed ? maxHeight : 12;
          
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${format(new Date(day.date), 'MMM d')}: ${day.completed ? 'Completed' : 'Not completed'}`}
            >
              <div
                className={`w-full rounded-sm transition-all ${
                  day.completed ? 'bg-sand-700' : 'bg-beige-300'
                }`}
                style={{ height: `${height}px` }}
              />
            </div>
          );
        })}
      </div>

      {/* Date labels (show first and last) */}
      <div className="flex justify-between mt-2 text-xs text-sand-500">
        <span>{format(new Date(last14Days[0].date), 'MMM d')}</span>
        <span>{format(new Date(last14Days[last14Days.length - 1].date), 'MMM d')}</span>
      </div>
    </div>
  );
}
