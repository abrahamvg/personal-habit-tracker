'use client';

import { format, subDays } from 'date-fns';
import { Habit } from '@/lib/types';
import { getCompletions } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { getHabitColorPair } from '@/lib/colors';

interface MultiLineProgressChartProps {
  habits: Habit[];
}

type Duration = 7 | 14 | 30 | 90;

type GroupBy = 'habits' | 'categories';

export default function MultiLineProgressChart({ habits }: MultiLineProgressChartProps) {
  const [duration, setDuration] = useState<Duration>(30);
  const [groupBy, setGroupBy] = useState<GroupBy>('habits');
  const [chartData, setChartData] = useState<{
    dates: string[];
    series: { habitId: string; habitName: string; data: number[]; color: string; fillColor: string }[];
  }>({ dates: [], series: [] });
  const [hoveredHabit, setHoveredHabit] = useState<{ name: string; color: string; completions: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const completions = getCompletions();
    const categories = require('@/lib/storage').getCategories();
    const activeHabits = habits.filter(h => !h.archived);
    
    if (activeHabits.length === 0) {
      setChartData({ dates: [], series: [] });
      return;
    }

    // Generate date range
    const dates: string[] = [];
    for (let i = duration - 1; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }

    let series;
    
    if (groupBy === 'habits') {
      // Group by individual habits
      series = activeHabits.map((habit, index) => {
        const data = dates.map(date => {
          const habitCreatedDate = format(new Date(habit.createdAt), 'yyyy-MM-dd');
          
          // Check if habit was completed on this specific date
          if (date >= habitCreatedDate) {
            const isCompleted = completions.some(
              c => c.habitId === habit.id && c.date === date && c.completed
            );
            return isCompleted ? 1 : 0;
          }
          
          return 0;
        });

        const colorPair = getHabitColorPair(index);
        return {
          habitId: habit.id,
          habitName: habit.name,
          data,
          color: colorPair.line,
          fillColor: colorPair.fill,
        };
      });
    } else {
      // Group by categories
      const categoryGroups = new Map<string, typeof activeHabits>();
      
      activeHabits.forEach(habit => {
        const categoryId = habit.category || 'uncategorized';
        if (!categoryGroups.has(categoryId)) {
          categoryGroups.set(categoryId, []);
        }
        categoryGroups.get(categoryId)!.push(habit);
      });
      
      series = Array.from(categoryGroups.entries()).map(([categoryId, categoryHabits], index) => {
        const category = categories.find((c: any) => c.id === categoryId);
        const categoryName = category?.name || 'Uncategorized';
        
        const data = dates.map(date => {
          // Count completed habits in this category for this date
          let completed = 0;
          categoryHabits.forEach(habit => {
            const habitCreatedDate = format(new Date(habit.createdAt), 'yyyy-MM-dd');
            if (date >= habitCreatedDate) {
              const isCompleted = completions.some(
                c => c.habitId === habit.id && c.date === date && c.completed
              );
              if (isCompleted) completed++;
            }
          });
          return completed;
        });
        
        const colorPair = getHabitColorPair(index);
        return {
          habitId: categoryId,
          habitName: categoryName,
          data,
          color: colorPair.line,
          fillColor: colorPair.fill,
        };
      });
    }

    setChartData({ dates, series });
  }, [habits, duration, groupBy]);

  if (chartData.series.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sand-500">No habits to display progress for yet.</p>
      </div>
    );
  }

  // Chart dimensions
  const width = 900;
  const height = 300;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value for scaling - for stacked charts, we need the max sum per day
  const maxValue = Math.max(
    ...chartData.dates.map((_, dateIndex) => 
      chartData.series.reduce((sum, series) => sum + series.data[dateIndex], 0)
    ),
    1
  );

  // Generate grid lines (5 horizontal lines)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(percent => ({
    y: padding.top + chartHeight * (1 - percent),
    value: Math.round(maxValue * percent),
  }));

  return (
    <div className="space-y-4">
      {/* Header with duration and group by selectors */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sand-700" />
            <h2 className="text-lg font-semibold text-sand-900">Completion Trend</h2>
          </div>
          <div className="flex gap-3">
            {/* Group By Selector */}
            <div className="flex gap-2">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="px-3 py-1.5 bg-beige-100 border border-sand-200 rounded-lg text-sm font-medium text-sand-900 focus:outline-none focus:ring-2 focus:ring-sand-400"
              >
                <option value="habits">Habits</option>
                <option value="categories">Categories</option>
              </select>
            </div>
            {/* Duration Selector */}
            <div className="flex gap-2">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as Duration)}
                className="px-3 py-1.5 bg-beige-100 border border-sand-200 rounded-lg text-sm font-medium text-sand-900 focus:outline-none focus:ring-2 focus:ring-sand-400"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: '300px' }}>
            {/* Grid lines */}
            {gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={line.y}
                  x2={width - padding.right}
                  y2={line.y}
                  stroke="#ddd9cc"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? '0' : '4,4'}
                />
                <text
                  x={padding.left - 10}
                  y={line.y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-sand-600"
                >
                  {line.value}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {chartData.dates
              .filter((_, i) => {
                // Show fewer labels for longer durations
                if (duration === 90) return i % 15 === 0 || i === chartData.dates.length - 1;
                if (duration === 30) return i % 5 === 0 || i === chartData.dates.length - 1;
                if (duration === 14) return i % 2 === 0 || i === chartData.dates.length - 1;
                return true;
              })
              .map((date, displayIndex, arr) => {
                const originalIndex = chartData.dates.indexOf(date);
                const x = padding.left + (originalIndex / (chartData.dates.length - 1)) * chartWidth;
                return (
                  <text
                    key={date}
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-[10px] fill-sand-600"
                  >
                    {format(new Date(date), 'MMM d')}
                  </text>
                );
              })}

            {/* Stacked area charts for each habit */}
            {chartData.series.map((series, seriesIndex) => {
              // Calculate stacked positions - each habit stacks on top of previous ones
              const points = series.data.map((value, dateIndex) => {
                const x = padding.left + (dateIndex / (chartData.dates.length - 1)) * chartWidth;
                
                // Calculate the baseline (sum of all previous habits at this date)
                const baseline = chartData.series
                  .slice(0, seriesIndex)
                  .reduce((sum, s) => sum + s.data[dateIndex], 0);
                
                // Calculate the top (baseline + this habit's value)
                const top = baseline + value;
                
                const yBaseline = padding.top + chartHeight - (baseline / maxValue) * chartHeight;
                const yTop = padding.top + chartHeight - (top / maxValue) * chartHeight;
                
                return { x, yBaseline, yTop, value };
              });

              // Create the area path (from baseline to top)
              const topPath = points.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x},${p.yTop}`
              ).join(' ');
              
              const bottomPath = points.map(p => 
                `${p.x},${p.yBaseline}`
              ).reverse().join(' L ');
              
              const areaPath = `${topPath} L ${bottomPath} Z`;
              
              // Create line path for the top edge
              const linePath = points.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x},${p.yTop}`
              ).join(' ');

              const totalCompletions = series.data.reduce((sum, val) => sum + val, 0);
              
              return (
                <g 
                  key={series.habitId}
                  onMouseEnter={(e) => {
                    setHoveredHabit({
                      name: series.habitName,
                      color: series.color,
                      completions: totalCompletions,
                    });
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    setTooltipPosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredHabit(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Area fill with hex opacity */}
                  <path
                    d={areaPath}
                    fill={series.fillColor}
                  />
                  
                  {/* Top edge line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points on top edge */}
                  {points.map((point, i) => {
                    // Only show point if this habit was completed on this day
                    if (point.value === 0) return null;
                    return (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.yTop}
                        r="3.5"
                        fill={series.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="#9a917d"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#9a917d"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Hover Tooltip - Pill shaped */}
      {hoveredHabit && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 12}px`,
            top: `${tooltipPosition.y - 40}px`,
          }}
        >
          <div
            className="px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: `${hoveredHabit.color}20`,
              borderLeft: `3px solid ${hoveredHabit.color}`,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredHabit.color }}
            />
            <span className="text-sm font-semibold text-sand-900">
              {hoveredHabit.name}
            </span>
            <span className="text-xs text-sand-600">
              • {hoveredHabit.completions} days
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
