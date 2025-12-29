'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { timeEstimateToSeconds, formatSecondsToTime } from '@/lib/timeUtils';
import CustomTimeInput from './ui/CustomTimeInput';

interface PomodoroTimerProps {
  habitName: string;
  timeEstimate?: string;
  onComplete?: () => void;
  onClose: () => void;
}

export default function PomodoroTimer({ habitName, timeEstimate = '15min', onComplete, onClose }: PomodoroTimerProps) {
  const getDuration = () => timeEstimateToSeconds(timeEstimate);

  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(getDuration());
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = useCustomTime ? (customHours * 60 * 60 + customMinutes * 60) : getDuration();
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Play completion sound
  const playCompletionSound = () => {
    // Create a pleasant notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a sequence of notes (C-E-G chord)
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playNote(523.25, now, 0.3); // C5
    playNote(659.25, now + 0.15, 0.3); // E5
    playNote(783.99, now + 0.3, 0.5); // G5
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playCompletionSound();
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);


  const handleReset = () => {
    const duration = useCustomTime ? (customHours * 60 * 60 + customMinutes * 60) : getDuration();
    setTimeLeft(duration);
    setIsRunning(false);
    setIsComplete(false);
  };

  const applyCustomTime = () => {
    const duration = customHours * 60 * 60 + customMinutes * 60;
    if (duration > 0) {
      setTimeLeft(duration);
      setIsRunning(false);
      setIsComplete(false);
    }
  };

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-ocean-900/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="card p-0 max-w-sm w-full animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 dark:from-ocean-600 dark:to-ocean-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white truncate pr-2">
              {habitName}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Close timer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Time Selection Toggle */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              onClick={() => {
                setUseCustomTime(false);
                setTimeLeft(getDuration());
                setIsRunning(false);
                setIsComplete(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !useCustomTime
                  ? 'bg-ocean-500 dark:bg-ocean-600 text-white'
                  : 'bg-ocean-100 dark:bg-dark-hover text-ocean-700 dark:text-dark-text-primary hover:bg-ocean-200 dark:hover:bg-dark-border'
              }`}
            >
              Preset ({timeEstimate})
            </button>
            <button
              onClick={() => {
                setUseCustomTime(true);
                applyCustomTime();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                useCustomTime
                  ? 'bg-ocean-500 dark:bg-ocean-600 text-white'
                  : 'bg-ocean-100 dark:bg-dark-hover text-ocean-700 dark:text-dark-text-primary hover:bg-ocean-200 dark:hover:bg-dark-border'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Time Inputs */}
          {useCustomTime && (
            <div className="mb-5">
              <CustomTimeInput
                hours={customHours}
                minutes={customMinutes}
                onHoursChange={setCustomHours}
                onMinutesChange={setCustomMinutes}
              />
              <div className="mt-2 flex justify-center">
                <button
                  onClick={applyCustomTime}
                  className="px-4 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg text-sm font-medium transition-colors"
                  title="Apply custom time"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Timer Circle */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-44 h-44">
              <svg className="transform -rotate-90 w-44 h-44">
                {/* Background circle */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-ocean-100 dark:stroke-dark-border"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className={`transition-all duration-1000 ${
                    isComplete 
                      ? 'stroke-success-500' 
                      : isRunning 
                      ? 'stroke-ocean-500 dark:stroke-ocean-400' 
                      : 'stroke-ocean-300 dark:stroke-ocean-600'
                  }`}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-ocean-800 dark:text-dark-text-primary">
                    {formatSecondsToTime(timeLeft)}
                  </div>
                  <div className="text-sm text-ocean-500 dark:text-dark-text-secondary mt-1">
                    {isComplete ? 'Complete!' : isRunning ? 'Stay focused' : 'Ready'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 bg-ocean-100 dark:bg-dark-hover hover:bg-ocean-200 dark:hover:bg-dark-border rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5 text-ocean-600 dark:text-dark-text-primary" />
            </button>
            
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={timeLeft === 0}
              className="p-5 bg-gradient-to-br from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 dark:from-ocean-500 dark:to-ocean-600 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
              title={isRunning ? 'Pause' : 'Start'}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-3 bg-ocean-100 dark:bg-dark-hover hover:bg-ocean-200 dark:hover:bg-dark-border rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              title="Close"
            >
              <X className="w-5 h-5 text-ocean-600 dark:text-dark-text-primary" />
            </button>
          </div>

          {/* Status messages */}
          {isRunning && (
            <div className="mt-5 p-3 bg-ocean-50 dark:bg-dark-hover border border-ocean-200 dark:border-dark-border rounded-lg">
              <p className="text-xs text-ocean-700 dark:text-dark-text-secondary text-center">
                🌊 Stay in the flow. You're doing great!
              </p>
            </div>
          )}

          {isComplete && (
            <div className="mt-5 p-3 bg-success-500/10 dark:bg-success-500/20 border border-success-500/30 rounded-lg">
              <p className="text-sm text-success-600 dark:text-success-400 text-center font-medium">
                🎉 Well done! Ready to mark complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
