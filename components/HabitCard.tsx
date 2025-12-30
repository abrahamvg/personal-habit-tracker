'use client';

import { Habit } from '@/lib/types';
import { CheckCircle2, Circle, Trash2, Edit, Clock, Timer, ChevronDown, ChevronUp, Pin, Archive, ArchiveRestore } from 'lucide-react';
import { useState } from 'react';
import { formatTimeEstimate } from '@/lib/timeUtils';
import PriorityBadge from './ui/PriorityBadge';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onStartTimer?: () => void;
  onSubtaskToggle?: (subtaskId: string) => void;
  onPin?: () => void;
  onArchive?: () => void;
  isCompleted: boolean;
  categoryColor?: string;
  categoryName?: string;
}

export default function HabitCard({ 
  habit, 
  onToggle, 
  onDelete, 
  onEdit,
  onStartTimer,
  onSubtaskToggle,
  onPin,
  onArchive,
  isCompleted, 
  categoryColor,
  categoryName,
}: HabitCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  
  const subtaskProgress = habit.subtasks
    ? habit.subtasks.filter(st => st.completed).length / habit.subtasks.length
    : 0;

  return (
    <div className="card p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className="mt-1 transition-transform hover:scale-110 active:scale-95"
          >
            {isCompleted ? (
              <CheckCircle2 
                className="w-6 h-6 text-ocean-500 dark:text-ocean-400" 
              />
            ) : (
              <Circle 
                className="w-6 h-6 text-ocean-300 dark:text-ocean-600 opacity-60" 
              />
            )}
          </button>

          {/* Habit Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-medium text-lg ${isCompleted ? 'line-through text-sand-500 dark:text-dark-text-tertiary' : 'text-sand-900 dark:text-dark-text-primary'}`}>
                {habit.name}
              </h3>
              
              {/* Priority Badge */}
              {habit.priority && <PriorityBadge priority={habit.priority} />}
              
              {/* Time Estimate Badge */}
              {habit.timeEstimate && (
                <span className="badge text-xs font-medium bg-sand-100 dark:bg-dark-hover text-sand-700 dark:text-dark-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeEstimate(habit.timeEstimate)}
                </span>
              )}
              
              {habit.category && categoryColor && categoryName && (
                <span 
                  className="badge text-xs font-medium text-white"
                  style={{ backgroundColor: categoryColor }}
                >
                  {categoryName}
                </span>
              )}
            </div>
            
            {habit.description && (
              <p className="text-sm text-sand-600 dark:text-dark-text-secondary mt-1">{habit.description}</p>
            )}
            
            {/* Subtasks Progress Bar */}
            {habit.subtasks && habit.subtasks.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-sand-600 dark:text-dark-text-tertiary font-medium">
                    {habit.subtasks.filter(st => st.completed).length}/{habit.subtasks.length} subtasks
                  </span>
                  <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="text-xs text-sand-600 dark:text-dark-text-tertiary hover:text-sand-900 dark:hover:text-dark-text-primary flex items-center gap-1 transition-colors"
                  >
                    {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showSubtasks ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="w-full h-2 bg-beige-200 dark:bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-priority-low-500 transition-all duration-300"
                    style={{ width: `${subtaskProgress * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Subtasks List */}
            {habit.subtasks && habit.subtasks.length > 0 && showSubtasks && (
              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-sand-200 dark:border-dark-border">
                {habit.subtasks.map((subtask) => (
                  <button
                    key={subtask.id}
                    onClick={() => onSubtaskToggle && onSubtaskToggle(subtask.id)}
                    className="flex items-center gap-2 text-sm text-left hover:bg-beige-100 dark:hover:bg-dark-hover p-1.5 rounded transition-colors w-full"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-priority-low-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-sand-400 dark:text-dark-text-tertiary flex-shrink-0" />
                    )}
                    <span className={subtask.completed ? 'line-through text-sand-500 dark:text-dark-text-tertiary' : 'text-sand-700 dark:text-dark-text-secondary'}>
                      {subtask.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onPin && (
            <button
              onClick={onPin}
              className="p-2 rounded-lg group"
              title={habit.pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
            >
              <Pin 
                className={`w-4 h-4 transition-all group-hover:rotate-12 ${
                  habit.pinned 
                    ? 'text-ocean-600 dark:text-ocean-400 rotate-12' 
                    : 'text-sand-600 dark:text-dark-text-secondary'
                }`}
                fill={habit.pinned ? 'currentColor' : 'none'}
              />
            </button>
          )}
          {onStartTimer && habit.timeEstimate && (
            <button
              onClick={onStartTimer}
              className="p-2 hover:bg-priority-medium-100 dark:hover:bg-priority-medium-900/30 rounded-lg transition-colors group"
              title="Start Pomodoro timer"
            >
              <Timer className="w-4 h-4 text-priority-medium-600 dark:text-priority-medium-400 group-hover:text-priority-medium-700 dark:group-hover:text-priority-medium-300" />
            </button>
          )}
          {onArchive && (
            <button
              onClick={onArchive}
              className="p-2 hover:bg-beige-200 dark:hover:bg-dark-hover rounded-lg transition-colors"
              title={habit.archived ? 'Unarchive habit' : 'Archive habit'}
            >
              {habit.archived ? (
                <ArchiveRestore className="w-4 h-4 text-sand-600 dark:text-dark-text-secondary" />
              ) : (
                <Archive className="w-4 h-4 text-sand-600 dark:text-dark-text-secondary" />
              )}
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 hover:bg-beige-200 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Edit habit"
          >
            <Edit className="w-4 h-4 text-sand-600 dark:text-dark-text-secondary" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-beige-200 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4 text-sand-600 dark:text-dark-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
