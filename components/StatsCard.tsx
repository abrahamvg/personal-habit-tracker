'use client';

import { Trophy, Target } from 'lucide-react';

interface StatsCardProps {
  totalHabits: number;
  todayCompleted: number;
  totalStreak: number; // Keep for compatibility but won't use
}

export default function StatsCard({ totalHabits, todayCompleted, totalStreak }: StatsCardProps) {
  const completionPercentage = totalHabits > 0 
    ? Math.round((todayCompleted / totalHabits) * 100) 
    : 0;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-sand-900 mb-4">Today's Progress</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-beige-200 mb-3">
            <Target className="w-8 h-8 text-sand-700" />
          </div>
          <div className="text-3xl font-bold text-sand-900">{todayCompleted}/{totalHabits}</div>
          <div className="text-sm text-sand-600 mt-1.5">Tasks Completed</div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-beige-200 mb-3">
            <Trophy className="w-8 h-8 text-sand-700" />
          </div>
          <div className="text-3xl font-bold text-sand-900">{completionPercentage}%</div>
          <div className="text-sm text-sand-600 mt-1.5">Completion Rate</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-beige-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-sand-700 h-full transition-all duration-300 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
