'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface StreakIndicatorProps {
  totalHabits: number;
  completedToday: number;
}

export default function StreakIndicator({ totalHabits, completedToday }: StreakIndicatorProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(completedToday);
  
  const completionPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const isFullyComplete = totalHabits > 0 && completedToday === totalHabits;

  useEffect(() => {
    // Trigger celebration when going from not complete to complete
    if (isFullyComplete && prevCompleted < totalHabits) {
      setShowCelebration(true);
      
      // Fire confetti from top - explosive burst then graceful fall
      const count = 600;
      
      // Fire from multiple positions across the top for full coverage
      function fireFromPosition(x: number, particleRatio: number, opts: any) {
        confetti({
          origin: { x, y: 0.1 },
          angle: 90,
          gravity: 1.0, // Balanced gravity for visible fall
          particleCount: Math.floor(count * particleRatio),
          ...opts,
        });
      }

      // Explosion from left side
      fireFromPosition(0.1, 0.15, {
        spread: 100,
        startVelocity: 65,
        ticks: 400,
        scalar: 1.2,
      });
      fireFromPosition(0.1, 0.12, {
        spread: 80,
        startVelocity: 50,
        scalar: 1.3,
      });

      // Explosion from center - BIGGEST
      fireFromPosition(0.5, 0.2, {
        spread: 130,
        startVelocity: 75,
        ticks: 400,
        scalar: 1.3,
      });
      fireFromPosition(0.5, 0.15, {
        spread: 100,
        startVelocity: 60,
        scalar: 1.1,
      });

      // Explosion from right side
      fireFromPosition(0.9, 0.15, {
        spread: 100,
        startVelocity: 65,
        ticks: 400,
        scalar: 1.2,
      });
      fireFromPosition(0.9, 0.12, {
        spread: 80,
        startVelocity: 50,
        scalar: 1.3,
      });

      // Extra bursts for more coverage
      fireFromPosition(0.3, 0.1, {
        spread: 90,
        startVelocity: 55,
        scalar: 1.1,
      });
      fireFromPosition(0.7, 0.1, {
        spread: 90,
        startVelocity: 55,
        scalar: 1.1,
      });
      
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
    setPrevCompleted(completedToday);
  }, [isFullyComplete, completedToday, totalHabits, prevCompleted]);

  if (totalHabits === 0) {
    return null;
  }

  // Don't show anything if no tasks completed
  if (completedToday === 0) {
    return <div className="w-16 h-16" />; // Spacer to maintain layout
  }

  return (
    <div className="relative">
      {/* Filling Flame using lucide-react Flame icon */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0">
          <defs>
            {/* Gradient for the fill - ocean themed */}
            <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0096c7" stopOpacity="1">
                <animate
                  attributeName="stopColor"
                  values="#0096c7;#00b4d8;#0096c7"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#48cae4" stopOpacity="1">
                <animate
                  attributeName="stopColor"
                  values="#48cae4;#90e0ef;#48cae4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>
          
          {/* Flame icon path from lucide-react */}
          <g transform="translate(16, 12) scale(1.3)">
            <defs>
              {/* Mask for filling from bottom to top - positioned relative to flame */}
              <mask id="flameFillMask">
                <rect 
                  x="-10" 
                  y={(1 - completionPercentage / 100) * 30}
                  width="50" 
                  height="30"
                  fill="white"
                  style={{
                    transition: 'y 0.5s ease-out',
                  }}
                />
              </mask>
            </defs>
            
            {/* Outline stroke */}
            <path
              d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
              fill="none"
              className="stroke-ocean-500 dark:stroke-ocean-300"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Filled flame */}
            <path
              d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
              fill="url(#flameGradient)"
              mask="url(#flameFillMask)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
