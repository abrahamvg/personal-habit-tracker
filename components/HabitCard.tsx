'use client';

import { Habit } from '@/lib/types';
import { CheckCircle2, Circle, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isCompleted: boolean;
  categoryColor?: string;
  habitColor?: string;
}

export default function HabitCard({ 
  habit, 
  onToggle, 
  onDelete, 
  onEdit,
  isCompleted,
  categoryColor,
  habitColor = '#6d6450'
}: HabitCardProps) {

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className="mt-1 transition-transform hover:scale-110 active:scale-95"
          >
            {isCompleted ? (
              <CheckCircle2 
                className="w-6 h-6" 
                style={{ color: habitColor }}
              />
            ) : (
              <Circle 
                className="w-6 h-6 opacity-40" 
                style={{ color: habitColor }}
              />
            )}
          </button>

          {/* Habit Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-medium text-lg ${isCompleted ? 'line-through text-sand-500' : 'text-sand-900'}`}>
                {habit.name}
              </h3>
              {categoryColor && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: categoryColor }}
                />
              )}
              <span className={`badge text-xs font-medium ${
                habit.frequency === 'daily' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {habit.frequency}
              </span>
            </div>
            
            {habit.description && (
              <p className="text-sm text-sand-600 mt-1">{habit.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-beige-200 rounded-lg transition-colors"
            title="Edit habit"
          >
            <Edit className="w-4 h-4 text-sand-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-beige-200 rounded-lg transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4 text-sand-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
