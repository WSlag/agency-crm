import React, { useState, useMemo } from 'react';
import {
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

type TimeRange = '7d' | '30d' | '3m' | '1y';

interface TrendsChartProps {
  title: string;
  data?: number[];
  labels?: string[];
  color?: string;
  branchId?: string;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  title,
  data = [],
  labels = [],
  color = 'indigo',
  branchId
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Generate mock trend data based on time range
  const trendData = useMemo(() => {
    const points = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '3m' ? 90 : 365;
    if (data.length > 0) return data.slice(-points);
    
    // Generate mock data
    return Array.from({ length: points }, (_, i) => 
      Math.floor(Math.random() * 50) + 30 + (i * 0.5)
    );
  }, [timeRange, data]);

  const maxValue = Math.max(...trendData, 1);
  const minValue = Math.min(...trendData);
  const currentValue = trendData[trendData.length - 1];
  const previousValue = trendData[trendData.length - 2] || currentValue;
  const percentChange = previousValue > 0 
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { line: string; fill: string; badge: string }> = {
      indigo: {
        line: 'stroke-indigo-500',
        fill: 'fill-indigo-100',
        badge: percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      },
      teal: {
        line: 'stroke-teal-500',
        fill: 'fill-teal-100',
        badge: percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      },
      purple: {
        line: 'stroke-purple-500',
        fill: 'fill-purple-100',
        badge: percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }
    };
    return colors[color] || colors.indigo;
  };

  const colorClasses = getColorClasses(color);

  // Generate SVG path
  const generatePath = () => {
    const width = 100;
    const height = 100;
    const points = trendData.map((value, index) => {
      const x = (index / (trendData.length - 1)) * width;
      const y = height - ((value - minValue) / (maxValue - minValue)) * height;
      return `${x},${y}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return { linePath, fillPath };
  };

  const { linePath, fillPath } = generatePath();

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '3m', label: '3M' },
    { value: '1y', label: '1Y' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500">Trend over time</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`
                  px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium transition-all
                  ${timeRange === range.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Value and Change */}
        <div className="mt-4 flex items-baseline space-x-3">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {currentValue.toFixed(0)}
          </div>
          {percentChange !== 0 && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
              {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        <div className="relative w-full" style={{ paddingTop: '40%' }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Fill */}
            <path
              d={fillPath}
              className={`${colorClasses.fill} opacity-20`}
            />
            {/* Line */}
            <path
              d={linePath}
              className={colorClasses.line}
              fill="none"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {/* Data points */}
            {trendData.map((value, index) => {
              const x = (index / (trendData.length - 1)) * 100;
              const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  className={colorClasses.line}
                  fill="currentColor"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>
              {timeRange === '7d' && 'Last 7 days'}
              {timeRange === '30d' && 'Last 30 days'}
              {timeRange === '3m' && 'Last 3 months'}
              {timeRange === '1y' && 'Last year'}
            </span>
          </div>
          <div>
            Min: {minValue.toFixed(0)} | Max: {maxValue.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
};

