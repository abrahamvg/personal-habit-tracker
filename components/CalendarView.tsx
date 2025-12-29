'use client';

import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Habit } from '@/lib/types';
import { isHabitCompleted } from '@/lib/storage';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  habits: Habit[];
  onDayClick: (habit: Habit, date: string) => void;
}

export default function CalendarView({ habits, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const canGoNext = currentDate.getMonth() < today.getMonth() || 
                    currentDate.getFullYear() < today.getFullYear();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-sand-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-beige-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-sand-700" />
          </button>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="p-2 hover:bg-beige-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-sand-700" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {habits.filter(h => !h.archived).map((habit) => (
          <div key={habit.id} className="border-b border-sand-200 pb-4 last:border-b-0">
            <h3 className="text-sm font-medium text-sand-800 mb-3">{habit.name}</h3>
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = isHabitCompleted(habit.id, dateStr);
                const isToday = isSameDay(day, today);
                const isFuture = day > today;

                return (
                  <button
                    key={dateStr}
                    onClick={() => !isFuture && onDayClick(habit, dateStr)}
                    disabled={isFuture}
                    className={`
                      aspect-square rounded-lg text-xs font-medium transition-all
                      ${isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
                      ${isCompleted ? 'bg-sand-700 text-beige-50' : 'bg-beige-200 text-sand-700'}
                      ${isToday ? 'ring-2 ring-sand-400' : ''}
                    `}
                    title={format(day, 'MMM d')}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {habits.filter(h => !h.archived).length === 0 && (
          <div className="text-center py-8 text-sand-500">
            No habits to display. Add a habit to get started!
          </div>
        )}
      </div>
    </div>
  );
}
