'use client';

import { useState, useRef } from 'react';
import { Habit, Category } from '@/lib/types';
import { GripVertical } from 'lucide-react';
import HabitCard from './HabitCard';
import { getCategoryColor } from '@/lib/colors';

interface DraggableHabitListProps {
  habits: Habit[];
  categories: Category[];
  completions: Map<string, boolean>;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onStartTimer?: (habit: Habit) => void;
  onSubtaskToggle: (habitId: string, subtaskId: string) => void;
  onPin: (habitId: string) => void;
  onArchive: (habitId: string) => void;
  onReorder: (habitIds: string[]) => void;
}

export default function DraggableHabitList({
  habits,
  categories,
  completions,
  onToggle,
  onDelete,
  onEdit,
  onStartTimer,
  onSubtaskToggle,
  onPin,
  onArchive,
  onReorder,
}: DraggableHabitListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    
    // Add some visual feedback
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      dragCounter.current = 0;
      return;
    }

    // Reorder the habits array
    const reorderedHabits = [...habits];
    const [draggedHabit] = reorderedHabits.splice(draggedIndex, 1);
    reorderedHabits.splice(dropIndex, 0, draggedHabit);

    // Get the new order of habit IDs
    const newOrder = reorderedHabits.map(h => h.id);
    onReorder(newOrder);

    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  return (
    <div className="space-y-3">
      {habits.map((habit, index) => {
        const category = categories.find(c => c.id === habit.category);
        const isDragging = draggedIndex === index;
        const showDropLineAbove = dragOverIndex === index && draggedIndex !== null && draggedIndex > index;
        const showDropLineBelow = dragOverIndex === index && draggedIndex !== null && draggedIndex < index;
        
        return (
          <div key={habit.id} className="relative">
            {/* Drop indicator line ABOVE */}
            {showDropLineAbove && (
              <div className="absolute left-0 right-0 -top-1.5 z-20">
                <div className="h-1 bg-ocean-500 dark:bg-ocean-400 rounded-full shadow-lg" />
              </div>
            )}
            
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                transition-opacity duration-200
                ${isDragging ? 'opacity-50' : 'opacity-100'}
              `}
            >
              <div className="relative group">
                {/* Drag Handle */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
                  <GripVertical className="w-5 h-5 text-ocean-400 dark:text-dark-text-tertiary" />
                </div>
                
                <HabitCard
                  habit={habit}
                  onToggle={() => onToggle(habit.id)}
                  onDelete={() => onDelete(habit.id)}
                  onEdit={() => onEdit(habit)}
                  onStartTimer={onStartTimer ? () => onStartTimer(habit) : undefined}
                  onSubtaskToggle={(subtaskId) => onSubtaskToggle(habit.id, subtaskId)}
                  onPin={() => onPin(habit.id)}
                  onArchive={() => onArchive(habit.id)}
                  isCompleted={completions.get(habit.id) === true}
                  categoryColor={category ? getCategoryColor(category.id, habits, categories) : undefined}
                  categoryName={category?.name}
                />
              </div>
            </div>
            
            {/* Drop indicator line BELOW */}
            {showDropLineBelow && (
              <div className="absolute left-0 right-0 -bottom-1.5 z-20">
                <div className="h-1 bg-ocean-500 dark:bg-ocean-400 rounded-full shadow-lg" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
