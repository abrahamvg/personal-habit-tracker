'use client';

import { format, subDays } from 'date-fns';
import { Habit } from '@/lib/types';
import { getCompletions } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendLineChartProps {
  habits: Habit[];
  days?: number;
}

export default function TrendLineChart({ habits, days = 30 }: TrendLineChartProps) {
  const [trendData, setTrendData] = useState<{ date: string; completionRate: number }[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    const completions = getCompletions();
    const activeHabits = habits.filter(h => !h.archived);
    
    if (activeHabits.length === 0) {
      setTrendData([]);
      return;
    }

    // Calculate completion rate for each day
    const data: { date: string; completionRate: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      // Count completed habits for this date
      const completed = activeHabits.filter(habit => {
        const habitCreatedDate = format(new Date(habit.createdAt), 'yyyy-MM-dd');
        // Only count habits that existed on this date
        if (date < habitCreatedDate) return false;
        
        return completions.some(c => c.habitId === habit.id && c.date === date && c.completed);
      }).length;
      
      // Count habits that existed on this date
      const existingHabits = activeHabits.filter(habit => {
        const habitCreatedDate = format(new Date(habit.createdAt), 'yyyy-MM-dd');
        return date >= habitCreatedDate;
      }).length;
      
      const rate = existingHabits > 0 ? (completed / existingHabits) * 100 : 0;
      data.push({ date, completionRate: rate });
    }
    
    setTrendData(data);

    // Calculate trend (comparing last 7 days to previous 7 days)
    if (data.length >= 14) {
      const recent7 = data.slice(-7).reduce((sum, d) => sum + d.completionRate, 0) / 7;
      const previous7 = data.slice(-14, -7).reduce((sum, d) => sum + d.completionRate, 0) / 7;
      const diff = recent7 - previous7;
      
      if (diff > 5) setTrend('up');
      else if (diff < -5) setTrend('down');
      else setTrend('stable');
    }
  }, [habits, days]);

  if (trendData.length === 0) {
    return null;
  }

  // Calculate chart dimensions
  const width = 800; // SVG units
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min and max for scaling
  const maxRate = Math.max(...trendData.map(d => d.completionRate), 100);
  const minRate = Math.min(...trendData.map(d => d.completionRate), 0);
  const range = maxRate - minRate || 100;

  // Create SVG path
  const points = trendData.map((d, i) => {
    const x = (i / (trendData.length - 1)) * chartWidth + padding;
    const y = height - padding - ((d.completionRate - minRate) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  
  // Create area path (for gradient fill)
  const areaPath = `${linePath} L ${chartWidth + padding},${height - padding} L ${padding},${height - padding} Z`;

  // Calculate average
  const avgRate = trendData.reduce((sum, d) => sum + d.completionRate, 0) / trendData.length;

  // Get trend color
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-700';
    if (trend === 'down') return 'text-red-700';
    return 'text-sand-700';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-sand-900">Completion Trend</h2>
          <p className="text-sm text-sand-600 mt-1">Last {days} days</p>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1.5 font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{avgRate.toFixed(0)}%</span>
          </div>
          <p className="text-xs text-sand-600 mt-0.5">Average</p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="currentColor"
            strokeWidth="1"
            className="text-sand-300"
          />
          <line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={width - padding}
            y2={padding + chartHeight / 2}
            stroke="currentColor"
            strokeWidth="1"
            className="text-sand-300"
            strokeDasharray="4,4"
          />
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="currentColor"
            strokeWidth="1"
            className="text-sand-300"
            strokeDasharray="4,4"
          />

          {/* Area fill with gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6d6450" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6d6450" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6d6450"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Data points */}
          {points.map((point, i) => {
            const [x, y] = point.split(',').map(Number);
            const isToday = i === points.length - 1;
            
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isToday ? '6' : '3'}
                  fill="#6d6450"
                  className="transition-all duration-200"
                />
                {isToday && (
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="none"
                    stroke="#6d6450"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-4 text-xs text-sand-500">
          {maxRate.toFixed(0)}%
        </div>
        <div className="absolute left-0 bottom-4 text-xs text-sand-500">
          {minRate.toFixed(0)}%
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-sand-500 px-5">
        <span>{format(subDays(new Date(), days - 1), 'MMM d')}</span>
        <span>Today</span>
      </div>

      {/* Trend message */}
      <div className="mt-4 pt-4 border-t border-sand-200">
        <p className="text-sm text-sand-700">
          {trend === 'up' && '🎉 Great job! Your completion rate is trending upward!'}
          {trend === 'down' && '📉 Your completion rate has dipped. Let\'s get back on track!'}
          {trend === 'stable' && '📊 You\'re maintaining a steady pace. Keep it consistent!'}
        </p>
      </div>
    </div>
  );
}
